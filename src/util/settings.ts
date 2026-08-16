import { MessageMentions } from "discord.js"
import type { Guild, Role } from "../generated/prisma/client.js"
import type { RolesStringParserReturn, Setting } from "./misc.js"

const ROLE_MENTION_PATTERN = new RegExp(MessageMentions.RolesPattern, "g")

export const getSettingDescription = (
	guildSettings: Guild & { roles: Role[] },
	setting: Setting
): string => {
	if (setting.role) {
		if (guildSettings.roles.length === 0) return "None"
		return `\n${guildSettings.roles.map((role) => `> <@&${role.id}>`).join("\n")}`
	}

	const value = guildSettings[setting.value as keyof Guild]

	if (setting.channel) return value ? `<#${value}>` : "Not set"

	if (typeof value === "boolean") return value ? "✅" : "❌"

	if (setting.value === "interval" && value instanceof Date) {
		const intervalHuman = guildSettings.intervalHuman
		if (!intervalHuman) return "Not set"
		if (!guildSettings.lastPrune) return `"${intervalHuman}"`

		const nextPrune = new Date(
			value.getTime() + guildSettings.lastPrune.getTime()
		)
		return `"${intervalHuman}". Next prune is approximately <t:${Math.round(
			nextPrune.getTime() / 1000
		)}:R>.`
	}

	if (value === null || value === undefined) return "Not set"

	return String(value)
}

export const parseRoles = (roles: string): RolesStringParserReturn => {
	if (roles.trim().toLowerCase() === "reset") return { reset: true, roles: [] }

	const roleIds = [...roles.matchAll(ROLE_MENTION_PATTERN)].map(
		(match) => match[1] as string
	)

	return { reset: false, roles: [...new Set(roleIds)] }
}
