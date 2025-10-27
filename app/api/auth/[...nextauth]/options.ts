import { NextAuthOptions, User } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { Session } from 'next-auth';

const prisma = new PrismaClient();

declare module 'next-auth' {
    interface Session {
        user: {
            id?: string;
            email?: string | null;
            name?: string | null;
            image?: string | null;
        };
    }

    interface User {
        id: string;
        email: string;
        name: string | null;
        password: string;
    }
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'text' },
                password: { label: 'Password', type: 'password' }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Please provide both email and password');
                }

                try {
                    const user = await prisma.user.findUnique({
                        where: {
                            email: credentials.email
                        }
                    });

                    if (!user || !user.password) {
                        throw new Error('No user found with this email');
                    }

                    const isPasswordValid = await bcrypt.compare(
                        credentials.password,
                        user.password
                    );

                    if (!isPasswordValid) {
                        throw new Error('Invalid password');
                    }

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        password: user.password
                    };
                } catch (error) {
                    if (error instanceof Error) {
                        throw new Error(error.message);
                    }
                    throw new Error('An error occurred during authentication');
                } finally {
                    await prisma.$disconnect();
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }: { token: JWT, user: User | null }) {
            if (user) {
                return {
                    ...token,
                    id: user.id,
                    email: user.email,
                    name: user.name
                };
            }
            return token;
        },
        async session({ session, token }: { session: Session, token: JWT }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.email = token.email as string;
                session.user.name = token.name as string | undefined;
            }
            return session;
        }
    },
    pages: {
        signIn: '/auth/signin'
    },
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === 'development'
};

export default authOptions;