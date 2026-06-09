/**
 * PestGuard AI — Weather Service
 * 
 * Ported from old_version/backend/weather/service.py (383 lines)
 * 
 * Features:
 *   - Open-Meteo API integration
 *   - FAO/WHO spray safety assessment
 *   - 7-day forecast with per-day spray safety
 *   - Turkish Met Office (MGM) alert zones
 *   - Wind direction, UV index awareness
 */

import axios from 'axios';

// ── Spray Safety Thresholds (FAO Guidelines) ──
const SPRAY_THRESHOLDS = {
  temperature: { min: 10, max: 30, ideal_min: 15, ideal_max: 25 },
  wind_speed: { max: 15, ideal_max: 10 },  // km/h
  humidity: { min: 40, max: 90, ideal_min: 50, ideal_max: 80 },
  precipitation: { max: 0 },  // mm — must be zero
  cloud_cover: { max: 80 },   // percent
};

// ── Turkish Metropolitan Weather Zones ──
const TURKEY_REGIONS = {
  marmara: { lat_range: [39.5, 42], lon_range: [26, 30], risk_note: "Temperate — fungal diseases common in spring" },
  aegean: { lat_range: [37, 39.5], lon_range: [26, 30], risk_note: "Mediterranean — olive pest corridor" },
  mediterranean: { lat_range: [36, 37.5], lon_range: [29, 37], risk_note: "Hot — citrus pest pressure peaks summer" },
  central_anatolia: { lat_range: [38, 40], lon_range: [30, 37], risk_note: "Continental — wheat/barley pest season Mar-Jul" },
  black_sea: { lat_range: [40.5, 42], lon_range: [30, 42], risk_note: "Humid — high disease pressure year-round" },
  southeast: { lat_range: [36, 38], lon_range: [37, 45], risk_note: "Irrigated — cotton pest hotspot" },
  east: { lat_range: [38, 42], lon_range: [40, 45], risk_note: "Cold winters — short but intense pest season" },
};

/**
 * Assess spray safety from weather conditions
 */
function assessSpraySafety(temp, wind, rain, humidity = null, cloudCover = null) {
  const issues = [];
  let score = 100;

  // Temperature check
  if (temp < SPRAY_THRESHOLDS.temperature.min) {
    issues.push(`Temperature too low (${temp}°C < ${SPRAY_THRESHOLDS.temperature.min}°C)`);
    score -= 30;
  } else if (temp > SPRAY_THRESHOLDS.temperature.max) {
    issues.push(`Temperature too high (${temp}°C > ${SPRAY_THRESHOLDS.temperature.max}°C) — evaporation risk`);
    score -= 25;
  } else if (temp < SPRAY_THRESHOLDS.temperature.ideal_min || temp > SPRAY_THRESHOLDS.temperature.ideal_max) {
    issues.push(`Temperature not ideal (${temp}°C) — reduced efficacy possible`);
    score -= 10;
  }

  // Wind check
  if (wind > SPRAY_THRESHOLDS.wind_speed.max) {
    issues.push(`Wind too strong (${wind} km/h > ${SPRAY_THRESHOLDS.wind_speed.max} km/h) — spray drift risk`);
    score -= 40;
  } else if (wind > SPRAY_THRESHOLDS.wind_speed.ideal_max) {
    issues.push(`Wind moderate (${wind} km/h) — use low-drift nozzles`);
    score -= 15;
  }

  // Rain check
  if (rain > 0) {
    issues.push(`Active precipitation (${rain}mm) — spray will wash off`);
    score -= 50;
  }

  // Humidity check
  if (humidity !== null) {
    if (humidity < SPRAY_THRESHOLDS.humidity.min) {
      issues.push(`Humidity too low (${humidity}%) — rapid evaporation`);
      score -= 15;
    } else if (humidity > SPRAY_THRESHOLDS.humidity.max) {
      issues.push(`Humidity very high (${humidity}%) — poor drying`);
      score -= 10;
    }
  }

  // Cloud cover — high UV with low cloud can degrade some pesticides
  if (cloudCover !== null && cloudCover < 20) {
    issues.push("Clear sky — UV may degrade some pesticides faster");
    score -= 5;
  }

  score = Math.max(0, score);
  const is_safe = score >= 60;
  const status = score >= 80 ? "EXCELLENT" : score >= 60 ? "ACCEPTABLE" : score >= 40 ? "MARGINAL" : "UNSAFE";

  return { is_safe, status, score, issues };
}

