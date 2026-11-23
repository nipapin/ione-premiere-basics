"use server";

type ResendEmail = {
	from: string;
	to: string[];
	subject: string;
	html: string;
	reply_to?: string;
};

const supportAddress = "support@odin-pro.com";

async function sendWithResend(email: ResendEmail): Promise<boolean> {
	const apiKey = process.env.RESEND_API_KEY?.trim();
	if (!apiKey) {
		console.error("Email delivery requires RESEND_API_KEY.");
		return false;
	}

	try {
		const response = await fetch("https://api.resend.com/emails", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${apiKey}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(email),
			cache: "no-store",
			signal: AbortSignal.timeout(10_000),
		});

		if (!response.ok) {
			console.error("Resend rejected the email request:", response.status);
		}
		return response.ok;
	} catch (error) {
		console.error("Resend email request failed:", error);
		return false;
	}
}

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
	return sendWithResend({
		from: "Odin Pro Notification <no-reply@odin-pro.com>",
		to: [to],
		subject,
		html,
	});
}

export async function sendEmailFromContact(from: string, subject: string, html: string): Promise<boolean> {
	return sendWithResend({
		from: `Contact Form <${supportAddress}>`,
		to: [supportAddress],
		subject: `New submission from ${from}`,
		reply_to: from,
		html: `
			  <h1>${subject}</h1>
			  <p>${html}</p>
			  <p>From: ${from}</p>
			`,
	});
}
