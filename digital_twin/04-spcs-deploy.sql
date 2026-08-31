-- ============================================================
-- UNISIGN Digital Twin — SPCS Deployment
-- Run after the data is seeded (tables below) and the Docker
-- image has been pushed to the Snowflake image registry.
-- ============================================================
CREATE DATABASE IF NOT EXISTS CERES_DIGITAL_TWIN;
CREATE SCHEMA IF NOT EXISTS CERES_DIGITAL_TWIN.DIGITAL_TWIN_ANALYTICS;

USE DATABASE CERES_DIGITAL_TWIN;
USE SCHEMA DIGITAL_TWIN_ANALYTICS;
USE WAREHOUSE COMPUTE_WH;

-- ============================================================
-- 1. Configuration Tables
-- ============================================================
CREATE TABLE IF NOT EXISTS PROCESS_PARAMS (
  PARAM_KEY VARCHAR(50) PRIMARY KEY,
  LABEL VARCHAR(100),
  UNIT VARCHAR(20),
  MIN_VAL FLOAT,
  MAX_VAL FLOAT,
  DEFAULT_VAL FLOAT
);

CREATE TABLE IF NOT EXISTS KPI_THRESHOLDS (
  KPI_KEY VARCHAR(50) PRIMARY KEY,
  GOOD_THRESHOLD FLOAT,
  WARNING_THRESHOLD FLOAT
);

CREATE TABLE IF NOT EXISTS MATERIALS (
  MATERIAL_ID VARCHAR(50) PRIMARY KEY,
  NAME VARCHAR(100),
  CUTTING_SPEED_FACTOR FLOAT,
  FEED_FACTOR FLOAT
);

CREATE TABLE IF NOT EXISTS SENSORS (
  SENSOR_ID VARCHAR(50) PRIMARY KEY,
  SENSOR_TYPE VARCHAR(50),
  LOCATION VARCHAR(100),
  POS_X FLOAT,
  POS_Y FLOAT,
  POS_Z FLOAT
);

CREATE TABLE IF NOT EXISTS RAW_MATERIALS (
  MATERIAL_ID VARCHAR(50) PRIMARY KEY,
  NAME VARCHAR(100),
  UNIT VARCHAR(20),
  STOCK FLOAT,
  REORDER_POINT FLOAT,
  LEAD_TIME_DAYS INT
);

CREATE TABLE IF NOT EXISTS TRANSPORT_MODES (
  MODE_ID VARCHAR(50) PRIMARY KEY,
  NAME VARCHAR(100),
  CAPACITY FLOAT,
  UNIT VARCHAR(20),
  TRANSIT_DAYS INT,
  COST_PER_UNIT FLOAT
);

