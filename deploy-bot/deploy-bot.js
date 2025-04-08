import { exec } from "child_process";
import express from "express";
import fetch from "node-fetch";
import { promisify } from "util";

const TELEGRAM_BOT_TOKEN = "8058731241:AAH4BzkBPE5mSLyrekl4IDiq5s_7PZs3be0";
const TELEGRAM_CHAT_ID = "413368388";

const app = express();
app.use(express.json());

const execSync = promisify(exec);

let lastMessageId = null;
let lastMessage = null;

async function sendTelegramMessage(message) {
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

	if (data.ok && data.result.message_id) {
		// Сохраняем message_id последнего сообщения
		lastMessageId = data.result.message_id;
		lastMessage = message;
	}

	return response;
}

async function editTelegramMessage(message) {
	if (lastMessageId) {
		const newMessage = message.length > 4096 ? message.slice(0, 4090) + "..." : message;
		lastMessage = lastMessage + "\n\n" + newMessage;
		const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageText`;
		const payload = {
			chat_id: TELEGRAM_CHAT_ID,
			message_id: lastMessageId,
			text: lastMessage,
			parse_mode: "Markdown"
		};

		const response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(payload)
		});

		return response;
	} else {
		// Если нет lastMessageId, отправляем новое сообщение
		return sendTelegramMessage(message);
	}
}

function convertMs(ms) {
	const seconds = Math.floor((ms / 1000) % 60);
	const minutes = Math.floor((ms / (1000 * 60)) % 60);
	const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
	return `${hours}h ${minutes}m ${seconds}s`;
}

app.post("/deploy", async (req, res) => {
	const data = req.body;
	try {
		await sendTelegramMessage(
			`🚀 *Launching build.*\n💬 *Commit:* ${data.head_commit.message}\n👤 *Author:* ${data.head_commit.author.username}`
		);
		let time = new Date();
		await execSync("cd /var/www/odin-pro");
		await execSync("git pull");
		await editTelegramMessage(`🔄 *Pulling changes...*`);
		const installingDependencies = await execSync("npm i");
		await editTelegramMessage(`🔄 *Installing dependencies...*\n\`\`\`\n${installingDependencies.stdout}\n\`\`\``);
		await editTelegramMessage(`🔄 *Building...*`);
		const building = await execSync("npm run build");
		await editTelegramMessage(`🔄 *Build passed!*\n\`\`\`\n${building.stdout}\n\`\`\``);
		await editTelegramMessage(`🔄 *Reloading...*`);
		await execSync("pm2 reload npm");
		time = new Date() - time;
		await editTelegramMessage(`✅ *Deploy successful!* in ${convertMs(time)}`);

		lastMessageId = null;
		lastMessage = null;

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
