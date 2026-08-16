# AutoPruner

AutoPruner is a simple Discord bot that allows you to prune members on a customizable interval. A hosted version of AutoPruner can be invited [here](https://discord.com/api/oauth2/authorize?client_id=1049762823997231134&permissions=274877942946&scope=applications.commands%20bot). The support server is located [here](https://discord.com/invite/wAhhesqCAH).

---

## Running with Docker

This is the recommended way to self-host AutoPruner. The stack has three services:

- `database` — PostgreSQL 18, with its data in the `database` volume.
- `migrate` — a one-shot container that applies database migrations and exits.
- `bot` — AutoPruner itself. It only starts once `migrate` has exited successfully.

Copy `.env.example` to `.env` and fill in `DISCORD_TOKEN` and `APPLICATION_ID`, then:

```bash
docker compose up -d
```

The database is provisioned from `POSTGRES_USER`, `POSTGRES_PASSWORD` and `POSTGRES_DB`. Leave `DATABASE_URL` empty to use the bundled database, or set it to point AutoPruner at an external PostgreSQL server instead.

To follow the logs:

```bash
docker compose logs -f bot
```

Migrations run on every `docker compose up`. To run them on their own:

```bash
docker compose run --rm migrate
```

## Running without Docker

Prerequisites:
- Install [Bun](https://bun.sh) on your machine.
- Have a PostgreSQL database available and set `DATABASE_URL` to its connection string.

```bash
bun install
bun run db:generate
bun run db:migrate
bun run start
```

To register the slash commands:

```bash
bun run deploy
```

## License
This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
