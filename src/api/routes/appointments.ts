import { Router } from "express";
import { prisma } from "../../lib/prisma";
const r = Router();


r.get("/", async (_, res) => {
const list = await prisma.appointment.findMany({ include: { service: true, slot: true } });
res.json(list);
});


r.post("/", async (req, res) => {
const { chatId, serviceId, slotId } = req.body;
const slot = await prisma.slot.findUnique({ where: { id: Number(slotId) }, include: { bookings: true } });
if (!slot) return res.status(404).json({ error: "slot not found" });
if (slot.bookings.length >= slot.capacity) return res.status(409).json({ error: "slot full" });


const appt = await prisma.appointment.create({ data: { chatId: String(chatId), serviceId: Number(serviceId), slotId: Number(slotId) } });
res.status(201).json(appt);
});


export default r;