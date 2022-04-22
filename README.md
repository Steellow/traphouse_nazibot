# Traphouse Nazibot

- Telegram bot
- Reminds who has to clean what on cleaning days
- Sends list of cleaning tasks to our group chat

## Architecture

- [node-schedule](https://www.npmjs.com/package/node-schedule) to schedule messages
- [node-persist](https://www.npmjs.com/package/node-persist) to save current state in case the bot crashes

## Environment variable

Specify these env vars to your `.env` file (or somewhere else)

- `BOT_TOKEN`
- `GROUP_ID`