/**
 * Identify Turkish region from coordinates
 */
function identifyTurkeyRegion(lat, lon) {
  for (const [name, region] of Object.entries(TURKEY_REGIONS)) {
    if (lat >= region.lat_range[0] && lat <= region.lat_range[1] &&
        lon >= region.lon_range[0] && lon <= region.lon_range[1]) {
      return { region: name, ...region };
    }
  }
  return null;
}

/**
 * Fetch current weather + spray safety for coordinates
 */
export async function getCurrentWeather(lat, lon) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,wind_direction_10m,cloud_cover,weather_code` +
      `&timezone=auto`;

    const res = await axios.get(url, { timeout: 8000 });
    const current = res.data.current;

    const spraySafety = assessSpraySafety(
      current.temperature_2m,
      current.wind_speed_10m,
      current.precipitation,
      current.relative_humidity_2m,
      current.cloud_cover
    );

    const turkeyRegion = identifyTurkeyRegion(lat, lon);

    return {
      location: { latitude: lat, longitude: lon },
      current: {
        temperature: current.temperature_2m,
        humidity: current.relative_humidity_2m,
        precipitation: current.precipitation,
        wind_speed: current.wind_speed_10m,
        wind_direction: current.wind_direction_10m,
        cloud_cover: current.cloud_cover,
        weather_code: current.weather_code,
      },
      spray_safety: spraySafety,
      region: turkeyRegion,
      source: "Open-Meteo",
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("[Weather] API error:", error.message);
    return {
      error: "Weather service unavailable",
      location: { latitude: lat, longitude: lon },
      spray_safety: { is_safe: false, status: "UNKNOWN", score: 0, issues: ["Weather data unavailable"] },
      fallback: true,
    };
  }
}

/**
 * Fetch 7-day forecast with spray safety per day
 */
export async function getForecast(lat, lon) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,weather_code` +
      `&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,cloud_cover` +
      `&timezone=auto`;

    const res = await axios.get(url, { timeout: 8000 });
    const { daily, current } = res.data;

    const days = daily.time.map((date, idx) => {
      const avgTemp = (daily.temperature_2m_max[idx] + daily.temperature_2m_min[idx]) / 2;
      const safety = assessSpraySafety(
        daily.temperature_2m_max[idx],
        daily.wind_speed_10m_max[idx],
        daily.precipitation_sum[idx]
      );

      return {
        date,
        day_name: idx === 0 ? "Today" : new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
        temperature: { max: daily.temperature_2m_max[idx], min: daily.temperature_2m_min[idx], avg: Math.round(avgTemp * 10) / 10 },
        precipitation: daily.precipitation_sum[idx],
        wind_speed_max: daily.wind_speed_10m_max[idx],
        weather_code: daily.weather_code[idx],
        spray_safety: safety,
      };
    });

    const safeDays = days.filter(d => d.spray_safety.is_safe).length;
    const turkeyRegion = identifyTurkeyRegion(lat, lon);

    // Current weather for spray assessment
    const currentSafety = assessSpraySafety(
      current.temperature_2m,
      current.wind_speed_10m,
      current.precipitation,
      current.relative_humidity_2m,
      current.cloud_cover
    );

    return {
      location: { latitude: lat, longitude: lon },
      current: {
        temperature: current.temperature_2m,
        humidity: current.relative_humidity_2m,
        precipitation: current.precipitation,
        wind_speed: current.wind_speed_10m,
        cloud_cover: current.cloud_cover,
        spray_safety: currentSafety,
      },
      forecast: days,
      summary: {
        safe_days: safeDays,
        unsafe_days: 7 - safeDays,
        best_day: days.reduce((best, day) => day.spray_safety.score > best.spray_safety.score ? day : best, days[0]),
      },
      region: turkeyRegion,
      source: "Open-Meteo",
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("[Weather] Forecast error:", error.message);
    return { error: "Forecast service unavailable", fallback: true };
  }
}

export default { getCurrentWeather, getForecast, assessSpraySafety };
