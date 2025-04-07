import { exec } from "child_process";
import { NextResponse } from "next/server";

export async function POST() {
	try {
		// Можно добавить проверку подписи, если нужно для безопасности
		// Например, проверить HMAC подпись, если она была настроена в webhook на GitHub

		// Выполняем git pull и перезапуск Nginx (или другого сервиса)
		exec("cd /var/www/odin-pro && git pull && pm2 restart all && systemctl restart nginx", (err, stdout, stderr) => {
			if (err) {
				console.error(`exec error: ${err}`);
				return NextResponse.json({ success: false, error: err.message }, { status: 500 });
			}

			console.log(`stdout: ${stdout}`);
			console.error(`stderr: ${stderr}`);
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
	}
}

export async function GET() {
	return NextResponse.json({ success: false, error: "Method Not Allowed" }, { status: 405 });
}
