"use server";

import nodemailer from "nodemailer";

const noReplyTransport = nodemailer.createTransport({
	host: process.env.SMTP_HOST,
	port: Number(process.env.SMTP_PORT),
	secure: false,
	auth: {
		user: process.env.NO_REPLY_SMTP_ALIAS,
		pass: process.env.NO_REPLY_SMTP_PASSWORD,
	},
});

const supportTransport = nodemailer.createTransport({
	host: process.env.SMTP_HOST,
	port: Number(process.env.SMTP_PORT),
	secure: false,
	auth: {
		user: process.env.SUPPORT_SMTP_ALIAS,
		pass: process.env.SUPPORT_SMTP_PASSWORD,
	},
});

const helpTransport = nodemailer.createTransport({
	host: process.env.SMTP_HOST,
	port: Number(process.env.SMTP_PORT),
	secure: false,
	auth: {
		user: process.env.HELP_SMTP_ALIAS,
		pass: process.env.HELP_SMTP_PASSWORD,
	},
});

export const sendEmail = async (to: string, subject: string, html: string): Promise<boolean> => {
	console.log("Sending email to:", to);
	console.log("Subject:", subject);
	console.log("HTML:", html);
	console.log("No Reply Transport:", noReplyTransport);
	try {
		await noReplyTransport.sendMail({
			from: `Odin Pro Notification <${process.env.NO_REPLY_SMTP_ALIAS}>`,
			to,
			subject,
			html,
		});
		return true;
	} catch (error) {
		console.error("Error sending email:", {
			error: error instanceof Error ? error.message : error,
			stack: error instanceof Error ? error.stack : undefined,
		});
		return false;
	}
};

export const sendEmailFromContact = async (from: string, subject: string, html: string): Promise<boolean> => {
	try {
		await supportTransport.sendMail({
			from: `"Contact Form" <${process.env.SUPPORT_SMTP_ALIAS}>`,
			to: process.env.SUPPORT_SMTP_ALIAS,
			subject: `New submission from ${from}`,
			replyTo: from,
			html: `
			  <h1>${subject}</h1>
			  <p>${html}</p>
			  <p>From: ${from}</p>
			`,
		});
		return true;
	} catch (error) {
		console.error("Error sending email:", {
			error: error instanceof Error ? error.message : error,
			stack: error instanceof Error ? error.stack : undefined,
		});
		return false;
	}
};
