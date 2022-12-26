const { SlashCommandBuilder } = require("discord.js");
const leetcodeApi = require("../leetcode/api.js");
const leetcodeMessages = require("../leetcode/messages.js");

async function execute(interaction) {
  interaction.deferReply();

  const username =
    interaction.options.getString("username") ?? "WWCodeSocLeetCodebot";
  const user = await leetcodeApi.getUser(username);
  const embed = leetcodeMessages.createUserEmbed(user);
  await interaction.editReply({ embeds: [embed] });
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("profile")
    .setDescription("Returns the profile of a given LeetCode user")
    .addStringOption((option) =>
      option
        .setName("username")
        .setDescription("Username of LeetCode user")
        .setRequired(true)
    ),

  execute,
};
