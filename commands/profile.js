const { SlashCommandBuilder } = require('discord.js');
const leetcode = require("../leetcode.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('profile')
		.setDescription('Returns profile of the leetcode user')
        .addStringOption(option =>
			option
				.setName("username")
				.setDescription("username of leetcode user")
				.setRequired(true)),
	async execute(interaction) { 
		const username = interaction.options.getString("username") ?? "WWCodeSocLeetCodebot";
		const user = await leetcode.getUser(username);
		await interaction.reply(user.matchedUser.profile.userAvatar);
		await interaction.followUp(parseUser(user));
	},
};


function parseUser(user){
    const recentSubmissions = user.recentSubmissionList;
    userString = ">>> **Username**: " + user.matchedUser.username + "\n"; 
    userString += "**Ranking**: " + user.matchedUser.profile.ranking + "\n";
    userString += "**Recent submissions**: " + "\n";
    for(let i = 0; i < Math.min(5, recentSubmissions.length); i++){
		userString += "- Submission " + (i + 1) + "\n";
        userString += "-	**" + recentSubmissions[i].title + "**\n";
        userString += "-	**Language**: " + recentSubmissions[i].lang + "\n\n";
    }
	return userString;
}