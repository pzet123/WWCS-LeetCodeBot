const fs = require("node:fs");
const path = require("node:path");
const { Client, Collection, Events, GatewayIntentBits } = require("discord.js");
const cron = require("cron");

const config = require("../config.json");
const { postDaily } = require("./leetcode/messages.js");
const leetcodeApi = require("./leetcode/api.js");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const scheduledDailyLeetcode = new cron.CronJob("00 00 08 * * *", () => postDaily(client));

async function init() {
  // Read commands and log in the bot
  client.commands = new Collection();
  readCommands();
  client.login(config.token);

  // Initialise LeetCode API
  await leetcodeApi.init();
  scheduledDailyLeetcode.start();

  postDaily(client, config.problem_channel);
}

client.on(Events.ClientReady, () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isChatInputCommand()) {
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.error(
        `No command matching ${interaction.commandName} was found.`
      );
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  }
});

function readCommands() {
  const commandsPath = path.join(__dirname, "commands");
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

init();
