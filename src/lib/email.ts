import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});

export async function sendEmail({
    to,
    subject,
    text,
    html
}: {
    to: string;
    subject: string;
    text: string;
    html?: string
}) {
    const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Círculo Policial San José';
    const mailOptions = {
        from: `"${siteName}" <${process.env.SMTP_USER}>`,
        to,
        subject,
        text,
        html,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email enviado:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error enviando email:', error);
        return { success: false, error };
    }
}
