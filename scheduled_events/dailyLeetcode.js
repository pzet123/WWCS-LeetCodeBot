const { decode } = require('html-entities');
const { NodeHtmlMarkdown } = require('node-html-markdown');

let LEETCODE_PROBLEMS_URL = "https://leetcode.com/problems/";

function generateLeetcodeDailyMessage(problem){
    console.log("ProbleMM: " + problem);
    return `
        Good morning **Codesoc** members, here is today's LeetCode:

**${problem.title}**
**Difficulty**: ${problem.difficulty}
**Topic**: ${problem.topicTags[0].name}
${NodeHtmlMarkdown.translate(decode(problem.content))}

**Submit your solutions here:** ${LEETCODE_PROBLEMS_URL + problem.titleSlug}/
    `;
}

module.exports = { generateLeetcodeDailyMessage };