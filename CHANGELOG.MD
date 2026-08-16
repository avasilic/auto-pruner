# Changelog

## Version 4.0.0
- BREAKING: Drop the `Server Members` privileged intent. AutoPruner never read member events or member lists, so the intent was actually never. The intent can (and should) now be turned off in the Discord Developer Portal.
- BREAKING: Migrate every message from embeds to Components V2. Titles are now `h3` headings and links are rendered as buttons. Prune failure logs now carry a Support Server button instead of an inline link.
- BREAKING: Switch the database from CockroachDB to PostgreSQL. Existing data has to be migrated across. The table layout is unchanged apart from the primary keys noted below.
- BREAKING: Upgrade to Prisma 7. This adds a `prisma.config.ts`, moves the connection URL out of `schema.prisma`, requires the `@prisma/adapter-pg` driver adapter and generates the client into `src/generated/prisma`. Run `bun run db:generate` after pulling.
- BREAKING: Give `Guild` and `Role` primary keys. The redundant index on `Role.id` has been replaced with one on `Role.guildId`, which is the column queried when syncing roles.
- BREAKING: `Embed Links` is no longer a required permission, since AutoPruner no longer sends embeds. The invite link's permissions have changed accordingly.
- Add a `Dockerfile` and `docker-compose.yml` that run AutoPruner alongside a PostgreSQL database. Migrations are now applied by a one-shot `migrate` container.
- Add committed database migrations under `prisma/migrations`, applied with the new `bun run db:migrate` script.
- Fix the invite link requesting the wrong permissions. It was missing `Manage Server` and `View Audit Log`.
- Fix the prune CRON aborting every remaining guild when one guild could not be fetched. Guilds that can no longer be fetched are now deleted from the database instead.
- Fix roles being written to the database before the guild row existed, which made the first `/settings` call that set roles fail on a foreign key constraint.
- Fix `/settings` reporting success after the settings failed to save.
- Fix `guildDelete` only ever handling the first guild AutoPruner was removed from, and swallowing database errors.
- Fix log messages never being sent when the configured log channel had been deleted.
- Fix `/settings` rejecting comma separated role mentions, and no longer treat a stray "reset" anywhere in the input as a reset.
- Fix invalid intervals being accepted and stored as an invalid date.
- Fix `✅`/`❌`/`Not set` substitution replacing those words anywhere in the settings message rather than only in the values.
- Fix command errors replying with "command not found" and crashing when the command had already deferred its reply.
- Ship logs to Axiom via `@axiomhq/pino`, configured with `AXIOM_ORG_ID`, `AXIOM_DATASET` and `AXIOM_TOKEN`. Axiom is only enabled when `AXIOM_TOKEN` is set.
- Tag every log line with a per-process correlation id.
- Bump every dependency to its latest major, including discord.js 14.27, Biome 2, croner 10, pino 10, nanoid 6 and TypeScript 7.
- Other miscellaneous changes.

## Version 3.0.0
- BREAKING: Require the Manage Server permission to prune (https://github.com/discord/discord-api-docs/pull/6688).
- Warn users when there are permissions the bot needs in the server that it does not have. The warning message is displayed in `/settings`.
- Correctly determine the number of CRON jobs loaded.
- Add a `.editorconfig` file.
- Bump packages.
- Other miscellaneous changes.

## Version 2.1.0
- Bump dependencies
- Show guild count and memory usage in /about
- Delete guilds from database when the bot leaves them

## Version 2.0.1
- Fetch guilds which can be pruned from the database and loop over them, instead of fetching all guilds the client is in and then fetching the settings of each guild from the database.
- Add `select` to database functions.
- Disable two more caches.
- 

## Version 2.0.0
- Rewrite to use npx create-discord-bot.
- Disable caches
- Support any number of days

## Versions <1.0.0
Changelog not available.
