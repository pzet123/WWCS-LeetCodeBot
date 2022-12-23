const { decode } = require('html-entities');
const { NodeHtmlMarkdown } = require('node-html-markdown');

function generateLeetcodeDailyMessage(problem){
    console.log("ProbleMM: " + problem);
    return `
        Good morning **Codesoc** members, here is today's LeetCode:
**${problem.title}**
**Difficulty**: ${problem.difficulty}
**Topic**: ${problem.topicTags[0].name}
${NodeHtmlMarkdown.translate(decode(problem.content))}
    `;
}

module.exports = { generateLeetcodeDailyMessage };