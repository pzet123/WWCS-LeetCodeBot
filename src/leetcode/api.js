const { LeetCode } = require("leetcode-query");

const leetcode = new LeetCode();

async function getUser(username) {
  const user = await leetcode.user(username);
  return user;
}

async function getDailyProblem() {
  const { data } = await leetcode.graphql({
    operationName: "daily",
    query: `
      query daily {
        challenge: activeDailyCodingChallengeQuestion {
            date
            link
            question {
                difficulty
                id: questionFrontendId
                title
                slug: titleSlug
                tags: topicTags {
                    name
                    slug
                }
            }
        }
    }`,
  });

  return leetcode.problem(data.challenge.question.slug);
}

module.exports = {
  getUser,
  getDailyProblem,
};
