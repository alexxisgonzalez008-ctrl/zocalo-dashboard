import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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
        const body = await req.json();
        const { projectId, name, type, url, category, size } = body;

        if (!projectId || !name || !type || !category) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const userId = "user_dev_alex"; // Mock de Auth

        const document = await prisma.document.create({
            data: {
                projectId,
                userId,
                name,
                type,
                url: url || "#",
                category,
                size: size || "0 KB"
            }
        });

        return NextResponse.json(document);
    } catch (error: any) {
        console.error("Create Document Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
