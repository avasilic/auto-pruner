import { nanoid } from "nanoid/non-secure"
import pino from "pino"

const idSerializer = (value: string) => {
	return { id: value }
}

const generateLogId = () => {
	return nanoid()
}

const targets: pino.TransportTargetOptions[] = [
	{
		target: "pino-pretty",
		options: {
			colorize: true
		},
		level: "debug"
	}
]

if (process.env.AXIOM_TOKEN) {
	targets.push({
		target: "@axiomhq/pino",
		level: "debug",
		options: {
			orgId: process.env.AXIOM_ORG_ID,
			dataset: process.env.AXIOM_DATASET,
			token: process.env.AXIOM_TOKEN
		}
	})
}

export const logger = pino(
	{
		redact: ["DISCORD_TOKEN", "DATABASE_URL", "REDIS_URL", "TWO_FACTOR_SECRET"],
		serializers: {
			id: idSerializer,
			error: pino.stdSerializers.errWithCause,
			err: pino.stdSerializers.errWithCause
		},
		timestamp: pino.stdTimeFunctions.isoTime,
		level: "debug"
	},
	pino.transport({
		targets
	})
).child({ id: generateLogId() })

logger.debug(
	process.env.AXIOM_TOKEN
		? "Logger initialized, shipping logs to Axiom"
		: "Logger initialized, Axiom disabled (AXIOM_TOKEN is not set)"
)

logger.flush() // Flush any buffered logs
