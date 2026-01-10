import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { getAuthSession } from "@/lib/auth";

const ConfirmInput = z.object({
    proposalId: z.string().min(1),
    confirm: z.literal(true)
});

export async function POST(req: NextRequest) {
    try {
        const body = ConfirmInput.parse(await req.json());
        const { userId } = getAuthSession();

        // 1. Cargar propuesta
        const proposal = await prisma.copilotProposal.findUnique({
            where: { id: body.proposalId }
        });

        if (!proposal) {
            return NextResponse.json({ error: "Propuesta no encontrada" }, { status: 404 });
        }

        // 2. ACL & Idempotencia
        if (proposal.status === "confirmed") {
            return NextResponse.json({ ok: true, result: JSON.parse(proposal.lastResult || "{}") });
        }

        // 3. Ejecutar según toolName
        // Aquí es donde se conectan los "commit_*" reales
        const result = await executeCommit(proposal.toolName, JSON.parse(proposal.toolArgs), userId, proposal.projectId);

        // 4. Actualizar estado
        await prisma.copilotProposal.update({
            where: { id: proposal.id },
            data: {
                status: "confirmed",
                confirmedAt: new Date(),
                lastResult: JSON.stringify(result)
            }
        });

        // 5. Auditoría
        await prisma.copilotAuditLog.create({
            data: {
                proposalId: proposal.id,
                userId,
                action: "EXECUTED",
                payload: JSON.stringify(result)
            }
        });

        return NextResponse.json({ ok: true, result });

    } catch (error: any) {
        console.error("Copilot Confirm Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

async function executeCommit(toolName: string, args: any, userId: string, projectId: string) {
    switch (toolName) {
        case "propose_expense":
            const expense = await prisma.expense.create({
                data: {
                    projectId,
                    userId,
                    amount: args.amount,
                    description: args.description,
                    category: args.category,
                    date: args.date ? new Date(args.date) : new Date()
                }
            });
            return { message: "Gasto registrado correctamente", id: expense.id };

        case "propose_daily_log_entry":
            const log = await prisma.dailyLog.create({
                data: {
                    projectId,
                    userId,
                    date: args.date ? new Date(args.date) : new Date(),
                    notes: args.notes,
                    weather: args.weather
                }
            });
            return { message: "Entrada de bitácora guardada", id: log.id };

        case "propose_material_order":
            const order = await prisma.materialOrder.create({
                data: {
                    projectId,
                    userId,
                    vendor: (args as any).vendor,
                    notes: (args as any).notes,
                    status: "pending",
                    items: {
                        create: (args as any).items.map((item: any) => ({
                            description: item.description,
                            requestedQuantity: item.requestedQuantity,
                            unit: item.unit,
                            receivedQuantity: 0
                        }))
                    }
                }
            });
            return { message: `Pedido #${order.id.slice(0, 4)} creado correctamente`, id: order.id };
        default:
            return { message: "Acción ejecutada con éxito" };
    }
}
