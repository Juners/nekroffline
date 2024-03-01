// place files you want to import through the `$lib` alias in this folder.

export const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

export function paddingLeft(original: string, maxLength: number, fillString?: string) {
	if (''.padStart !== undefined) {
		return original.padStart(maxLength, fillString);
	} else {
		const padding = new Array(maxLength)
			.fill(fillString || ' ')
			.join('')
			.slice(-original.length);
		return `${padding}${original}`;
	}
}

export function getLastMonthDate() {
	const date = new Date();
	date.setDate(1);
	date.setTime(date.getTime() - ONE_DAY_IN_MS);
	date.setDate(1);
	return date;
}
