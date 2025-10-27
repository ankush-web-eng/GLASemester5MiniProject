import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    try {
        const rq = await req.json();

        const history = await prisma.history.create({
            data: {
                content_type: rq.content_type,
                recommended_agent: rq.recommended_agent,
                available_agents: rq.available_agents,
                confidence_score: rq.confidence_score,
                is_relevant: rq.is_relevant,
                User: {
                    connect: {
                        email: rq.user_email
                    }
                }
            },
        });

        if (!history) {
            return NextResponse.json({ error: 'Failed to save history' }, { status: 400 });
        }

        const path = req.nextUrl.searchParams.get('path') || '/dashboard/preview/agents';
        revalidatePath(path);

        return NextResponse.json({ success: 'History saved successfully' }, { status: 200 });

    } catch (error) {
        console.log('Error:', error);
        return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
    }
}