const { LeetCode } = require("leetcode-query");

const leetcode = new LeetCode();
let problems = [];

async function init() {
  problems = await loadProblems();
}

async function getUser(username) {
  const user = await leetcode.user(username);
  return user;
}

async function getRandomProblem() {
  return leetcode.problem(
    problems[Math.floor(Math.random() * problems.length)].titleSlug
  );
}

async function getProblemByTitle(title) {
  return leetcode.problem(
    problems.filter(problem => problem.title === title)[0].titleSlug
  );
}

async function loadProblems() {
  const easyProblems = await fetchProblems(50, "EASY");
  const mediumProblems = await fetchProblems(50, "MEDIUM");
  const hardProblems = await fetchProblems(25, "HARD");
  return easyProblems.questions.concat(
    mediumProblems.questions,
    hardProblems.questions
  );
}

async function fetchProblems(limit, difficulty) {
    return await leetcode.problems({
        limit: limit,
        filters: { difficulty: difficulty }
    });
}

module.exports = {
  init,
  getUser,
  getRandomProblem,
  getProblemByTitle
};
