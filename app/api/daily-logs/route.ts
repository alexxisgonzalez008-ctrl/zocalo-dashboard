import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { getAuthSession } from "@/lib/auth";

const DailyLogSchema = z.object({
    id: z.string().optional(),
    projectId: z.string(),
    date: z.string(),
    weather: z.string().optional(),
    notes: z.string().optional().default(""),
    // Frontend sends these but we handle them separately or ignore if not in DB schema
    photos: z.array(z.string()).optional(),
    expenses: z.array(z.any()).optional(),
});

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const projectId = searchParams.get("projectId") || "default";

        const logs = await prisma.dailyLog.findMany({
            where: { projectId },
            include: { expenses: true },
            orderBy: { date: 'desc' }
        });

        return NextResponse.json(logs);
    } catch (error: any) {
        console.error("DailyLog GET Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = DailyLogSchema.parse(await req.json());
        const { userId } = getAuthSession();

        const data = {
            projectId: body.projectId,
            userId,
            date: new Date(body.date),
            weather: body.weather,
            notes: body.notes || ""
        };

        let log;
        if (body.id) {
            log = await prisma.dailyLog.upsert({
                where: { id: body.id },
                update: data,
                create: { id: body.id, ...data }
            });
        } else {
            log = await prisma.dailyLog.create({ data });
        }

        return NextResponse.json(log);
    } catch (error: any) {
        console.error("DailyLog POST Error:", error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

