import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

type ContactPayload = {
	name: string;
	email: string;
	phone?: string;
	service?: string;
	message: string;
};

function isNonEmptyString(value: unknown): value is string {
	return typeof value === 'string' && value.trim().length > 0;
}

export async function POST(request: Request) {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
	}

	const payload = body as Partial<ContactPayload>;

	if (!isNonEmptyString(payload.name)) {
		return NextResponse.json({ error: 'Missing name' }, { status: 400 });
	}
	if (!isNonEmptyString(payload.email)) {
		return NextResponse.json({ error: 'Missing email' }, { status: 400 });
	}
	if (!isNonEmptyString(payload.message)) {
		return NextResponse.json({ error: 'Missing message' }, { status: 400 });
	}

	const SMTP_HOST = process.env.SMTP_HOST;
	const SMTP_PORT = process.env.SMTP_PORT;
	const SMTP_USER = process.env.SMTP_USER;
	const SMTP_PASS = process.env.SMTP_PASS;
	const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER;

	if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
		return NextResponse.json(
			{ error: 'Email service not configured (missing SMTP env vars)' },
			{ status: 500 }
		);
	}

	const transporter = nodemailer.createTransport({
		host: SMTP_HOST,
		port: Number(SMTP_PORT),
		secure: Number(SMTP_PORT) === 465,
		auth: { user: SMTP_USER, pass: SMTP_PASS },
	});

	const to = 'admin@masjidbaiturrahimsb.org';
	const subject = `Contact form: ${payload.name.trim()}`;

	const text = [
		`Nama: ${payload.name.trim()}`,
		`Email: ${payload.email.trim()}`,
		`WhatsApp: ${(payload.phone || '').trim() || '-'}`,
		`Layanan: ${(payload.service || '').trim() || '-'}`,
		'',
		'Pesan:',
		payload.message.trim(),
	].join('\n');

	try {
		await transporter.sendMail({
			from: SMTP_FROM,
			to,
			replyTo: payload.email.trim(),
			subject,
			text,
		});
		return NextResponse.json({ success: true }, { status: 200 });
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Failed sending email';
		return NextResponse.json({ error: message }, { status: 502 });
	}
}

