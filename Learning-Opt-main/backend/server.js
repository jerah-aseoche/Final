import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import deviceRoutes from "./routes/device.js";

const app = express();
app.use(express.json());

app.use("/api/device", deviceRoutes);

const server = http.createServer(app);

/* RAW WEBSOCKET */
const wss = new WebSocketServer({ server });
let espSocket = null;

wss.on("connection", ws => {
  console.log("ESP32 CONNECTED");
  espSocket = ws;

  ws.on("close", () => {
    console.log("ESP32 DISCONNECTED");
    espSocket = null;
  });
});

export function sendCommand(cmd){
  if(espSocket){
    espSocket.send(JSON.stringify({ command: cmd }));
  }
}

server.listen(3000, ()=>{
  console.log("Backend running on port 3000");
});
