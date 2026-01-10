import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { getAuthSession } from "@/lib/auth";

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
        const { userId } = getAuthSession();

        const updatedOrder = await prisma.$transaction(async (tx) => {
            // 1. Actualizar el ítem
            await tx.materialOrderItem.update({
                where: { id: body.itemId },
                data: { receivedQuantity: body.receivedQuantity }
            });

            // 2. Recalcular el estado del pedido completo
            const orderItems = await tx.materialOrderItem.findMany({
                where: { orderId }
            });

            const allReceived = orderItems.every(item => item.receivedQuantity >= item.requestedQuantity);
            const anyReceived = orderItems.some(item => item.receivedQuantity > 0);

            let status = "pending";
            if (allReceived) status = "completed";
            else if (anyReceived) status = "partial";

            // 3. Actualizar el pedido principal
            return await tx.materialOrder.update({
                where: { id: orderId },
                data: { status },
                include: { items: true }
            });
        });

        return NextResponse.json(updatedOrder);
    } catch (error: any) {
        console.error("Update Order Item Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
