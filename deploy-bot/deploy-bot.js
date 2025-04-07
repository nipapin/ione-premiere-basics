import { exec } from "child_process";
import express from "express";
import fetch from "node-fetch";
import { promisify } from "util";

const TELEGRAM_BOT_TOKEN = process.env.TGBOT_API;
const TELEGRAM_CHAT_ID = process.env.TGBOT_CHAT_ID;

const app = express();
app.use(express.json());

const execSync = promisify(exec);

function sendTelegramMessage(message) {
	const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
	const payload = {
		chat_id: TELEGRAM_CHAT_ID,
		text: message.length > 4096 ? message.slice(0, 4090) + "..." : message,
		parse_mode: "Markdown"
	};

	return fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(payload)
	});
}

app.post("/deploy", async (req, res) => {
	try {
		await execSync("cd /var/www/odin-pro");
		await execSync("git pull");
		await sendTelegramMessage(`🔄 *Pulling changes...*`);
		await execSync("npm i");
		await sendTelegramMessage(`🔄 *Installing dependencies...*`);
		await execSync("npm run build");
		await sendTelegramMessage(`🔄 *Building...*`);
		await execSync("pm2 reload odin-pro");
		await sendTelegramMessage(`🔄 *Reloading...*`);

		await sendTelegramMessage(`✅ *Deploy successful!*`);

		res.json({ success: true });
	} catch (error) {
		console.error("Deploy error:", error);
		await sendTelegramMessage(`💩 *Internal Server Error:*\n\`\`\`\n${error.message}\n\`\`\``);
		res.status(500).json({ success: false, error: "Internal Server Error" });
	}
});

app.listen(3001, () => {
	console.log("Deploy service listening on port 3001");
});
