import next from "next";
import nextEnv from "@next/env";
import { createServer } from "node:http";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
nextEnv.loadEnvConfig(dirname(fileURLToPath(import.meta.url)), dev);

const hostname = "localhost";
const rawPort = process.env.PORT?.trim();
const port = rawPort ? Number(rawPort) : 3000;
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid PORT in .env");
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
	const httpServer = createServer(handler);

	const io = new Server(httpServer);

	io.on("connection", (socket) => {
		// ...
	});

	httpServer
		.once("error", (err) => {
			console.error(err);
			process.exit(1);
		})
		.listen(port, () => {
			console.log(`> Ready on http://${hostname}:${port}`);
		});
});
