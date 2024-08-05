# Venom Discord Bot

This is the Discord bot for Creation Asylum.

Major credits to [jondeaves](https://github.com/jondeaves) and [gslance](https://github.com/gslance)
for most of the original infrastructure and commands. ❤️

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
application) and `MONGODB_URI` values. See [.env.local.example](/.env.local.example) for a full list
with more information about each variable.

### Bot commands

To add a command you can run the following script:

```sh
pnpm gen command my_command_name
```

### Deployment

#### Linux

You can deploy on a Linux machine using Docker.

```sh
pnpm install-services
```

This will install 2 services on system.d:

1. `venom-bot.service` - runs the bot
2. `venom-db.service` - runs the Mongo database using Docker

They are both set to re-start on failure. You should start them by running:

```sh
pnpm db start
pnpm bot start
```

You can view logs using:

```sh
pnpm db logs
pnpm bot logs
```

Any subcommand other than `logs` is passed directly to system.d with the appropriate service name,
so you can use things like `start`, `stop`, `restart`, `enable`, `disable` and so on.

To update the bot from source, simply use:

```sh
git pull
pnpm bot restart
```

> **IMPORTANT:** Don't forget to save the MegaHAL brain for the bot before restarting it by sending
> `!chat save` on any whitelisted channel the bot is on.
