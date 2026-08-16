import { Events } from "discord.js"
import { deleteGuildData } from "../util/database.js"
import { logger } from "../util/logger.js"
import type { Event } from "./index.js"

export default {
	name: Events.GuildDelete,
	async execute(guild) {
		logger.info(`Left guild ${guild.name} (${guild.id})`)

		await deleteGuildData(guild.id).catch((error) => {
			logger.error(
				error,
				`Failed to delete guild ${guild.id} from the database`
			)
		})
	}
} satisfies Event<"guildDelete">
