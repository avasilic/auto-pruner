import { PrismaPg } from "@prisma/adapter-pg"
import type { Prisma } from "../generated/prisma/client.js"
import { PrismaClient } from "../generated/prisma/client.js"

const adapter = new PrismaPg({
	connectionString: Bun.env.DATABASE_URL
})

export const prisma = new PrismaClient({
	adapter,
	errorFormat: "pretty"
})

/**
 * Fetch data for a specific guild. If the guild doesn't exist in the database, a new record is created with the provided guildId.
 * @param guildId - The ID of the guild to fetch data for
 * @returns The data for the guild
 */
export const getGuildData = async (guildId: string) => {
	return prisma.guild.upsert({
		where: {
			id: guildId
		},
		update: {},
		create: {
			id: guildId
		},
		include: {
			roles: true
		}
	})
}

/**
 * Update the settings of a guild, especially its associated roles.
 *
 * If the `reset` property is set to true in the roles, all roles for the guild will be deleted.
 * If roles are provided as an array, the function will sync the database to match the provided list,
 * adding or removing roles as necessary.
 *
 * @param guildId - The ID of the guild to update.
 * @param settings - An object containing the settings to update.
 */
export const updateGuildSettings = async (
	guildId: string,
	settings: Omit<Prisma.GuildCreateInput, "roles"> & {
		roles?: { reset: boolean; roles: string[] }
	}
) => {
	const { roles, ...upsertSettings } = settings

	const guild = await prisma.guild.upsert({
		where: { id: guildId },
		update: upsertSettings,
		create: { ...upsertSettings, id: guildId }
	})

	if (roles) {
		if (roles.reset) {
			await resetRolesForGuild(guildId)
		} else {
			await syncRolesForGuild(guildId, roles.roles)
		}
	}

	return guild
}

/**
 * Delete a guild and its associated roles from the database.
 *
 * @param guildId - The ID of the guild to delete.
 * @returns Whether a record was deleted.
 */
export const deleteGuildData = async (guildId: string) => {
	const { count } = await prisma.guild.deleteMany({
		where: { id: guildId }
	})
	return count > 0
}

/**
 * Reset (delete) all roles associated with a specific guild.
 *
 * @param guildId - The ID of the guild for which roles should be reset.
 */
const resetRolesForGuild = async (guildId: string) => {
	return prisma.role.deleteMany({
		where: { guild: { id: guildId } }
	})
}

/**
 * Synchronize the provided list of roles with the database for a specific guild.
 * This involves adding new roles, and removing roles that are not in the provided list.
 *
 * @param guildId - The ID of the guild for which roles should be synced.
 * @param roles - An array of role IDs to be synchronized with the database.
 * @returns
 *
 * @example
 * ```js
 * // Assume the guild has roles: ['role1', 'role2', 'role3']
 *
 * // To sync and have the guild roles be ['role1', 'role4']
 * syncRolesForGuild('guild123', ['role1', 'role4']);
 *
 * // After synchronization, the roles 'role2' and 'role3' will be removed, and 'role4' will be added.
 * ```
 */
const syncRolesForGuild = async (
	guildId: string,
	roles: string[]
): Promise<void> => {
	const existingRoles = await prisma.role.findMany({
		where: { guildId: guildId }
	})
	const existingRoleIds = existingRoles.map((role) => role.id)
	const newRoleIds = roles.filter((role) => !existingRoleIds.includes(role))
	const removedRoleIds = existingRoleIds.filter((role) => !roles.includes(role))

	await prisma.role.deleteMany({
		where: { id: { in: removedRoleIds } }
	})

	await prisma.role.createMany({
		data: newRoleIds.map((id) => ({ id, guildId })),
		skipDuplicates: true
	})
}

/**
 * Update the last time a guild's data was pruned.
 *
 * @param guildId - The ID of the guild to update.
 * @param date - The date to set as the last prune date.
 * @returns The updated guild data.
 */
export const updateGuildLastPrune = async (guildId: string, date: Date) => {
	return prisma.guild.upsert({
		where: {
			id: guildId
		},
		update: {
			lastPrune: date
		},
		create: {
			id: guildId,
			lastPrune: date
		}
	})
}
