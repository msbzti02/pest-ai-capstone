@echo off
set "PATH=C:\Program Files\nodejs;%PATH%"

echo ===================================================
echo PestAI - Microservices Launcher
echo ===================================================

echo [1/3] Python ML Servisi Baslatiliyor (Port 8000)...
start "ML Service (FastAPI)" cmd /k "cd ml_service && ..\venv\Scripts\uvicorn main:app --port 8000"

echo [2/3] Node.js API Gateway Baslatiliyor (Port 5000)...
start "Node.js API Gateway" cmd /k "cd server && node index.js"

echo [3/3] React.js Arayuzu Baslatiliyor (Port 3000)...
start "React Frontend" cmd /k "cd client && npm run dev"

echo.
echo ===================================================
echo Tum servisler ayri siyah pencerelerde baslatildi!
echo Ilk acilista (ozellikle React) birkac saniye surebilir.
echo ===================================================
echo.
echo Lutfen tarayicinizdan su adrese gidin: 
echo http://localhost:3000
echo.
pause
