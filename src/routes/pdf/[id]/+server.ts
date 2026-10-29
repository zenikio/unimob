import { error } from '@sveltejs/kit';
import { env } from 'cloudflare:workers';
import { getResource } from '#lib/content.ts';
import type { RequestHandler } from './$types';

// Streams a published resource's PDF out of R2. R2 stays private; this is the only way in.
// ?download=1 forces a save-as with the resource title as the filename.
export const GET: RequestHandler = async ({ params, request, url }) => {
	// Looked up in the build-time snapshot, so serving a PDF costs no D1 read.
	const res = getResource(params.id);
	if (!res) throw error(404, 'Resource not found');

	// request.headers lets R2 honour Range, which the PDF viewer uses to load big files lazily.
	const object = await env.unimob_files.get(res.fileKey, { range: request.headers });
	if (!object) throw error(404, 'File not found');

	const headers = new Headers();
	object.writeHttpMetadata(headers);
	headers.set('etag', object.httpEtag);
	headers.set('content-type', 'application/pdf');
	headers.set('accept-ranges', 'bytes');
	headers.set('cache-control', 'public, max-age=86400');
	// The HTML page at /r/... is the canonical, indexable URL.
	headers.set('x-robots-tag', 'noindex');

	const disposition = url.searchParams.has('download') ? 'attachment' : 'inline';
	const filename = res.title.replace(/[^\w\- ]+/g, '').trim() || 'resource';
	headers.set('content-disposition', `${disposition}; filename="${filename}.pdf"`);

	// `body` is absent when the conditional/range request has nothing to send.
	if (!('body' in object)) return new Response(null, { status: 304, headers });

	let status = 200;
	if (request.headers.has('range') && object.range) {
		const r = object.range as { offset?: number; length?: number; suffix?: number };
		const offset = r.offset ?? Math.max(0, object.size - (r.suffix ?? object.size));
		const length = r.length ?? object.size - offset;
		headers.set('content-range', `bytes ${offset}-${offset + length - 1}/${object.size}`);
		headers.set('content-length', String(length));
		status = 206;
	} else {
		headers.set('content-length', String(object.size));
	}
	return new Response(object.body, { status, headers });
};
