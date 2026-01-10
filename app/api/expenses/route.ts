import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { getAuthSession } from "@/lib/auth";

const ExpenseSchema = z.object({
    id: z.string().optional(),
    projectId: z.string(),
    dailyLogId: z.string().optional(),
    category: z.string(),
    description: z.string(),
    amount: z.number(),
    date: z.string()
});

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const projectId = searchParams.get("projectId") || "default";

        const expenses = await prisma.expense.findMany({
            where: { projectId },
            orderBy: { date: 'desc' }
        });

        return NextResponse.json(expenses);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = ExpenseSchema.parse(await req.json());
        const { userId } = getAuthSession();

        const data = {
            projectId: body.projectId,
            userId,
            dailyLogId: body.dailyLogId,
            category: body.category,
            description: body.description,
            amount: body.amount,
            date: new Date(body.date)
        };

        let expense;
        if (body.id) {
            expense = await prisma.expense.upsert({
                where: { id: body.id },
                update: data,
                create: data
            });
        } else {
            expense = await prisma.expense.create({ data });
        }

        return NextResponse.json(expense);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
