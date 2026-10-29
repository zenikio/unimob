import { env } from 'cloudflare:workers';
import { building } from '$app/env';
import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { getDb } from '#lib/server/db/index.ts';

const getAuthConfig = () => {
	if (building) {
		return {
			baseURL: 'http://localhost:5173',
			secret: 'build-placeholder-secret-at-least-32-chars-long',
			emailAndPassword: { enabled: true },
			socialProviders: {
				google: {
					clientId: 'placeholder',
					clientSecret: 'placeholder'
				}
			},
			plugins: [sveltekitCookies(getRequestEvent)]
		};
	}

	return {
		baseURL: env.ORIGIN,
		secret: env.BETTER_AUTH_SECRET,
		emailAndPassword: { enabled: true },
		socialProviders: {
			google: {
				clientId: env.GOOGLE_CLIENT_ID,
				clientSecret: env.GOOGLE_CLIENT_SECRET
			}
		},
		plugins: [
			sveltekitCookies(getRequestEvent) // make sure this is the last plugin in the array
		]
	} satisfies Omit<Parameters<typeof betterAuth>[0], 'database'>;
};

export const createAuth = (d1: D1Database) =>
	betterAuth({
		...getAuthConfig(),
		database: drizzleAdapter(getDb(d1), { provider: 'sqlite' })
	});

/**
 * DO NOT USE!
 * This instance is used by the `auth` CLI for schema generation ONLY.
 */
export const auth = (() => {
	if (building) return null as unknown as ReturnType<typeof createAuth>;
	try {
		return createAuth(null!);
	} catch {
		// Secrets not configured: login stays off (see hooks.server.ts).
		return null as unknown as ReturnType<typeof createAuth>;
	}
})();
