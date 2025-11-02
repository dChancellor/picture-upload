import { promises as fs } from 'fs';
import path from 'path';

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

	return new Response(JSON.stringify({ ok: true, path: publicPath, name: safeName }), {
		status: 200
	});
};
