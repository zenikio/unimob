// The whole public catalogue, read from a build-time snapshot (scripts/snapshot.ts).
// Pages are prerendered from this, so visitors never cause a database read.
import content from './data/content.json';

export const categoryLabels = {
	pyq: 'Previous Year Papers',
	notes: 'Notes',
	handwritten: 'Handwritten Notes',
	practice: 'Practice Sets',
	assignment: 'Assignments',
	other: 'Other'
} as const;
export type CategoryKey = keyof typeof categoryLabels;

export type Institution = (typeof content.institutions)[number];
export type Subject = (typeof content.subjects)[number];
export type Resource = (typeof content.resources)[number];

export const institutions = content.institutions;
export const subjects = content.subjects;
export const resources = content.resources;

export const getInstitution = (slug: string) => institutions.find((i) => i.slug === slug);

export const subjectsOf = (institution: string) =>
	subjects.filter((s) => s.institution === institution);

export const getSubject = (institution: string, codeSlug: string) =>
	subjects.find((s) => s.institution === institution && s.codeSlug === codeSlug);

export const resourcesOf = (institution: string, codeSlug: string) =>
	resources.filter((r) => r.institution === institution && r.subject === codeSlug);

export const getResource = (id: string) => resources.find((r) => r.id === id);
