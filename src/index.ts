import { config } from "dotenv";
config();
import * as Discord from "discord.js";

const REGIONS_PREFIX = process.env.REGIONS_PREFIX;
if (typeof REGIONS_PREFIX !== "string" || REGIONS_PREFIX.length < 1) {
  throw new Error("Missing REGIONS_PREFIX setting");
}

let lastChange = new Date(0);

const log = (...args: any[]) => {
  console.log(`[${new Date().toUTCString()}]:`, ...args);
};

const main = async () => {
  const client = new Discord.Client();
  await client.login(process.env.TOKEN);
  await client.user.setActivity('for "fix lag" in chat', {
    type: "WATCHING",
    url: "https://github.com/dhedegaard/discord-lag-fixer"
  });
  log("Logged in successfully");
  log("");

  // List the current guilds.
  log("Current list of guilds:");
  log("");
  client.guilds.forEach(guild => log("-", guild.name, `(${guild.id})`));
  log("");

  // Log various interesting events.
  client.on("disconnect", () => log("Disconnected"));
  client.on("reconnecting", () => log("Reconnecting"));

  // Handle messages.
  client.on("message", async message => {
    // Check if we should ignore the message.
    if (
      message.author.bot || // ignore bots
      !/^.*(fix +lag|lag +fix).*$/i.test(message.content.toLowerCase()) ||
      message.guild == null // ignore DMs
    ) {
      return;
    }

    // Check that at least 5 seconds have passed since the last change.
    if (lastChange.getTime() + 5000 > new Date().getTime()) {
      message.reply("Not so fast :)");
      return;
    }

    // Fetch the current voice regions and determine the current one.
    const regions = (await message.guild.fetchVoiceRegions())
      .filter(e => e.id.startsWith(REGIONS_PREFIX))
      .map(e => e); // Make sure we have an array.
    const currentRegion = regions.find(e => e.id === message.guild.region);

    // Determine the new region to go to.
    const newRegions = regions.filter(e => e.id !== currentRegion.id);
    const newRegion = newRegions[Math.floor(Math.random() * newRegions.length)];
    if (newRegion == null) {
      throw new Error(`No new region to go to: ${JSON.stringify(regions)}`);
    }
    // Change the voice region.
    message.guild.setRegion(newRegion.id);

    // Notify the caller, and update the timestamp.
    const currentRegionLabel =
      currentRegion != null
        ? `${currentRegion.name} (${currentRegion.id})`
        : message.guild.region;
    const newRegionLabel = `${newRegion.name} (${newRegion.id})`;
    message.reply(
      `Moved from **${currentRegionLabel}** to **${newRegionLabel}**`
    );
    log(
      `Moved guild (${
        message.guild.name
      }) from ${currentRegionLabel} to ${newRegionLabel}`
    );
    lastChange = new Date();
  });
};

if (require.main === module) {
  main().catch(error => {
    console.error(error);
    process.exit(1);
  });
}
