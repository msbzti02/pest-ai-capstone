import test from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import { app, sequelize, server } from '../index.js';

test('API Endpoints', async (t) => {
  await t.test('setup database', async () => {
    await sequelize.sync({ force: true });
  });

  await t.test('GET /health should return 200', async () => {
    const res = await request(app).get('/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'healthy');
  });

  await t.test('GET /pest-library should return list of pests', async () => {
    const res = await request(app).get('/pest-library');
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body.pests));
  });

  await t.test('POST /economic-impact should return calculations', async () => {
    const res = await request(app)
      .post('/economic-impact')
      .send({
        pest_name: 'Fall Armyworm',
        crop: 'corn',
        field_size_ha: 10,
        infestation_level: 'moderate'
      });
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.total_value_usd !== undefined);
    assert.ok(res.body.financial_loss_usd !== undefined);
  });
  
  await t.test('GET /weather/:lat/:lon should return weather and spray safety', async () => {
    const res = await request(app).get('/weather/39.9208/32.8541');
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.current !== undefined);
    assert.ok(res.body.spray_safety !== undefined);
  });

  await t.test('teardown', async () => {
    await sequelize.close();
  });
});
