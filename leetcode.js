const { LeetCode } = require("leetcode-query");

const leetcode = new LeetCode();

async function getUser(username){
    const user = await leetcode.user(username);
    return user;
}

module.exports = { getUser };

