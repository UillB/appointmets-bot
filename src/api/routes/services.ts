import { Router } from "express";
import { prisma } from "../../lib/prisma";
const r = Router();


r.get("/", async (_, res) => {
const data = await prisma.service.findMany();
res.json(data);
});


r.post("/", async (req, res) => {
const { name, description, durationMin } = req.body;
const s = await prisma.service.create({ data: { name, description, durationMin } });
res.status(201).json(s);
});


export default r;