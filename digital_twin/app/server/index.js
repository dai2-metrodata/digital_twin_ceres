const express = require('express');
const snowflake = require('snowflake-sdk');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

function getConnection() {
  const tokenPath = '/snowflake/session/token';
  const token = fs.readFileSync(tokenPath, 'utf-8').trim();

  const host = process.env.SNOWFLAKE_HOST || '';

  return snowflake.createConnection({
    accessUrl: `https://${host}`,
    account: process.env.SNOWFLAKE_ACCOUNT || host.split('.')[0] || '',
    authenticator: 'OAUTH',
    token: token,
    warehouse: process.env.SNOWFLAKE_WAREHOUSE || 'COMPUTE_WH',
    database: process.env.SNOWFLAKE_DATABASE || 'CERES_DIGITAL_TWIN',
    schema: process.env.SNOWFLAKE_SCHEMA || 'DIGITAL_TWIN_ANALYTICS',
  });
}

function queryAsync(conn, sql) {
  return new Promise((resolve, reject) => {
    conn.execute({
      sqlText: sql,
      complete: (err, stmt, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    });
  });
}

async function fetchAllConfig(conn) {
  const [
    processParams,
    kpiThresholds,
    materials,
    sensors,
    rawMaterials,
    transportModes,
    warehouseConfig,
    dailyOrders
  ] = await Promise.all([
    queryAsync(conn, 'SELECT * FROM PROCESS_PARAMS'),
    queryAsync(conn, 'SELECT * FROM KPI_THRESHOLDS'),
    queryAsync(conn, 'SELECT * FROM MATERIALS'),
    queryAsync(conn, 'SELECT * FROM SENSORS'),
    queryAsync(conn, 'SELECT * FROM RAW_MATERIALS'),
    queryAsync(conn, 'SELECT * FROM TRANSPORT_MODES'),
    queryAsync(conn, 'SELECT * FROM WAREHOUSE_CONFIG'),
    queryAsync(conn, 'SELECT * FROM DAILY_ORDERS'),
  ]);

  return {
    processParams: Object.fromEntries(
      processParams.map(r => [r.PARAM_KEY, {
        label: r.LABEL, unit: r.UNIT, min: r.MIN_VAL, max: r.MAX_VAL, default: r.DEFAULT_VAL
      }])
    ),
    kpiThresholds: Object.fromEntries(
      kpiThresholds.map(r => [r.KPI_KEY, { good: r.GOOD_THRESHOLD, warning: r.WARNING_THRESHOLD }])
    ),
    materials: materials.map(r => ({
      id: r.MATERIAL_ID, name: r.NAME, cuttingSpeedFactor: r.CUTTING_SPEED_FACTOR, feedFactor: r.FEED_FACTOR
    })),
    sensors: sensors.map(r => ({
      id: r.SENSOR_ID, type: r.SENSOR_TYPE, location: r.LOCATION, position: [r.POS_X, r.POS_Y, r.POS_Z]
    })),
    supplyChainDefaults: {
      rawMaterials: rawMaterials.map(r => ({
        id: r.MATERIAL_ID, name: r.NAME, unit: r.UNIT, stock: r.STOCK,
        reorderPoint: r.REORDER_POINT, leadTimeDays: r.LEAD_TIME_DAYS
      })),
      transportModes: transportModes.map(r => ({
        id: r.MODE_ID, name: r.NAME, capacity: r.CAPACITY, unit: r.UNIT,
        transitDays: r.TRANSIT_DAYS, costPerUnit: r.COST_PER_UNIT
      })),
      warehouse: Object.fromEntries(
        warehouseConfig.map(r => [r.CONFIG_KEY, Number(r.CONFIG_VALUE)])
      ),
      dailyOrders: Object.fromEntries(
        dailyOrders.map(r => [r.CONFIG_KEY, Number(r.CONFIG_VALUE)])
      )
    }
  };
}

// Add unit to warehouse config
function formatWarehouse(wh) {
  return { ...wh, unit: 'finished rails' };
}

let cachedConfig = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 60000;

app.get('/api/config', async (req, res) => {
  try {
    const now = Date.now();
    if (cachedConfig && (now - cacheTimestamp) < CACHE_TTL_MS) {
      return res.json(cachedConfig);
    }

    const conn = getConnection();
    await new Promise((resolve, reject) => {
      conn.connect((err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    const config = await fetchAllConfig(conn);
    config.supplyChainDefaults.warehouse = formatWarehouse(config.supplyChainDefaults.warehouse);

    cachedConfig = config;
    cacheTimestamp = now;

    conn.destroy();
    res.json(config);
  } catch (err) {
    console.error('Config fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch config', detail: err.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
