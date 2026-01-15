import express from "express";
import { db } from "../db.js";
import { sendCommand } from "../server.js";

const router = express.Router();

/* WEB CONTROL */
router.post("/command/:cmd", async (req,res)=>{
  const cmd = req.params.cmd.toUpperCase();

  sendCommand(cmd);

  await db.query(
    "INSERT INTO detection_bypass_logs (action,source,status,details) VALUES (?,?,?,?)",
    [cmd,"web","ACKED","Manual control from web app"]
  );

  res.json({ ok:true });
});

/* PHYSICAL */
router.post("/physical-bypass", async (req,res)=>{
  const { action, source, status, details } = req.body;

  await db.query(
    "INSERT INTO bypass_logs (action,source,status,details) VALUES (?,?,?,?)",
    [action,source,status,details]
  );

  res.json({ ok:true });
});

/* AUTO STOP */
router.post("/auto-stop", async (req,res)=>{
  const { source, details } = req.body;

  await db.query(
    "INSERT INTO detection_bypass_logs (action,source,status,details) VALUES (?,?,?,?)",
    ["AUTO_STOP",source,"SUCCESS",details]
  );

  res.json({ ok:true });
});

/* ACK */
router.post("/ack", async (req,res)=>{
  res.json({ ok:true });
});

/* FETCH */
router.get("/sensor-logs", async(req,res)=>{
  const [rows] = await db.query(
    "SELECT * FROM detection_sensor_logs ORDER BY created_at DESC"
  );
  res.json(rows);
});

router.get("/web-bypass-logs", async(req,res)=>{
  const [rows] = await db.query(
    "SELECT * FROM detection_bypass_logs ORDER BY created_at DESC"
  );
  res.json(rows);
});

router.get("/device-bypass-logs", async(req,res)=>{
  const [rows] = await db.query(
    "SELECT * FROM bypass_logs ORDER BY created_at DESC"
  );
  res.json(rows);
});

/* CLEAR */
router.delete("/sensor-logs", async(req,res)=>{
  await db.query("TRUNCATE detection_sensor_logs");
  res.json({ok:true});
});

router.delete("/web-bypass-logs", async(req,res)=>{
  await db.query("TRUNCATE detection_bypass_logs");
  res.json({ok:true});
});

router.delete("/device-bypass-logs", async(req,res)=>{
  await db.query("TRUNCATE bypass_logs");
  res.json({ok:true});
});

export default router;
