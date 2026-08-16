import { readdirSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { Events } from "discord.js"
import { logger } from "../util/logger.js"
import type { Event } from "./index.js"

export default {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		logger.info(`Ready! Logged in as ${client.user.tag}`)

		logger.info("[CRON] Starting CRONs...")
		const jobsDir = fileURLToPath(new URL("../jobs/", import.meta.url))

		try {
			const jobs = readdirSync(jobsDir).filter((job) => job.endsWith(".ts"))

			for (const job of jobs) {
				logger.info(`[CRON] Starting CRON "${job}"`)
				const { startCron } = await import(join(jobsDir, job))
				startCron(client)
				logger.info(`[CRON] Started CRON "${job}"`)
			}

			logger.info(`[CRON] Started ${jobs.length} CRONs.`)
		} catch (error) {
			logger.warn(error, "[CRON] Failed to load CRONs.")
		}
	}
} satisfies Event<"clientReady">
