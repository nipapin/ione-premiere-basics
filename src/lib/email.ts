import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST,
	port: Number(process.env.SMTP_PORT),
	secure: true,
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASSWORD
	}
});

export const sendEmail = async (to: string, subject: string, html: string): Promise<boolean> => {
	try {
		await transporter.sendMail({
			from: process.env.SMTP_FROM,
			to,
			subject,
			html
		});
		return true;
	} catch (error) {
		console.error("Error sending email:", {
			error: error instanceof Error ? error.message : error,
			stack: error instanceof Error ? error.stack : undefined,
			to,
			subject,
			from: process.env.SMTP_FROM
		});
		return false;
	}
};
