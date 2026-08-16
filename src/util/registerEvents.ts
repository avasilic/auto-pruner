import { type Client, Events, MessageFlags } from "discord.js"
import { nanoid } from "nanoid"
import type { Command } from "../commands"
import type { Event } from "../events"
import { logger } from "./logger.js"

export function registerEvents(
	commands: Map<string, Command>,
	events: Event[],
	client: Client
): void {
	const interactionCreateEvent: Event<Events.InteractionCreate> = {
		name: Events.InteractionCreate,
		async execute(interaction) {
			if (!interaction.isCommand()) return

			const command = commands.get(interaction.commandName)

			if (!command) {
				const id = nanoid()
				logger.error(
					{ id, commandName: interaction.commandName },
					"Unknown command."
				)
				await respondWithError(
					interaction,
					`Command \`${interaction.commandName}\` was not found. This is a bug. Please report it to the developers with the ID \`${id}\`.`
				)
				return
			}

			try {
				await command.execute(interaction)
			} catch (error) {
				const id = nanoid()
				logger.error(
					{ id, commandName: interaction.commandName, error },
					"An error occurred while executing a command."
				)
				await respondWithError(
					interaction,
					`Something went wrong while running \`${interaction.commandName}\`. Please report it to the developers with the ID \`${id}\`.`
				)
			}
		}
	}

	for (const event of [...events, interactionCreateEvent]) {
		client[event.once ? "once" : "on"](event.name, async (...args) =>
			event.execute(...args)
		)
	}
}

const respondWithError = async (
	interaction: Parameters<Event<Events.InteractionCreate>["execute"]>[0],
	content: string
) => {
	if (!interaction.isRepliable()) return

	try {
		if (interaction.deferred || interaction.replied) {
			await interaction.followUp({ content, flags: MessageFlags.Ephemeral })
			return
		}
		await interaction.reply({ content, flags: MessageFlags.Ephemeral })
	} catch (error) {
		logger.error(error, "Failed to send command error response.")
	}
}
