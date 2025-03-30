import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST,
	port: Number(process.env.SMTP_PORT),
	secure: true, // true for 465, false for other ports like 587
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASSWORD
	}
});

// Verify SMTP configuration
transporter.verify(function (error) {
	if (error) {
		console.error("SMTP Configuration Error:", error);
	} else {
		console.log("SMTP Server is ready to take our messages");
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
			from: process.env.SMTP_FROM,
			host: process.env.SMTP_HOST,
			port: process.env.SMTP_PORT
		});
		return false;
	}
};
