import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	type Guild,
	MessageFlags,
	type SendableChannels,
	TextDisplayBuilder
} from "discord.js"
import { listAndTrimArray } from "./listAndTrimArray.js"
import { logger } from "./logger.js"
import type { ScheduledPruneInfo } from "./misc.js"
import { SUPPORT_SERVER_INVITE_LINK } from "./misc.js"

const fetchLogChannel = async (
	guild: Guild,
	logChannelId: string
): Promise<SendableChannels | null> => {
	const channel = await guild.channels.fetch(logChannelId).catch(() => null)

	if (!channel) {
		logger.warn(
			`Log channel ${logChannelId} not found for guild ${guild.id}, skipping...`
		)
		return null
	}

	if (!channel.isSendable()) {
		logger.warn(
			`Log channel ${logChannelId} in guild ${guild.id} cannot be sent to, skipping...`
		)
		return null
	}

	return channel
}

const supportServerRow = () =>
	new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder()
			.setLabel("Support Server")
			.setURL(SUPPORT_SERVER_INVITE_LINK)
			.setStyle(ButtonStyle.Link)
	)

export const postPruneLogSuccessMessage = async (
	guild: Guild,
	logChannelId: string,
	prune: ScheduledPruneInfo
) => {
	const channel = await fetchLogChannel(guild, logChannelId)
	if (!channel) return

	const roles = prune.roles.length
		? listAndTrimArray(
				prune.roles.map((role) => `<@&${role}>`),
				10
			).join(", ")
		: "None"

	const message = new TextDisplayBuilder().setContent(
		[
			"## Scheduled Prune Successful",
			`Pruned ${
				prune.pruneCount ?? "an unknown amount of"
			} members from **${guild.name}** <t:${Math.round(
				prune.date.getTime() / 1000
			)}:R>.`,
			"",
			`**Included roles:** ${roles}`,
			`**Prune days:** ${prune.days} days`
		].join("\n")
	)

	await channel
		.send({
			components: [message],
			flags: MessageFlags.IsComponentsV2,
			allowedMentions: { parse: [] }
		})
		.catch((error) => {
			logger.error(error, "Error sending prune log message")
		})
}

export const postPruneLogErrorMessage = async (
	guild: Guild,
	logChannelId: string,
	errorMessage: string,
	showInCodeBlock = true
) => {
	const channel = await fetchLogChannel(guild, logChannelId)
	if (!channel) return

	const message = new TextDisplayBuilder().setContent(
		[
			"## Scheduled Prune Unsuccessful",
			`An error occurred while pruning **${guild.name}**.`,
			"",
			showInCodeBlock ? `\`\`\`\n${errorMessage}\n\`\`\`` : errorMessage
		].join("\n")
	)

	await channel
		.send({
			components: [message, supportServerRow()],
			flags: MessageFlags.IsComponentsV2,
			allowedMentions: { parse: [] }
		})
		.catch((error) => {
			logger.error(error, "Error sending prune log message")
		})
}
