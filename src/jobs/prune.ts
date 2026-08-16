import { Cron } from "croner"
import {
	type Client,
	DiscordAPIError,
	type Guild,
	RESTJSONErrorCodes
} from "discord.js"
import ms from "ms"
import {
	deleteGuildData,
	prisma,
	updateGuildLastPrune
} from "../util/database.js"
import { logger } from "../util/logger.js"
import {
	postPruneLogErrorMessage,
	postPruneLogSuccessMessage
} from "../util/prune.js"

/**
 * Confirm a guild is still reachable, and forget it if it is not.
 *
 * @returns The guild if it could be fetched, otherwise `null`.
 */
const resolveGuild = async (
	client: Client,
	guildId: string
): Promise<Guild | null> => {
	const guild = await client.guilds.fetch(guildId).catch(() => null)
	if (guild) return guild

	const deleted = await deleteGuildData(guildId).catch((error) => {
		logger.error(error, `Failed to delete guild ${guildId} from the database`)
		return false
	})

	logger.warn(
		`Guild ${guildId} could not be fetched, ${
			deleted ? "deleted it from" : "it was not in"
		} the database.`
	)

	return null
}

const pruneJob = async (client: Client) => {
	logger.info("[CRON] Starting prune job...")
	const startedAt = Date.now()

	const guilds = await prisma.guild.findMany({
		where: {
			enabled: true,
			days: {
				gte: 1,
				lte: 30
			},
			interval: {
				not: null,
				gte: new Date(86_400_000), // At least 1 day
				lt: new Date(365 * 10 * 86_400_000) // Less than 10 years
			}
		},
		include: {
			roles: true
		}
	})

	for (const guildSetting of guilds) {
		if (guildSetting.lastPrune && guildSetting.interval) {
			const lastPrune = new Date(guildSetting.lastPrune)
			// Minus 5 seconds just to not have false positives.
			if (
				lastPrune.getTime() + guildSetting.interval.getTime() >
				Date.now() - 5000
			) {
				logger.debug(
					`Skipping prune for guild ${guildSetting.id} because it was pruned recently.`
				)
				continue
			}
		}

		const clientGuild = await resolveGuild(client, guildSetting.id)
		if (!clientGuild) continue

		const roles = guildSetting.roles.map((role) => role.id)

		const memberCount =
			clientGuild.memberCount ?? clientGuild.approximateMemberCount

		try {
			const pruned = await clientGuild.members.prune({
				days: guildSetting.days,
				count: memberCount !== null && memberCount <= 10_000,
				roles,
				reason: "Scheduled guild prune"
			})

			await updateGuildLastPrune(guildSetting.id, new Date())

			if (guildSetting.logChannelId) {
				await postPruneLogSuccessMessage(
					clientGuild,
					guildSetting.logChannelId,
					{
						guildId: guildSetting.id,
						pruneCount: pruned ?? undefined,
						roles,
						days: guildSetting.days,
						date: new Date()
					}
				)
			}
		} catch (error) {
			logger.error(error, `Error pruning guild ${guildSetting.id}`)

			if (!(error instanceof DiscordAPIError)) continue

			if (
				error.code === RESTJSONErrorCodes.UnknownGuild &&
				!(await resolveGuild(client, guildSetting.id))
			) {
				continue
			}

			if (!guildSetting.logChannelId) continue

			if (error.code === RESTJSONErrorCodes.MissingPermissions) {
				await postPruneLogErrorMessage(
					clientGuild,
					guildSetting.logChannelId,
					"I do not have permission to prune members in this server. Please check that I have the 'Kick Members' and 'Manage Server' permissions.",
					false
				)
				continue
			}

			await postPruneLogErrorMessage(
				clientGuild,
				guildSetting.logChannelId,
				`Discord API Error ${error.code}: ${error.message}`
			)
		}
	}

	logger.info(
		`[CRON] Prune job finished. Took ${ms(Date.now() - startedAt, {
			long: true
		})}.`
	)
}

const startCron = (client: Client) => {
	// Every 30 minutes
	new Cron("*/30 * * * *", async () => {
		await pruneJob(client).catch((error) => {
			logger.error(error, "[CRON] Prune job failed")
		})
	})
}

export { startCron }
