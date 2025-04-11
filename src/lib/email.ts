"use server";

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST,
	port: Number(process.env.SMTP_PORT),
	secure: process.env.SMTP_SECURE === "true",
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASSWORD
	}
});

// Verify SMTP configuration
transporter.verify(function (error) {
	if (error) {
		console.error("SMTP Configuration Error:", error);
	}
});

export const sendEmail = async (to: string, subject: string, html: string): Promise<boolean> => {
	const noreplyTransport = nodemailer.createTransport({
		host: process.env.SMTP_HOST,
		port: Number(process.env.SMTP_PORT),
		secure: process.env.SMTP_SECURE === "true",
		auth: {
			user: process.env.SMTP_USER,
			pass: process.env.SMTP_PASSWORD
		}
	});

	try {
		await noreplyTransport.sendMail({
			from: `Odin Pro Notification ${process.env.SMTP_FROM_NO_REPLY}`,
			to,
			subject,
			html
		});
		return true;
	} catch (error) {
		console.error("Error sending email:", {
			error: error instanceof Error ? error.message : error,
			stack: error instanceof Error ? error.stack : undefined
		});
		return false;
	}
};

export const sendEmailFromContact = async (from: string, subject: string, html: string): Promise<boolean> => {
	try {
		await transporter.sendMail({
			sender: "Contact Form",
			to: process.env.SMTP_FROM_SUPPORT,
			subject: `New submission from ${from}`,
			html: `<h1>${subject}</h1><p>${html}</p><p>From: ${from}</p>`
		});
		return true;
	} catch (error) {
		console.error("Error sending email:", {
			error: error instanceof Error ? error.message : error,
			stack: error instanceof Error ? error.stack : undefined
		});
		return false;
	}
};
