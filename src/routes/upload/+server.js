import { promises as fs } from 'fs';
import path from 'path';
import { env } from '$env/dynamic/private';

const uploadsDir = path.resolve('static/uploads');

await fs.mkdir(uploadsDir, { recursive: true });

export const POST = async ({ request }) => {
	const contentType = request.headers.get('content-type') || '';

	if (!contentType.includes('multipart/form-data')) {
		return new Response(JSON.stringify({ error: 'Expected multipart/form-data' }), { status: 400 });
	}

	const formData = await request.formData();
	const file = formData.get('file');

	if (!file || typeof file === 'string') {
		return new Response(JSON.stringify({ error: 'No file uploaded' }), { status: 400 });
	}

	const filename = file.name || `upload-${Date.now()}`;
	const safeName = filename.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
	const filepath = path.join(uploadsDir, safeName);

	const arrayBuffer = await file.arrayBuffer();
	const buffer = Buffer.from(arrayBuffer);

	try {
		await fs.writeFile(filepath, buffer);
	} catch (err) {
		return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
	}

	const publicPath = `/uploads/${safeName}`;

	// try to notify Discord via webhook (if configured). Use a best-effort
	// approach: don't fail the upload if the webhook request fails.
	(async () => {
		const webhook = env.DISCORD_WEBHOOK_URL;
		if (!webhook) return;

		try {
			const origin = new URL(request.url).origin;
			const fullUrl = `${origin}${publicPath}`;
			// Discord webhook payload with embed image
			const payload = {
				content: 'A new image was uploaded',
				embeds: [
					{
						title: safeName,
						url: fullUrl,
						image: { url: fullUrl }
					}
				]
			};

			await fetch(webhook, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});
		} catch (e) {
			// ignore webhook errors — not critical to upload
			console.error('Discord webhook failed', e);
		}
	})();

	return new Response(JSON.stringify({ ok: true, path: publicPath, name: safeName }), {
		status: 200
	});
};
