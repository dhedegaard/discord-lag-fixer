# Discord lag fixer

[![Docker](https://github.com/dhedegaard/discord-lag-fixer/actions/workflows/docker-publish.yml/badge.svg)](https://github.com/dhedegaard/discord-lag-fixer/actions/workflows/docker-publish.yml)
[![Node.js CI](https://github.com/dhedegaard/discord-lag-fixer/actions/workflows/node.js.yml/badge.svg)](https://github.com/dhedegaard/discord-lag-fixer/actions/workflows/node.js.yml)

A simple bot for fixing discord voice lag issues.

Basically, add the bot to your server and write in one of your guild-based text channels: "fix lag" og "lag fix".

Take a look in the `.env` file, for the various configuration options.

## How to run it

**Using docker:**

1. Pull the docker image (`dhedegaard/discord-lag-fixer`).
1. Run it with a `TOKEN` and `REGIONS_PREFIX` env variable, ie:\
   `docker run -e TOKEN=some-token -e REGIONS_PREFIX=some-prefix dhedegaard/discord-lag-fixer`

**Outside docker:**

1. Make sure you have node 10+ installed.
1. Clone the project
1. Install dependencies\
   `$ yarn`
1. Start the main script\
   `$ yarn start`

## A hosted solution

I host my own version of the bot, feel free to add it to your server.

The "Manage server" permission is required (which is why you probably want to host it yourself).

In any case, you may add the bot by going here:

<https://discordapp.com/api/oauth2/authorize?client_id=591345636180230145&scope=bot&permissions=1072>
