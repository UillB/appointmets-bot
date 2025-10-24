import express from "express";
import path from "path";
import cors from "cors";
import { performanceMiddleware } from "../lib/performance";
import appointments from "./routes/appointments";
import services from "./routes/services";
import slots from "./routes/slots";
import webapp from "./routes/webapp";
import auth from "./routes/auth";
import organizations from "./routes/organizations";
import botManagement from "./routes/bot-management";
import aiConfig from "./routes/ai-config";
import notifications from "./routes/notifications";
import performance from "./routes/performance";
import analytics from "./routes/analytics";


export function createApi() {
const app = express();

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:4200', 'http://127.0.0.1:4200', 
    'http://localhost:4202', 'http://127.0.0.1:4202',
    'http://localhost:5200', 'http://127.0.0.1:5200',
    'http://localhost:3000', 'http://127.0.0.1:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Performance monitoring middleware
app.use(performanceMiddleware);


app.use("/api/auth", auth);
app.use("/api/appointments", appointments);
app.use("/api/services", services);
app.use("/api/slots", slots);
app.use("/api/organizations", organizations);
app.use("/api/bot", botManagement);
app.use("/api/ai-config", aiConfig);
app.use("/api/notifications", notifications);
app.use("/api/performance", performance);
app.use("/api/analytics", analytics);
console.log("✅ AI Config routes registered at /api/ai-config");
console.log("✅ Notifications routes registered at /api/notifications");
app.use("/webapp", webapp);

// Serve prebuilt Angular admin panel for Telegram WebApp from dist (same origin for mobile TG)
try {
  const adminDist = path.resolve(process.cwd(), "../admin-panel/dist/admin-panel/browser");
  app.use("/admin-panel", express.static(adminDist, { index: ["index.html"] }));
  console.log("✅ Admin panel static served from:", adminDist);
  // SPA fallback for deep links and refresh inside Telegram WebView
  app.get('/admin-panel*', (req, res) => {
    res.sendFile(path.join(adminDist, 'index.html'));
  });
} catch (e) {
  console.warn("⚠️ Failed to mount admin-panel static dir:", e);
}


app.get("/api/health", (_, res) => res.json({ ok: true }));

// WebSocket health check
app.get("/api/health/websocket", (_, res) => {
  const wsManager = (global as any).wsManager;
  if (wsManager) {
    const stats = wsManager.getStats();
    res.json({ 
      ok: true, 
      websocket: true,
      stats 
    });
  } else {
    res.json({ 
      ok: false, 
      websocket: false,
      error: 'WebSocket manager not initialized' 
    });
  }
});

return app;
}