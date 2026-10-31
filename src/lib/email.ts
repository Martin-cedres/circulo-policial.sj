import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});

export interface EmailAttachment {
    filename: string;
    content: Buffer | Uint8Array | string;
    contentType?: string;
}

export async function sendEmail({
    to,
    subject,
    text,
    html,
    attachments,
}: {
    to: string;
    subject: string;
    text: string;
    html?: string;
    attachments?: EmailAttachment[];
}) {
    const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Círculo Policial San José';
    const mailOptions: any = {
        from: `"${siteName}" <${process.env.SMTP_USER}>`,
        to,
        subject,
        text,
        html,
    };

    if (attachments && attachments.length > 0) {
        mailOptions.attachments = attachments.map(att => ({
            filename: att.filename,
            content: Buffer.isBuffer(att.content) ? att.content : Buffer.from(att.content as any),
            contentType: att.contentType,
        }));
    }

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email enviado:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error enviando email:', error);
        return { success: false, error };
    }
}
