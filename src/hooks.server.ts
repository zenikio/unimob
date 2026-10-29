import type { Handle } from '@sveltejs/kit/hooks';
import { building } from '$app/env';
import { createAuth } from '#lib/server/auth.ts';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { env } from 'cloudflare:workers';

const handleBetterAuth: Handle = async ({ event, resolve }) => {
	// 1. If we are prerendering at build time, skip auth and just resolve.
	// The D1 database is not available during the static build phase.
	if (building) {
		return resolve(event);
	}

	// 2. Login is optional: without its secrets, serve the public site as-is.
	// Set ORIGIN, BETTER_AUTH_SECRET and the GOOGLE_* secrets to switch it on.
	if (!env.unimob_db || !env.BETTER_AUTH_SECRET || !env.ORIGIN) {
		return resolve(event);
	}

	// 3. Create the auth instance using the binding
	event.locals.auth = createAuth(env.unimob_db);

	// 4. Fetch the session
	const { auth } = event.locals;
	try {
		const session = await auth.api.getSession({ headers: event.request.headers });
		if (session) {
			event.locals.session = session.session;
			event.locals.user = session.user;
		}
	} catch (err) {
		console.warn('Failed to fetch session:', err);
	}

	// 5. Pass it to the Better Auth handler
	return svelteKitHandler({ event, resolve, auth, building });
};

export const handle: Handle = handleBetterAuth;
