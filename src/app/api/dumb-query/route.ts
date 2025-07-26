import { query } from "@/app/database/postgre";
import bcrypt from "bcrypt";

function withCORSHeaders(response: Response) {
	response.headers.set("Access-Control-Allow-Origin", "*");
	response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
	response.headers.set("Access-Control-Allow-Headers", "Content-Type, AtomX-Secure-Check");
	return response;
}

export async function OPTIONS() {
	// ⚙️ Ответ на preflight запрос
	return new Response(null, {
		status: 204,
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "POST, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type, AtomX-Secure-Check",
			"Access-Control-Max-Age": "86400"
		}
	});
}

interface Payload {
	email: string;
	password: string;
	type: "login" | "recheck";
	uuid: string;
}

const handleResponse = (payload: Payload) => ({
	login: async () => {
		const user = await query(`SELECT * FROM users WHERE email = $1`, [payload.email], { single: true });

		if (!user) {
			return withCORSHeaders(
				new Response(JSON.stringify({ message: "User with this email not found" }), {
					status: 404,
					headers: { "Content-Type": "application/json" }
				})
			);
		}

		const isPasswordValid = bcrypt.compareSync(payload.password, user.password);

		if (!isPasswordValid) {
			return withCORSHeaders(
				new Response(JSON.stringify({ message: "Email or password is incorrect" }), {
					status: 401,
					headers: { "Content-Type": "application/json" }
				})
			);
		}

		const subscription = await query(`SELECT * FROM subscriptions WHERE user_id = $1`, [user.user_id], {
			single: true
		});

		if (!subscription) {
			return withCORSHeaders(
				new Response(
					JSON.stringify({
						message: "User authenticated successfully",
						id: Number(user.id),
						uuid: user.user_id,
						email: user.email,
						name: user.name,
						lastname: user.lastname,
						status: null,
						price: null,
						order_id: null
					}),
					{ status: 200, headers: { "Content-Type": "application/json" } }
				)
			);
		}

		const subscriptionPricing = await fetch("https://store.payproglobal.com/api/Products/GetProductPricing", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				products: [{ productId: subscription?.product_id }],
				vendorAccountId: process.env.PAYPRO_VENDOR_ACCOUNT_ID,
				apiSecretKey: process.env.PAYPRO_API_SECRET_KEY
			})
		}).then((res) => res.json());

		if (!subscriptionPricing.isSuccess) {
			return withCORSHeaders(
				new Response(JSON.stringify({ message: "Subscription price not found", errors: subscriptionPricing.errors }), {
					status: 404,
					headers: { "Content-Type": "application/json" }
				})
			);
		}

		const subscriptionPrice = subscriptionPricing.response.productPricings[0];

		return withCORSHeaders(
			new Response(
				JSON.stringify({
					message: "User authenticated successfully",
					id: Number(user.id),
					uuid: user.user_id,
					email: user.email,
					name: user.name,
					lastname: user.lastname,
					status: subscription?.status,
					price: subscriptionPrice.billingUnitPrice * subscription?.seats.length,
					order_id: Number(subscription?.order_id)
				}),
				{ status: 200, headers: { "Content-Type": "application/json" } }
			)
		);
	},
	recheck: async () => {
		const user = await query(`SELECT * FROM users WHERE user_id = $1`, [payload.uuid], { single: true });

		if (!user) {
			return withCORSHeaders(
				new Response(JSON.stringify({ message: "User with this uuid not found" }), {
					status: 404,
					headers: { "Content-Type": "application/json" }
				})
			);
		}

		const subscription = await query(`SELECT * FROM subscriptions WHERE user_id = $1`, [user.user_id], {
			single: true
		});

		if (!subscription) {
			return withCORSHeaders(
				new Response(JSON.stringify({ message: "Subscription with this uuid not found" }), {
					status: 404,
					headers: { "Content-Type": "application/json" }
				})
			);
		}

		const subscriptionPricing = await fetch("https://store.payproglobal.com/api/Products/GetProductPricing", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				products: [{ productId: subscription?.product_id }],
				vendorAccountId: process.env.PAYPRO_VENDOR_ACCOUNT_ID,
				apiSecretKey: process.env.PAYPRO_API_SECRET_KEY
			})
		}).then((res) => res.json());

		if (!subscriptionPricing.isSuccess) {
			return withCORSHeaders(
				new Response(JSON.stringify({ message: "Subscription price not found", errors: subscriptionPricing.errors }), {
					status: 404,
					headers: { "Content-Type": "application/json" }
				})
			);
		}

		const subscriptionPrice = subscriptionPricing.response.productPricings[0];

		return withCORSHeaders(
			new Response(
				JSON.stringify({
					message: "Subscription rechecked successfully",
					id: Number(user.id),
					uuid: user.user_id,
					email: user.email,
					name: user.name,
					lastname: user.lastname,
					status: subscription?.status,
					price: subscriptionPrice.billingUnitPrice * subscription?.seats.length,
					order_id: Number(subscription?.order_id)
				}),
				{ status: 200, headers: { "Content-Type": "application/json" } }
			)
		);
	}
});

export async function POST(request: Request) {
	const headers = request.headers;
	const secureCheck = headers.get("AtomX-Secure-Check");

	if (secureCheck !== process.env.ATOMX_SECRET) {
		return withCORSHeaders(new Response(JSON.stringify({ message: "Secure check is incorrect" }), { status: 401 }));
	}

	const payload: Payload = await request.json();

	const handler = handleResponse(payload)[payload.type];

	if (!handler) {
		return withCORSHeaders(new Response(JSON.stringify({ message: "Invalid request" }), { status: 500 }));
	}

	return handler();
}
