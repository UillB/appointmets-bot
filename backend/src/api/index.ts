import express from "express";
import cors from "cors";
import appointments from "./routes/appointments";
import services from "./routes/services";
import slots from "./routes/slots";
import webapp from "./routes/webapp";
import auth from "./routes/auth";
import organizations from "./routes/organizations";
import botManagement from "./routes/bot-management";
import aiConfig from "./routes/ai-config";


export function createApi() {
const app = express();

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:4200', 'http://127.0.0.1:4200', 
    'http://localhost:4202', 'http://127.0.0.1:4202',
    'http://localhost:3000', 'http://127.0.0.1:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());


app.use("/api/auth", auth);
app.use("/api/appointments", appointments);
app.use("/api/services", services);
app.use("/api/slots", slots);
app.use("/api/organizations", organizations);
app.use("/api/bot", botManagement);
app.use("/api/ai-config", aiConfig);
console.log("✅ AI Config routes registered at /api/ai-config");
app.use("/webapp", webapp);


app.get("/api/health", (_, res) => res.json({ ok: true }));
return app;
}