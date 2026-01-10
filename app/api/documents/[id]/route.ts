import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;

        await prisma.document.delete({
            where: { id }
        });

        return NextResponse.json({ ok: true, message: "Documento eliminado" });
    } catch (error: any) {
        console.error("Delete Document Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
