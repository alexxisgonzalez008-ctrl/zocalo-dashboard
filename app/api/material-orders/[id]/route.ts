import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const UpdateItemSchema = z.object({
    itemId: z.string(),
    receivedQuantity: z.number()
});

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const orderId = params.id;
        const body = UpdateItemSchema.parse(await req.json());

        // 1. Actualizar el ítem
        await prisma.materialOrderItem.update({
            where: { id: body.itemId },
            data: { receivedQuantity: body.receivedQuantity }
        });

        // 2. Recalcular el estado del pedido
        const orderItems = await prisma.materialOrderItem.findMany({
            where: { orderId }
        });

        const allReceived = orderItems.every(item => item.receivedQuantity >= item.requestedQuantity);
        const anyReceived = orderItems.some(item => item.receivedQuantity > 0);

        let status = "pending";
        if (allReceived) status = "completed";
        else if (anyReceived) status = "partial";

        const updatedOrder = await prisma.materialOrder.update({
            where: { id: orderId },
            data: { status },
            include: { items: true }
        });

        return NextResponse.json(updatedOrder);
    } catch (error: any) {
        console.error("Update Order Item Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
