const { LeetCode } = require("leetcode-query");

const leetcode = new LeetCode();
titleSlugs = [];
problems = [];

async function init(){
    problems = await getProblems();
}

async function getUser(username){
    const user = await leetcode.user(username);
    return user;
}

async function getRandomProblem() {
    return leetcode.problem(problems[Math.floor(Math.random() * problems.length)].titleSlug);
}

async function getProblems(){
    const easyProblems = await leetcode.problems({limit: 50, filters: {difficulty: "EASY"}});
    const mediumProblems = await leetcode.problems({limit: 50, filters: {difficulty: "MEDIUM"}});
    const hardProblems = await leetcode.problems({limit: 25, filters: {difficulty: "HARD"}});
    const problems = easyProblems.questions.concat(mediumProblems.questions, hardProblems.questions);
    return problems;
}

function getTitleSlugs(problems){
    titles = [];
    console.log(problems);
    problems.forEach(function(problem) {
        titles.push(problem.titleSlug);
    });
    return titles;
}

async function getRecentUserSubsForProblem(username, problemSlug){

}

module.exports = { init, getUser, getRandomProblem, getTitleSlugs, getProblems, getRecentUserSubsForProblem, problems };

