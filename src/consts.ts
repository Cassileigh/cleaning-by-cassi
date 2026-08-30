// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = "Cleaning By Cassi";
export const SITE_DESCRIPTION = "Done with precision. Peace of mind delivered.";
export const BUSINESS_START_DATE = new Date('2025-07-03');
export const OWNER_NAME = 'Cassi';
export const SERVICE_AREA = 'Fox Cities & Surrounding Areas';
export const CONTACT_EMAIL = 'cassandramorris@cleaningbycassi.com';
export const BIRTHDATE = new Date('1993-09-26');

// Pure functions — no top-level calculation, so nothing goes stale at import time.
// Call these wherever you need a fresh number.

export function getAge(from: Date = new Date()): number {
	let age = from.getFullYear() - BIRTHDATE.getFullYear();
	const monthDiff = from.getMonth() - BIRTHDATE.getMonth();
	if (monthDiff < 0 || (monthDiff === 0 && from.getDate() < BIRTHDATE.getDate())) {
		age--;
	}
	return age;
}

export function getBusinessTenure(from: Date = new Date()): string {
	const months =
		(from.getFullYear() - BUSINESS_START_DATE.getFullYear()) * 12 +
		(from.getMonth() - BUSINESS_START_DATE.getMonth());

	if (months < 12) {
		return `${months} month${months === 1 ? '' : 's'}`;
	}
	const years = Math.floor(months / 12);
	return `${years} year${years === 1 ? '' : 's'}`;
}
