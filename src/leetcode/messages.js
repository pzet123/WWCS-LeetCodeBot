const { decode } = require("html-entities");
const { NodeHtmlMarkdown } = require("node-html-markdown");
const { EmbedBuilder, ThreadAutoArchiveDuration } = require("discord.js");
const leetcodeApi = require("./api.js");
const { titleCase } = require("../utils/textUtils.js");

const LEETCODE_URL = "https://leetcode.com"
const LEETCODE_PROBLEMS_URL = `${LEETCODE_URL}/problems/`;

const EXAMPLE_REGEX = /\*\*Example \d+:/;

function createProblemEmbed(titlePrefix, problem) {
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

  return newEmbedBuilder()
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
        inline: true,
      }
    )
    .setTimestamp();
}

function createUserEmbed(user) {
  let recentSubmissions = "";
  for (let i = 0; i < Math.min(5, user.recentSubmissionList.length); i++) {
    recentSubmissions += `- Submission ${(i + 1)}\n`;
    recentSubmissions += `-	** ${user.recentSubmissionList[i].title}**\n`;
    recentSubmissions += `-	**Language**: ${titleCase(user.recentSubmissionList[i].lang)}\n\n`;
  }

  return newEmbedBuilder()
  .setTitle(`LeetCode User - ${user.matchedUser.username}`)
  .setURL(`${LEETCODE_URL}/${user.matchedUser.username}/`)
  .setThumbnail(user.matchedUser.profile.userAvatar)
  .addFields(
    { name: "Ranking", value: "" + user.matchedUser.profile.ranking },
    { name: "Recent Submissions", value: recentSubmissions }
  );
}

function postDaily(client, channelId) {
  client.channels.fetch(channelId).then((channel) => {
    try {
      leetcodeApi.getDailyProblem().then((problem) => {
        const embed = createProblemEmbed("LeetCode Daily", problem);
        channel.send({ embeds: [embed] }).then((message) => {
          message.startThread({
            name: message.embeds[0].title,
            autoArchiveDuration: ThreadAutoArchiveDuration.ThreeDays
          });
        });
      });
    } catch (err) {
      console.error("Error while trying to send daily leetcode: " + err);
    }
  });
}

function newEmbedBuilder() {
  return new EmbedBuilder().setColor(0x0096fb);
}

module.exports = { createProblemEmbed, createUserEmbed, postDaily };
