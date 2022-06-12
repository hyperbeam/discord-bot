# Hyperbeam Discord Bot

A bot to integrate the Hyperbeam API with Discord.

## Requirements

- `pnpm` instead of npm (if you don't have pnpm installed, use `npm install pnpm`)
- Install dependencies with `pnpm install`

## Configuration

- Specify `HYPERBEAM_API_KEY`, `BOT_CLIENT_ID` and `BOT_TOKEN` in a `.env` file in the root directory.
- Deploy commands with `pnpm run deploy-commands` before running the bot.
- Run the bot with `pnpm start`

## Using PM2

```sh
pnpm install pm2 -g
pm2 start pm2.json
pm2 dump # recommended
```

## Notes

- Use `pnpm dlx` instead of `npx` everywhere
- Run `pnpm dlx dotenv-types-generator` after modifying `.env`

## Contributing

tbd
