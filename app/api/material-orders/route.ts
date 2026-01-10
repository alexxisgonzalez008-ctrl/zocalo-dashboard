import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { getAuthSession } from "@/lib/auth";

const CreateOrderSchema = z.object({
    projectId: z.string(),
    vendor: z.string().optional(),
    notes: z.string().optional(),
    items: z.array(z.object({
        description: z.string(),
        requestedQuantity: z.number(),
        unit: z.string().optional()
    }))
});

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const projectId = searchParams.get("projectId") || "default";

        const orders = await prisma.materialOrder.findMany({
            where: { projectId },
            include: { items: true },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(orders);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = CreateOrderSchema.parse(await req.json());
        const { userId } = getAuthSession();

        const order = await prisma.materialOrder.create({
            data: {
                projectId: body.projectId,
                userId,
                vendor: body.vendor,
                notes: body.notes,
                status: "pending",
                items: {
                    create: body.items.map(item => ({
                        description: item.description,
                        requestedQuantity: item.requestedQuantity,
                        unit: item.unit,
                        receivedQuantity: 0
                    }))
                }
            },
            include: { items: true }
        });

        return NextResponse.json(order);
    } catch (error: any) {
        console.error("Create Order Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
