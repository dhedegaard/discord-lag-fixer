import { config } from "dotenv";
config();
import * as Discord from "discord.js";

let lastChange = new Date(0);

const log = (...args: any[]) => {
  console.log(`[${new Date().toUTCString()}]:`, ...args);
};

const main = async () => {
  if (process.env.TOKEN === "") {
    throw new Error("No TOKEN set in env");
  }
  const client = new Discord.Client({
    intents: ["GUILDS", "GUILD_MESSAGES"],
  });
  await client.login(process.env.TOKEN);
  log("Logged in successfully");
  log("");

  // List the current guilds.
  log("Current list of guilds:");
  log("");
  client.guilds
    .fetch()
    .then((guilds) =>
      guilds.forEach((guild) => log("-", guild.name, `(${guild.id})`))
    );
  log("");

  const setActivity = () =>
    client.user?.setActivity('for "fix lag" in chat', {
      type: "WATCHING",
      url: "https://github.com/dhedegaard/discord-lag-fixer",
    });

  // Log various interesting events.
  client.on("disconnect", () => log("Disconnected"));
  client.on("reconnecting", () => log("Reconnecting"));

  // Set the activity now and whenever we're ready after a reconnect.
  setActivity();
  client.on("resume", () => {
    log("resume happened, setting activity again");
    setActivity();
  });

  // Handle messages.
  client.on("messageCreate", async (message) => {
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
    lastChange = new Date();

    // Fetch the current voice regions and determine the current one.
    const regions = await client
      .fetchVoiceRegions()
      .then((e) => e.map((f) => f));
    // @ts-expect-error
    const voiceChannels: Discord.BaseGuildVoiceChannel[] =
      await message.guild.channels
        .fetch()
        .then((e) => Array.from(e.filter((f) => f.isVoice()).values()));
    const currentRegion: Discord.VoiceRegion | undefined = regions.find((r) =>
      voiceChannels.some((c) => regions.some((r) => r.id === c.rtcRegion))
    );

    // Determine the new region to go to.
    const newRegions = regions.filter((e) =>
      currentRegion == null
        ? !e.deprecated
        : !e.deprecated &&
          // Go back and forth between optimal regions.
          currentRegion.optimal !== e.optimal &&
          e.id !== currentRegion.id
    );
    const newRegion = newRegions[Math.floor(Math.random() * newRegions.length)];
    // Change the voice region.
    await Promise.all(
      voiceChannels.map((vc) => vc.setRTCRegion(newRegion?.id ?? ""))
    );

    // Notify the caller, and update the timestamp.
    const currentRegionLabel =
      currentRegion != null
        ? `${currentRegion.name} (${currentRegion.id})`
        : "Automatic";
    const newRegionLabel =
      newRegion == null
        ? "Automatic"
        : `${newRegion.name ?? null} (${newRegion.id})`;
    message.reply(
      `Moved **${voiceChannels.length}** voice channel(s) from **${currentRegionLabel}** to **${newRegionLabel}**`
    );
    log(
      `Moved guild (${message.guild.name}) channelcount **${voiceChannels.length}** from ${currentRegionLabel} to ${newRegionLabel}`
    );
  });
};

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