CREATE TABLE IF NOT EXISTS WAREHOUSE_CONFIG (
  CONFIG_KEY VARCHAR(50) PRIMARY KEY,
  CONFIG_VALUE FLOAT,
  UNIT VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS DAILY_ORDERS (
  CONFIG_KEY VARCHAR(50) PRIMARY KEY,
  CONFIG_VALUE FLOAT
);

-- ============================================================
-- 2. Seed Data (only insert if tables are empty)
-- ============================================================
INSERT INTO PROCESS_PARAMS
  SELECT * FROM (
    SELECT 'cuttingSpeed','Cutting Speed (Vc)','m/min',20,200,80 UNION ALL
    SELECT 'feedRate','Feed Rate (f)','mm/min',5,32000,500 UNION ALL
    SELECT 'spindleSpeed','Spindle Speed','RPM',100,4000,1592 UNION ALL
    SELECT 'zeroPointCorrection','Zero-Point Correction','mm',-0.5,0.5,0 UNION ALL
    SELECT 'railLength','Rail Length','ft',5,25,12
  ) WHERE NOT EXISTS (SELECT 1 FROM PROCESS_PARAMS);

INSERT INTO KPI_THRESHOLDS
  SELECT * FROM (
    SELECT 'oee',85,65 UNION ALL SELECT 'availability',90,75 UNION ALL
    SELECT 'performance',95,80 UNION ALL SELECT 'quality',99,95 UNION ALL
    SELECT 'railAccuracy',0.01,0.05 UNION ALL SELECT 'vibration',2.5,5.0 UNION ALL
    SELECT 'axisError',0.005,0.02 UNION ALL SELECT 'mtbf',500,200 UNION ALL
    SELECT 'mttr',2,6 UNION ALL SELECT 'toolLife',80,40
  ) WHERE NOT EXISTS (SELECT 1 FROM KPI_THRESHOLDS);

INSERT INTO MATERIALS
  SELECT * FROM (
    SELECT 'mild_steel','Mild Steel',1.0,1.0 UNION ALL
    SELECT 'cast_iron','Cast Iron',0.7,0.8 UNION ALL
    SELECT 'stainless','Stainless Steel',0.5,0.6 UNION ALL
    SELECT 'aluminum','Aluminum',2.0,1.5
  ) WHERE NOT EXISTS (SELECT 1 FROM MATERIALS);

INSERT INTO SENSORS
  SELECT * FROM (
    SELECT 'temp1','Temperature','Spindle Head',0,2.5,0.5 UNION ALL
    SELECT 'vib1','Vibration','Rail Top',-1.5,1.8,0 UNION ALL
    SELECT 'vib2','Vibration','Rail Bottom',-1.5,-0.5,0 UNION ALL
    SELECT 'pos1','Position','Gantry X',0,2,-1 UNION ALL
    SELECT 'pos2','Position','Gantry Y',1,2,0 UNION ALL
    SELECT 'load1','Load Cell','Tool Holder',0,2.8,0 UNION ALL
    SELECT 'flow1','Coolant Flow','Nozzle',0.5,2.3,0.5 UNION ALL
    SELECT 'acoustic1','Acoustic','Enclosure',2,1.5,1 UNION ALL
    SELECT 'power1','Power','Main Drive',-2,0.5,-1
  ) WHERE NOT EXISTS (SELECT 1 FROM SENSORS);

INSERT INTO RAW_MATERIALS
  SELECT * FROM (
    SELECT 'steel_billet','Steel Billet','tons',45,20,7 UNION ALL
    SELECT 'cutting_tools','Cutting Tools','sets',12,5,3 UNION ALL
    SELECT 'coolant','Coolant Fluid','liters',800,200,2
  ) WHERE NOT EXISTS (SELECT 1 FROM RAW_MATERIALS);

INSERT INTO TRANSPORT_MODES
  SELECT * FROM (
    SELECT 'truck','Truck',20,'tons',2,150 UNION ALL
    SELECT 'train','Train',100,'tons',5,80
  ) WHERE NOT EXISTS (SELECT 1 FROM TRANSPORT_MODES);

INSERT INTO WAREHOUSE_CONFIG
  SELECT * FROM (
    SELECT 'capacity',200,'finished rails' UNION ALL
    SELECT 'currentStock',85,'finished rails'
  ) WHERE NOT EXISTS (SELECT 1 FROM WAREHOUSE_CONFIG);

INSERT INTO DAILY_ORDERS
  SELECT * FROM (
    SELECT 'min',5 UNION ALL SELECT 'max',25 UNION ALL SELECT 'average',12
  ) WHERE NOT EXISTS (SELECT 1 FROM DAILY_ORDERS);

-- ============================================================
-- 3. Image Repository
-- ============================================================
CREATE IMAGE REPOSITORY IF NOT EXISTS IMAGE_REPO;

-- Show the repository URL — you'll need it for `docker tag` / `docker push`.
SHOW IMAGE REPOSITORIES LIKE 'IMAGE_REPO';
-- docker login <repository_url> -u <username>
-- docker build -t <repository_url>/digital_twin_ceres:latest .
-- docker push <repository_url>/digital_twin_ceres:latest

-- ============================================================
-- 4. Compute Pool
-- ============================================================
CREATE COMPUTE POOL IF NOT EXISTS DIGITAL_TWIN_POOL
  MIN_NODES = 1
  MAX_NODES = 1
  INSTANCE_FAMILY = CPU_X64_XS
  AUTO_RESUME = TRUE
  AUTO_SUSPEND_SECS = 300;

DESCRIBE COMPUTE POOL DIGITAL_TWIN_POOL;

-- ============================================================
-- 5. Create the Service
-- ============================================================
DROP SERVICE IF EXISTS DIGITAL_TWIN_APP;

CREATE SERVICE DIGITAL_TWIN_APP
  IN COMPUTE POOL DIGITAL_TWIN_POOL
  FROM SPECIFICATION $$
spec:
  containers:
    - name: unisign-digital-twin
      image: /CERES_DIGITAL_TWIN/DIGITAL_TWIN_ANALYTICS/IMAGE_REPO/digital_twin_ceres:latest
      env:
        SNOWFLAKE_WAREHOUSE: COMPUTE_WH
        SNOWFLAKE_DATABASE: CERES_DIGITAL_TWIN
        SNOWFLAKE_SCHEMA: DIGITAL_TWIN_ANALYTICS
      resources:
        requests:
          cpu: 0.5
          memory: 1Gi
        limits:
          cpu: 2
          memory: 4Gi
  endpoints:
    - name: app
      port: 8000
      public: true
$$
  QUERY_WAREHOUSE = 'COMPUTE_WH'
  MIN_INSTANCES = 1
  MAX_INSTANCES = 1;

-- ============================================================
-- 6. Verify
-- ============================================================
SELECT SYSTEM$GET_SERVICE_STATUS('DIGITAL_TWIN_APP');
SHOW ENDPOINTS IN SERVICE DIGITAL_TWIN_APP;

-- ============================================================
-- Useful management commands
-- ============================================================
-- View logs:        SELECT SYSTEM$GET_SERVICE_LOGS('DIGITAL_TWIN_APP', 0, 'unisign-digital-twin', 100);
-- Suspend service:  ALTER SERVICE DIGITAL_TWIN_APP SUSPEND;
-- Resume service:   ALTER SERVICE DIGITAL_TWIN_APP RESUME;
-- Drop service:     DROP SERVICE DIGITAL_TWIN_APP;
-- Drop pool:        DROP COMPUTE POOL DIGITAL_TWIN_POOL;
