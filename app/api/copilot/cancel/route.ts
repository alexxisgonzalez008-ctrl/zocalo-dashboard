import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const CancelInput = z.object({
    proposalId: z.string().min(1)
});

export async function POST(req: NextRequest) {
    try {
        const body = CancelInput.parse(await req.json());
        const userId = "user_dev_alex"; // TODO: Auth

        const proposal = await prisma.copilotProposal.findUnique({
            where: { id: body.proposalId }
        });

        if (!proposal) {
            return NextResponse.json({ error: "Propuesta no encontrada" }, { status: 404 });
        }

        if (proposal.status !== "pending") {
            return NextResponse.json({ error: `No se puede cancelar una propuesta en estado: ${proposal.status}` }, { status: 400 });
        }

        await prisma.copilotProposal.update({
            where: { id: proposal.id },
            data: { status: "cancelled" }
        });

        await prisma.copilotAuditLog.create({
            data: {
                proposalId: proposal.id,
                userId,
                action: "CANCELLED"
            }
        });

        return NextResponse.json({ ok: true });

    } catch (error: any) {
        console.error("Copilot Cancel Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
