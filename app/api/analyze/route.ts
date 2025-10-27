import { NextRequest, NextResponse } from 'next/server';

const LLAMA_ENDPOINT = `${process.env.NEXT_PUBLIC_API_URL}/parse-with-llama`;
const GEMINI_ENDPOINT = `${process.env.NEXT_PUBLIC_API_URL}/gemini`;

async function callEndpoint(url: string, method: string, body: unknown, headers: Record<string, unknown> = {}) {
    const response = await fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error calling endpoint');
    }

    return response.json();
}

export async function POST(request: NextRequest) {
    try {
        let content: string;

        if (request.headers.get('content-type')?.includes('multipart/form-data')) {
            const formData = await request.formData();
            const file = formData.get('file') as File;

            if (!file) {
                return NextResponse.json(
                    { error: "No file provided" },
                    { status: 400 }
                );
            }

            if (!file.name || file.name === '') {
                return NextResponse.json(
                    { error: "No file selected" },
                    { status: 400 }
                );
            }

            const formdata = new FormData();
            formdata.append('file', file);
            const llamaResponse = await fetch(LLAMA_ENDPOINT, {
                method: 'POST',
                body: formdata,
            });

            if (!llamaResponse.ok) {
                throw new Error('Failed to process file with LLAMA');
            }

            const llamaData = await llamaResponse.json();
            content = llamaData.content;
        } else {
            const body = await request.json();

            if (!body.content) {
                return NextResponse.json(
                    { error: 'No content provided' },
                    { status: 400 }
                );
            }

            content = body.content;
        }

        // Call the GEMINI endpoint
        const geminiResponse = await callEndpoint(GEMINI_ENDPOINT, 'POST', { prompt: content });

        return NextResponse.json({ data: geminiResponse, success: true }, { status: 200 });
    } catch (error) {
        console.error('Analysis error:', error);
        return NextResponse.json(
            { message: 'Failed to analyze content', success: false },
            { status: 500 }
        );
    }
}
