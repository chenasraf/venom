# Venom Discord Bot

This is the Discord bot for Creation Asylum.

Major credits to [https://github.com/jondeaves][@jondeaves] and
[gslance](https://github.com/gslance) for most of the original infrastructure and commands. ❤️

## Development

### Requirements

- Requires [NodeJS](https://nodejs.org/)
- Requires [pnpm](https://pnpm.io/)

### Running

- Run `pnpm install` to install dependencies
- Copy `.env.local.example` to `.env.local` and add the missing values
- Run `pnpm dev` to start in development mode

### VSCode

For VSCode install the following plugins;

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

You wil also want to use the below configuration in `.vscode/settings.json` to have Prettier
auto-format code for you.

```json
{
  "eslint.packageManager": "pnpm",
  "javascript.format.enable": false,
  "editor.formatOnSave": true
}
```

### Environment Variables

At a minimum you need to provide the `DISCORD_TOKEN` (which can be found on the Bot tab of a Discord
application) and `MONGODB_URI` values. See table below for possible values.

| key              | description                                                                                                                                          | example                                                |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| COMMAND_TRIGGERS | Prefix(es) of message to let the bot know you are giving it a command. Separate multiple values by `\|`.                                             | `"!"`                                                  |
| CHAT_TRIGGERS    | Prefix(es) of message to let the bot know you are speaking to it directly and expect a generated chatterbot reply. Separate multiple values by `\|`. | `"venom \|v \|venom, \|v, \|venom! \|v! "`             |
| DISCORD_TOKEN    | Discord bots Token                                                                                                                                   |
| NODE_ENV         | What environment the bot is running in                                                                                                               | `production`, `development` or `test`                  |
| LOG_LEVEL        | What level of logs should be displayed in console                                                                                                    | `error`, `warn`, `info`, `verbose`, `debug` or `silly` |
| MONGODB_URI      | Full connection string for MongoDB database, include db_name if user is scoped to single database                                                    | `mongodb://user:password@localhost:27017/venom_db`     |

### Bot commands

To add a command you create a Typescript file in `src/commands/[filename].ts` and ensure it
implements the `src/core/command.ts` interface. You can see the other files in this directory for
implementation examples.
