import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { getAuthSession } from "@/lib/auth";

const TaskSchema = z.object({
    id: z.string().optional(),
    projectId: z.string(),
    category: z.string(),
    name: z.string().min(1),
    start: z.string(),
    end: z.string(),
    days: z.number(),
    status: z.string(),
    priority: z.string().optional(),
    isMilestone: z.boolean().optional(),
    budget: z.number().optional(),
    cost: z.number().optional(),
    locked: z.boolean().optional(),
    durationWorkdays: z.number().optional(),
});

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const projectId = searchParams.get("projectId") || "default";

        const tasks = await prisma.task.findMany({
            where: { projectId },
            orderBy: { start: 'asc' }
        });

        return NextResponse.json(tasks);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = TaskSchema.parse(await req.json());
        const { userId } = getAuthSession();

        const data = {
            projectId: body.projectId,
            userId,
            category: body.category,
            name: body.name,
            start: new Date(body.start),
            end: new Date(body.end),
            days: body.days,
            status: body.status,
            priority: body.priority || "medium",
            isMilestone: body.isMilestone || false,
            budget: body.budget,
            cost: body.cost,
            locked: body.locked || false,
            durationWorkdays: body.durationWorkdays
        };

        let task;
        if (body.id) {
            task = await prisma.task.upsert({
                where: { id: body.id },
                update: data,
                create: data
            });
        } else {
            task = await prisma.task.create({ data });
        }

        return NextResponse.json(task);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
