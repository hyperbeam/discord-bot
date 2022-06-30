# Hyperbeam Discord Bot

A bot to integrate the Hyperbeam API with Discord.

## Requirements

- `pnpm` instead of npm (if you don't have pnpm installed, use `npm install pnpm`)
- Install dependencies with `pnpm install`

## Configuration

- Specify the following in a `.env` file in the root directory:
  - `DISCORD_CLIENT_ID`
  - `DISCORD_CLIENT_SECRET`
  - `DISCORD_BOT_TOKEN`
  - `DISCORD_DEVELOPMENT_GUILD_ID`
  - `HYPERBEAM_API_KEY`
  - `VITE_CLIENT_PORT`
  - `VITE_OAUTH_URL`
- Run the bot with `pnpm bot`
- Run the client with `pnpm client`

## Using PM2

```sh
pnpm install pm2 -g
pm2 start pm2.config.json
pm2 dump # recommended
```

## Notes

- Use `pnpm dlx` instead of `npx` everywhere
- Run `pnpm dlx dotenv-types-generator` after modifying `.env`

## Contributing

tbd
