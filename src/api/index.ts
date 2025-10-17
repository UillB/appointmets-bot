import express from "express";
import appointments from "./routes/appointments";
import services from "./routes/services";
import slots from "./routes/slots";
import webapp from "./routes/webapp";


export function createApi() {
const app = express();
app.use(express.json());


app.use("/api/appointments", appointments);
app.use("/api/services", services);
app.use("/api/slots", slots);
app.use("/webapp", webapp);


app.get("/health", (_, res) => res.json({ ok: true }));
return app;
}