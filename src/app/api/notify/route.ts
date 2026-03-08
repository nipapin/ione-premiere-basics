import FormData from "form-data";
import Mailgun from "mailgun.js";
import { NextResponse } from "next/server";
import fs from 'fs'
import path from "path";

const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
    username: "api",
    key: process.env.MAILGUN_API_KEY || "API_KEY",
    url: "https://api.eu.mailgun.net"
});

async function sendToManyAt10PerMinute() {
    const templates = path.resolve('templates');
    const html = fs.readFileSync(`${templates}/send-email-issue.html`, 'utf-8')
    try {
        return await mg.messages.create("mg.odin-pro.com", {
            from: "Odin Pro Team <updates@mg.odin-pro.com>",
            to: [`<recentupdates@mg.odin-pro.com>`],
            subject: "Technical Notification",
            text: `From February 18th to 27th, we experienced technical issues with our email service, preventing requests
from being processed through the Contact Us section.
There were also issues sending confirmation emails and changing user information, such as email, password,
etc.
We have already fixed all the issues, so you can resubmit your request using the button below or try
changing your account information.
We apologize for the inconvenience and wish you a great weekend!
Best regards,
Odin Pro Team`,
            html: html
        });
    } catch (error) {
        console.log("Error sending to", error);
    }

}

export async function GET() {
    const result = await sendToManyAt10PerMinute();
    return NextResponse.json({
        message: "Emails sent (10 per minute)",
        result,
    });
}