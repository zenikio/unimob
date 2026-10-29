import { defineConfig } from 'drizzle-kit';

// Used by `npm run db:studio` and `db:generate`. Credentials come from .env (CLOUDFLARE_*).
try {
	process.loadEnvFile('.env');
} catch {
	// no .env: fine for db:generate, which needs no credentials
}

export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	out: './drizzle',
	dialect: 'sqlite',
	driver: 'd1-http',
	dbCredentials: {
		accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
		databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
		token: process.env.CLOUDFLARE_D1_TOKEN!
	},
	verbose: true,
	strict: true
});
