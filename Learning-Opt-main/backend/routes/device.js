import express from "express";
import { db } from "../db.js";
import { sendCommand } from "../server.js";

const router = express.Router();

/* ───────── WEB COMMAND ───────── */
router.post("/command/:cmd", async (req, res) => {
  const cmd = req.params.cmd.toUpperCase();
  console.log("🌐 WEB CMD →", cmd);

  const sent = sendCommand(cmd);
  if (!sent) return res.status(503).json({ error: "ESP32 offline" });

  await db.query(
    `INSERT INTO detection_bypass_logs (action, source, status, details)
     VALUES (?, 'web', 'SENT', 'Manual web control')`,
    [cmd]
  );

  res.json({ ok: true });
});

/* ───────── ACK FROM ESP32 (FIXED) ───────── */
router.post("/ack", async (req, res) => {
  const { action, source } = req.body; // { action:"ON", source:"web" }
  console.log("🔄 ACK:", action, source);

  // ✅ Upgrade the latest SENT row into SUCCESS
  const [result] = await db.query(
    `UPDATE detection_bypass_logs
     SET status='SUCCESS', details='ESP32 acknowledged'
     WHERE source=? AND action=? AND status='SENT'
     ORDER BY created_at DESC
     LIMIT 1`,
    [source, action]
  );

  // If none updated, ACK may be duplicate/late; accept silently
  if (result.affectedRows === 0) {
    console.log("⏭️ No SENT row to ACK (duplicate/late)");
    return res.json({ ok: true });
  }

  await db.query(
    `UPDATE system_state
     SET alarm_status=?, last_event=?, last_source=?
     WHERE id=1`,
    [action === "ON" ? "ON" : "OFF", action, source]
  );

  res.json({ ok: true });
});

/* ───────── PHYSICAL BYPASS (MISSING BEFORE) ───────── */
router.post("/physical-bypass", async (req, res) => {
  const { action, source, status, details } = req.body;
  console.log("🖲️ PHYSICAL:", action, source);

  await db.query(
    `INSERT INTO bypass_logs (action, source, status, details)
     VALUES (?, ?, ?, ?)`,
    [action, source || "device", status || "SUCCESS", details || "Physical button"]
  );

  await db.query(
    `UPDATE system_state
     SET alarm_status=?, last_event=?, last_source=?
     WHERE id=1`,
    [action === "ON" ? "ON" : "OFF", action, "device"]
  );

  res.json({ ok: true });
});

/* ───────── SENSOR TRIGGER ───────── */
router.post("/sensor-detection", async (_, res) => {
  console.log("🎯 SENSOR TRIGGER");

  await db.query(
    `INSERT INTO detection_sensor_logs (event, source, status, details)
     VALUES ('TRIGGERED','sensor','ACTIVE','Pendulum triggered')`
  );

  await db.query(
    `UPDATE system_state
     SET alarm_status='ON', last_event='SENSOR', last_source='sensor'
     WHERE id=1`
  );

  res.json({ ok: true });
});

/* ───────── AUTO STOP ───────── */
router.post("/auto-stop", async (req, res) => {
  const { source, details } = req.body;
  console.log("⏱ AUTO STOP:", source);

  if (source === "sensor") {
    await db.query(
      `INSERT INTO detection_sensor_logs (event,source,status,details)
       VALUES ('AUTO_STOP','sensor','SUCCESS',?)`,
      [details]
    );
  } else if (source === "web") {
    await db.query(
      `INSERT INTO detection_bypass_logs (action,source,status,details)
       VALUES ('AUTO_STOP','web','SUCCESS',?)`,
      [details]
    );
  } else {
    await db.query(
      `INSERT INTO bypass_logs (action,source,status,details)
       VALUES ('AUTO_STOP','device','SUCCESS',?)`,
      [details]
    );
  }

  await db.query(
    `UPDATE system_state
     SET alarm_status='OFF', last_event='AUTO_STOP', last_source=?
     WHERE id=1`,
    [source || "system"]
  );

  res.json({ ok: true });
});

/* ───────── SYSTEM STATE ───────── */
router.get("/state", async (_, res) => {
  const [[row]] = await db.query(
    "SELECT alarm_status, last_event, last_source FROM system_state WHERE id=1"
  );
  res.json(row);
});

/* ───────── FETCH LOGS ───────── */
router.get("/sensor-logs", async (_, res) => {
  const [r] = await db.query(
    "SELECT * FROM detection_sensor_logs ORDER BY created_at DESC"
  );
  res.json(r);
});

router.get("/web-bypass-logs", async (_, res) => {
  const [r] = await db.query(
    "SELECT * FROM detection_bypass_logs ORDER BY created_at DESC"
  );
  res.json(r);
});

router.get("/device-bypass-logs", async (_, res) => {
  const [r] = await db.query(
    "SELECT * FROM bypass_logs ORDER BY created_at DESC"
  );
  res.json(r);
});

/* ───────── CLEAR LOGS (FOR FRONTEND "CLEAR CURRENT") ───────── */
router.delete("/sensor-logs", async (_, res) => {
  await db.query("DELETE FROM detection_sensor_logs");
  res.json({ ok: true });
});

router.delete("/web-bypass-logs", async (_, res) => {
  await db.query("DELETE FROM detection_bypass_logs");
  res.json({ ok: true });
});

router.delete("/device-bypass-logs", async (_, res) => {
  await db.query("DELETE FROM bypass_logs");
  res.json({ ok: true });
});

export default router;
