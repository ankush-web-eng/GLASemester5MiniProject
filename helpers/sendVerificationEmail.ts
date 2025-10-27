import { ApiResponse } from "@/types/ApiResponse";

import nodemailer, { SentMessageInfo } from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    tls: {
        ciphers: "SSLv3",
    },
    secure: false,
    auth: {
        user: process.env.NEXT_PUBLIC_EMAIL,
        pass: process.env.NEXT_PUBLIC_EMAIL_PASSWORD,
    },
});

export async function sendVerificationEmail(email: string,
    name: string,
    verifyCode: string): Promise<ApiResponse> {

    const mailOptions = {
        from: `${process.env.NEXT_PUBLIC_APP_NAME} <${process.env.NEXT_PUBLIC_EMAIL}>`,
        to: email,
        subject: `${process.env.NEXT_PUBLIC_APP_NAME} - Verify your email`,
        text: `Hello ${name}, Your verification code is ${verifyCode}`,
        html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Email Verification</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 20px 0; text-align: center; background-color: #ffffff;">
                                <table role="presentation" style="width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                                    <tr>
                                        <td style="padding: 40px 30px;">
                                            <h1 style="margin: 0; color: #333333; font-size: 24px; font-weight: 700;">Welcome to ${process.env.NEXT_PUBLIC_APP_NAME}</h1>
                                            <p style="margin: 20px 0; color: #666666; font-size: 16px; line-height: 1.5;">
                                                Hello ${name},
                                            </p>
                                            <p style="margin: 20px 0; color: #666666; font-size: 16px; line-height: 1.5;">
                                                Thank you for signing up. Please use the verification code below to complete your registration:
                                            </p>
                                            <div style="background-color: #f8f9fa; border-radius: 4px; padding: 20px; margin: 30px 0; text-align: center;">
                                                <span style="font-family: monospace; font-size: 32px; font-weight: bold; color: #2c3e50; letter-spacing: 4px;">
                                                    ${verifyCode}
                                                </span>
                                            </div>
                                            <p style="margin: 20px 0; color: #666666; font-size: 14px; line-height: 1.5;">
                                                This code will expire in 10 minutes. If you didn't request this verification, please ignore this email.
                                            </p>
                                            <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;">
                                            <p style="margin: 0; color: #999999; font-size: 12px; text-align: center;">
                                                This is an automated message, please do not reply to this email.
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
            `
    };

    try {
        await new Promise((resolve, reject) => {
            transporter.sendMail(mailOptions, (err: Error | null, info: SentMessageInfo) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(info);
                }
            });
        });

        return { success: true, message: 'Verification email sent successfully.' };
    } catch (error) {
        console.error(error);
        return { success: false, message: 'Failed to send verification email.' };
    }
}