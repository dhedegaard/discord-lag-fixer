import { config } from "dotenv";
config();
import * as Discord from "discord.js";

const REGIONS = Object.freeze(["eu-west", "eu-central"]);

let lastChange = new Date();

const main = async () => {
  const client = new Discord.Client();
  await client.login(process.env.TOKEN);
  console.log("Logged in successfully");

  client.on("message", message => {
    if (
      !message.author.bot &&
      /^.*fix +lag.*$/i.test(message.content.toLowerCase())
    ) {
      // Check that at least 5 seconds have passed since the last change.
      if (lastChange.getTime() + 5000 > new Date().getTime()) {
        message.reply("Not so fast :)");
        return;
      }

      // Change voice region.
      const currentRegion = message.guild.region;
      const newRegion = REGIONS.filter(e => e !== currentRegion)[0];
      message.guild.setRegion(newRegion);

      // Notify the caller, and update the timestamp.
      message.reply(`Moved from **${currentRegion}** to **${newRegion}**`);
      lastChange = new Date();
    }
  });
};

if (require.main === module) {
  main().catch(error => {
    console.error(error);
    process.exit(1);
  });
}
