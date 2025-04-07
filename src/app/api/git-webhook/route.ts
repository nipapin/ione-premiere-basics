import { exec } from "child_process";
import { writeFileSync } from "fs";
import { NextResponse } from "next/server";

const TELEGRAM_BOT_TOKEN = process.env.TGBOT_API!;
const TELEGRAM_CHAT_ID = process.env.TGBOT_CHAT_ID!;

async function sendTelegramMessage(message: string) {
	const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
	const payload = {
		chat_id: TELEGRAM_CHAT_ID,
		text: message.length > 4096 ? message.slice(0, 4090) + "..." : message,
		parse_mode: "Markdown"
	};

	const response = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(payload)
	});
	const data = await response.json();

	writeFileSync("response.json", JSON.stringify(data, null, 2));

	return response;
}

export async function POST() {
	try {
		exec(
			"cd /var/www/odin-pro && git pull && npm i && npm run build && pm2 reload all",
			async (err, stdout, stderr) => {
				let msg = "";

				if (err) {
					console.error(`exec error: ${err}`);
					msg += `❌ *Deploy failed*\n\`\`\`\n${err.message}\n\`\`\`\n`;
				} else {
					msg += `✅ *Deploy successful!*\n\n`;
					msg += `🟢 *stdout:*\n\`\`\`\n${stdout.slice(0, 1500)}\n\`\`\`\n`;
					if (stderr) {
						msg += `🟠 *stderr:*\n\`\`\`\n${stderr.slice(0, 1500)}\n\`\`\``;
					}
				}

				await sendTelegramMessage(msg);
			}
		);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error(error);
		await sendTelegramMessage(`🔥 *Internal Server Error:*\n\`\`\`\n${(error as Error).message}\n\`\`\``);
		return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
	}
}

export async function GET() {
	return NextResponse.json({ success: false, error: "Method Not Allowed" }, { status: 405 });
}
