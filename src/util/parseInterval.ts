import humanInterval from "human-interval"
import ms, { type StringValue } from "ms"

/**
 * Parse a human readable interval (with an optional leading "every ") into milliseconds.
 *
 * @param interval - The interval to parse, e.g. "every 3 days".
 * @returns The interval in milliseconds, or `undefined` if it could not be parsed.
 */
export const parseInterval = (interval: string): number | undefined => {
	const value = interval.replace("every ", "").trim()

	const humanized = tryParse(() => humanInterval(value))
	if (humanized !== undefined) return humanized

	return tryParse(() => ms(value as StringValue))
}

const tryParse = (parse: () => number | undefined): number | undefined => {
	try {
		const parsed = parse()
		if (typeof parsed !== "number" || Number.isNaN(parsed)) return undefined
		return parsed
	} catch {
		return undefined
	}
}
