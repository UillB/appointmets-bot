# src/api/routes/slots.ts

```ts
import { Router } from "express";
import { prisma } from "../../lib/prisma";
const r = Router();


r.get("/", async (req, res) => {
const { serviceId, from, to } = req.query as Record<string, string>;
const slots = await prisma.slot.findMany({
where: {
serviceId: serviceId ? Number(serviceId) : undefined,
startAt: from && to ? { gte: new Date(from), lte: new Date(to) } : undefined,
},
orderBy: { startAt: "asc" },
});
res.json(slots);
});


r.post("/generate", async (req, res) => {
const { serviceId, date, startHour, endHour } = req.body; // e.g., 2025-10-17, 9, 17
const service = await prisma.service.findUnique({ where: { id: serviceId } });
if (!service) return res.status(404).json({ error: "service not found" });
const base = new Date(`${date}T00:00:00.000Z`);
const slots = [] as any[];
for (let h = startHour; h < endHour; h++) {
const start = new Date(base);
start.setUTCHours(h, 0, 0, 0);
const end = new Date(start.getTime() + service.durationMin * 60 * 1000);
slots.push({ serviceId, startAt: start, endAt: end, capacity: 1 });
}
const created = await prisma.slot.createMany({ data: slots });
res.json({ created: created.count });
});


export default r;
```
