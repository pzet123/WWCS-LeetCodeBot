const fs = require("node:fs");
const path = require("node:path");
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { token, clientId, guildId, channelId } = require('./config.json');
const { generateLeetcodeDailyMessage } = require("./scheduled_events/dailyLeetcode.js");
const leetcode = require("./leetcode.js");
const cron = require("cron");


const discordClient = new Client({ intents: [GatewayIntentBits.Guilds] });

discordClient.commands = new Collection();

readCommands();

let scheduledDailyLeetcode = new cron.CronJob("00 00 08 * * *", () => {
    const generalChannel = discordClient.channels.cache.find(channel => channel.name === "🧠｜leetcode");
    try{
        const randomProblemPromise = leetcode.getRandomProblem();
        randomProblemPromise.then(function(randomProblem){
            console.log(randomProblem);
            generalChannel.send(generateLeetcodeDailyMessage(randomProblem));
        });
    } catch (e){
        const randomProblemPromise = leetcode.getRandomProblem();
        console.log("Error while trying to send daily leetcode: " + e);
        randomProblemPromise.then(function(randomProblem){
            console.log(randomProblem);
            generalChannel.send(generateLeetcodeDailyMessage(randomProblem));
        });
    }
});

async function init(){
    await leetcode.init();
    scheduledDailyLeetcode.start();
}

discordClient.on(Events.ClientReady, () => {
    console.log(`Logged in as ${discordClient.user.tag}`);
});

discordClient.on(Events.InteractionCreate, async interaction => {
	if (interaction.isChatInputCommand()){
        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }
    
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
});

function readCommands(){
    const commandsPath = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            discordClient.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

discordClient.login(token);

init();