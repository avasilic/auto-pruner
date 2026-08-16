import { type Guild, PermissionsBitField, type Snowflake } from "discord.js"

const PRUNE_REQUIRES_ADMIN = "PRUNE_REQUIRES_ADMIN"

/**
 * Whether a guild has opted into requiring Administrator to prune members.
 */
export const pruneRequiresAdministrator = (guild: Guild) =>
	(guild.features as string[]).includes(PRUNE_REQUIRES_ADMIN)

export const PRUNE_REQUIRES_ADMIN_MESSAGE =
	"This server has **require Administrator to prune** turned on, so Discord will only let me prune with the Administrator permission. Either grant me Administrator, or turn that requirement off in Settings > Safety Setup > Permissions > Restrict member prune to admins."

export const LOG_CHANNEL_REQUIRED_PERMISSIONS: readonly bigint[] = [
	// To be able to see the logging channel.
	PermissionsBitField.Flags.ViewChannel,
	// To be able to send log messages in the logging channel.
	PermissionsBitField.Flags.SendMessages,
	// To be able to send log messages in the logging channel if it is a thread.
	PermissionsBitField.Flags.SendMessagesInThreads,
	// To be able to attach files to the log messages (future feature).
	PermissionsBitField.Flags.AttachFiles
] as const

export const GUILD_REQUIRED_PERMISSIONS: readonly bigint[] = [
	// To be able to see the logging channel.
	PermissionsBitField.Flags.ViewChannel,
	// To be able to send log messages in the logging channel.
	PermissionsBitField.Flags.SendMessages,
	// To be able to send log messages in the logging channel if it is a thread.
	PermissionsBitField.Flags.SendMessagesInThreads,
	// To be able to attach files to the log messages (future feature).
	PermissionsBitField.Flags.AttachFiles,
	// To be able to see if the guild was manually pruned (future feature).
	PermissionsBitField.Flags.ViewAuditLog,
	// To be able to prune members.
	PermissionsBitField.Flags.ManageGuild,
	// To be able to prune members.
	PermissionsBitField.Flags.KickMembers
] as const

export interface Setting {
	name: string
	value: string
	role: RoleSettingType | false
	channel: boolean
}

export interface RoleSettingType {
	allowMultiple: boolean
	allowReset: boolean
}

// Internal

export interface RolesStringParserReturn {
	reset: boolean
	roles: Snowflake[]
}

export interface ScheduledPruneInfo {
	guildId: Snowflake
	pruneCount: number | undefined
	roles: Snowflake[]
	days: number
	date: Date
}

export const GUILD_SETTINGS: readonly Setting[] = [
	{
		name: "Auto-prune enabled",
		value: "enabled",
		channel: false,
		role: false
	},
	{
		name: "Auto-prune interval",
		value: "interval",
		channel: false,
		role: false
	},
	{
		name: "Prune days",
		value: "days",
		channel: false,
		role: false
	},
	{
		name: "Prune roles",
		value: "roles",
		channel: false,
		role: {
			allowMultiple: true,
			allowReset: true
		}
	},
	{
		name: "Log channel",
		value: "logChannelId",
		channel: true,
		role: false
	}
] as const

export const SUPPORT_SERVER_INVITE_LINK =
	"https://discord.com/invite/wAhhesqCAH"
