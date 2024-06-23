const fs = require("node:fs");
const path = require("node:path");
const { Client, Collection, Events, GatewayIntentBits } = require("discord.js");
const cron = require("cron");

const config = require("../config.json");
const { postDaily } = require("./leetcode/messages.js");
const { updateCalendar } = require("./calendar/calendar.js");

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildScheduledEvents] });

// Runs at 1am every day
const scheduledDailyLeetcode = new cron.CronJob("00 01 00 * * *", () => postDaily(client, config.problemChannelId));

// Runs on every fifth minute
const scheduledCalendarUpdate = new cron.CronJob("*/5 * * * *", () => updateCalendar(client, config.guildId));

async function init() {
  // Read commands and log in the bot
  client.commands = new Collection();
  readCommands();
  client.login(config.token);
}

client.on(Events.ClientReady, () => {
  console.log(`Logged in as ${client.user.tag}`);

  // Start the cron jobs
  scheduledDailyLeetcode.start();
  scheduledCalendarUpdate.start();

  // Perform an instant calendar update
  updateCalendar(client, config.guildId, config.calendarId);
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
