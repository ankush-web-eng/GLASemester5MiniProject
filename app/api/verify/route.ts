import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { email, verifyCode } = body

        if (!email || !verifyCode) {
            return NextResponse.json(
                { message: 'Email and OTP are required' },
                { status: 400 }
            )
        }

        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user) {
            return NextResponse.json(
                { message: 'User not found' },
                { status: 404 }
            )
        }

        if (user.verifyCode !== verifyCode) {
            return NextResponse.json(
                { message: 'Invalid or expired OTP' },
                { status: 400 }
            )
        }

        await prisma.user.update({
            where: { email },
            data: {
                isVerified: true,
            }
        })

        return NextResponse.json(
            { message: 'Email verified successfully' },
            { status: 200 }
        )
    } catch (error) {
        console.error('Verification error:', error)
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}