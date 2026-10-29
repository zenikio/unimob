import { sqliteTable, text, integer, uniqueIndex, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export * from './auth.schema';

export const institution = sqliteTable('institution', {
	id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
	name: text('name').notNull(),
	shortName: text('short_name'),
	slug: text('slug').notNull().unique(),
});

export const subject = sqliteTable('subject', {
	id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
	institutionId: text('institution_id').references(() => institution.id).notNull(),
	name: text('name').notNull(),
	code: text('code').notNull(),
	codeSlug: text('code_slug').notNull(),
	short: text('short'), // optional
}, (table) => ({
	// CTO: Unique constraint so we don't get duplicate subjects per institution
	uniqueInstCode: uniqueIndex('subject_inst_code_idx').on(table.institutionId, table.codeSlug),
}));

export const resource = sqliteTable('resource', {
	id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
	subjectId: text('subject_id').references(() => subject.id).notNull(),
	title: text('title').notNull(),
	slug: text('slug').notNull(),
	// CTO: Fixed list of categories
	category: text('category', { 
		enum: ['pyq', 'notes', 'handwritten', 'practice', 'assignment', 'other'] 
	}).notNull().default('notes'),
	// CTO: Use file_key instead of URL
	fileKey: text('file_key').notNull(),
	// CTO: Exam metadata for sorting
	examType: text('exam_type'),
	examYear: integer('exam_year'),
	examMonth: integer('exam_month'),
	status: text('status', { enum: ['published', 'hidden'] }).notNull().default('published'),
	createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
}, (table) => ({
	// CTO: Index on subject_id and status to save D1 read limits
	subjectStatusIdx: index('resource_subject_status_idx').on(table.subjectId, table.status),
}));
