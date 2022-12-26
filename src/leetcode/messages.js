const { decode } = require("html-entities");
const { NodeHtmlMarkdown } = require("node-html-markdown");
const { EmbedBuilder } = require("discord.js");
const leetcodeApi = require("./api.js");

const LEETCODE_PROBLEMS_URL = "https://leetcode.com/problems/";
const EXAMPLE_REGEX = /\*\*Example \d+:/;

function generateEmbed(titlePrefix, problem) {
  let content = NodeHtmlMarkdown.translate(decode(problem.content)).trim();

  // We don't want to show examples, only the problem description (for now)
  const match = content.match(EXAMPLE_REGEX);
  if (match) {
    content = content.substring(0, match.index).trimEnd();
  }

  // If we don't want a title prefix, just title it with the problem title
  const title = titlePrefix
    ? `${titlePrefix} - ${problem.title}`
    : problem.title;

  const embed = new EmbedBuilder()
    .setColor(0x0096fb)
    .setTitle(title)
    .setURL(`${LEETCODE_PROBLEMS_URL + problem.titleSlug}/`)
    .setThumbnail(
      "https://cdn.discordapp.com/icons/880115166090502194/a_a67c6e725670d3353ce33d15d4c3f871.webp"
    )
    .setDescription(content)
    .addFields(
      { name: "Difficutly", value: problem.difficulty, inline: true },
      {
        name: "Topics",
        value: problem.topicTags.map((tag) => tag.name).join(", "),
        inline: true
      }
    )
    .setTimestamp();
  return embed;
}

function postDaily(client, channelId) {
  client.channels.fetch(channelId).then((channel) => {
    try {
      leetcodeApi.getProblemByTitle("Number of 1 Bits").then((problem) => {
        const embed = generateEmbed("LeetCode Daily", problem);
        channel.send({ embeds: [embed] });
      });
    } catch (err) {
      console.error("Error while trying to send daily leetcode: " + err);
    }
  });
}

module.exports = { generateEmbed, postDaily };
