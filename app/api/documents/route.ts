import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { getAuthSession } from "@/lib/auth";

const CreateDocumentSchema = z.object({
    projectId: z.string(),
    name: z.string().min(1),
    type: z.string(),
    url: z.string().optional(),
    category: z.string(),
    size: z.string().optional()
});

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const projectId = searchParams.get("projectId") || "default";

        const documents = await prisma.document.findMany({
            where: { projectId },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(documents);
    } catch (error: any) {
        console.error("Fetch Documents Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = CreateDocumentSchema.parse(await req.json());
        const { userId } = getAuthSession();

        const document = await prisma.document.create({
            data: {
                projectId: body.projectId,
                userId,
                name: body.name,
                type: body.type,
                url: body.url || "#",
                category: body.category,
                size: body.size || "0 KB"
            }
        });

        return NextResponse.json(document);
    } catch (error: any) {
        console.error("Create Document Error:", error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
