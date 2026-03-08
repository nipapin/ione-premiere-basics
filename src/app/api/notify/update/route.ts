import FormData from "form-data";
import Mailgun from "mailgun.js";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { load } from "cheerio";

const mailgun = new Mailgun(FormData);

const mg = mailgun.client({
    username: "api",
    key: process.env.MAILGUN_API_KEY || "API_KEY",
    url: "https://api.eu.mailgun.net",
});

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const updateDate = searchParams.get("date");
    const secret = searchParams.get("secret");

    if (secret !== process.env.UPDATE_SECRET) {
        return NextResponse.json(
            {
                ok: false,
                message: "Secret is incorrect",
            },
            { status: 401 },
        );
    }

    if (!updateDate) {
        return NextResponse.json(
            {
                ok: false,
                message: "Date parameter is required in the URL",
            },
            { status: 400 },
        );
    }

    const templates = path.resolve("templates");
    const html = fs.readFileSync(`${templates}/updates/${updateDate}.html`, "utf-8");
    const dom = load(html);
    const text = dom.text().trim().replace(/[\t]+/g, "").replace(/\n+/g, "\n");

    try {
        const result = await mg.messages.create("mg.odin-pro.com", {
            from: "Odin Pro Team <updates@mg.odin-pro.com>",
            to: [`<recentupdates@mg.odin-pro.com>`],
            subject: `Odin Pro Update - ${updateDate}`,
            text: text,
            html: html,
        });

        return NextResponse.json(
            {
                ok: true,
                message: "Email sent successfully",
                result: JSON.stringify(result),
            },
            { status: 200 },
        );
    } catch (error) {
        console.log("Error sending to", error);
        return NextResponse.json(
            {
                ok: false,
                message: "Error sending email",
            },
            { status: 500 },
        );
    }
}
