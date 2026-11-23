import PostalMime from "postal-mime";
import { Resend, type WebhookEventPayload } from "resend";

const forwardingAddresses = new Set([
	"help@odin-pro.com",
	"no-reply@odin-pro.com",
	"support@odin-pro.com",
]);

export async function POST(request: Request) {
	const apiKey = process.env.RESEND_INBOUND_API_KEY?.trim();
	const webhookSecret = process.env.RESEND_WEBHOOK_SECRET?.trim();
	const forwardTo = process.env.RESEND_FORWARD_TO?.trim();
	if (!apiKey || !webhookSecret || !forwardTo) {
		return new Response("Resend forwarding is not configured", { status: 503 });
	}

	const resend = new Resend(apiKey);
	let event: WebhookEventPayload;
	try {
		event = resend.webhooks.verify({
			payload: await request.text(),
			headers: {
				id: request.headers.get("svix-id") ?? "",
				timestamp: request.headers.get("svix-timestamp") ?? "",
				signature: request.headers.get("svix-signature") ?? "",
			},
			webhookSecret,
		});
	} catch {
		return new Response("Invalid webhook signature", { status: 400 });
	}

	if (event.type !== "email.received") return new Response(null);

	const { email_id: emailId, to, cc, bcc, received_for: receivedFor } = event.data;
	const testAddress = process.env.RESEND_INBOUND_TEST_ADDRESS?.trim().toLowerCase();
	const recipients = [...to, ...(cc ?? []), ...(bcc ?? []), ...(receivedFor ?? [])];
	const shouldForward = recipients.some((address) => {
		const normalized = address.trim().toLowerCase();
		return forwardingAddresses.has(normalized) || normalized === testAddress;
	});
	if (!shouldForward) return new Response(null);

	try {
		const signal = AbortSignal.timeout(15_000);
		const { data: email, error: lookupError } = await resend.emails.receiving.get(
			emailId,
			{ html_format: "cid" },
			{ signal },
		);
		if (lookupError || !email?.raw?.download_url) {
			console.error("Resend incoming email lookup failed:", lookupError?.name ?? "missing raw message");
			return new Response("Could not retrieve the incoming email", { status: 502 });
		}

		const rawEmail = await fetch(email.raw.download_url, { cache: "no-store", signal });
		if (!rawEmail.ok) {
			console.error("Resend raw email download failed:", rawEmail.status);
			return new Response("Could not download the incoming email", { status: 502 });
		}

		const parsed = await PostalMime.parse(await rawEmail.arrayBuffer(), { attachmentEncoding: "base64" });
		const attachments = parsed.attachments.map((attachment) => ({
			filename: attachment.filename || "attachment",
			content: typeof attachment.content === "string"
				? attachment.content
				: Buffer.from(attachment.content).toString("base64"),
			contentType: attachment.mimeType,
			contentId: attachment.contentId?.replace(/^<|>$/g, "") || undefined,
		}));
		const replyTo = email.reply_to?.length ? email.reply_to : email.from || undefined;
		const { error: sendError } = await resend.emails.send({
			from: "Odin Pro Mail <support@odin-pro.com>",
			to: forwardTo,
			replyTo,
			subject: email.subject || "(no subject)",
			html: parsed.html,
			text: parsed.text ?? "",
			attachments,
		}, { idempotencyKey: `odin-inbound/${emailId}`, signal });
		if (sendError) {
			console.error("Resend could not forward an incoming email:", sendError.name);
			return new Response("Could not forward the incoming email", { status: 502 });
		}
	} catch (error) {
		console.error("Resend incoming email processing failed:", error instanceof Error ? error.name : "unknown error");
		return new Response("Could not process the incoming email", { status: 502 });
	}

	return new Response(null);
}
