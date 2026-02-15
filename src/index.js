#!/usr/bin/env node

const chalk = require('chalk');
const inquirer = require('inquirer');
const { execSync } = require('child_process');

async function getStats(username) {
  const query = `{
    user(login: "${username}") {
      repositories(first: 100, ownerAffiliations: OWNER, orderBy: {field: STARGAZERS, direction: DESC}) {
        nodes {
          name
          stargazerCount
          forkCount
          primaryLanguage { name }
          updatedAt
        }
      }
      followers { totalCount }
      repositoriesContributedTo { totalCount }
    }
  }`;
  const result = JSON.parse(execSync(`gh api graphql -f query='${query}'`, { encoding: 'utf8' }));
  return result.data.user;
}

async function showStats() {
  const username = 'yksanjo';
  console.log(chalk.blue('\n📊 Fetching statistics...\n'));
  
  const user = await getStats(username);
  const repos = user.repositories.nodes;
  
  const totalStars = repos.reduce((sum, r) => sum + r.stargazerCount, 0);
  const totalForks = repos.reduce((sum, r) => sum + r.forkCount, 0);
  const languages = {};
  
  repos.forEach(r => {
    if (r.primaryLanguage) languages[r.primaryLanguage.name] = (languages[r.primaryLanguage.name] || 0) + 1;
  });
  
  console.log(chalk.cyan('Overview:'));
  console.log(`  Total Repos: ${repos.length}`);
  console.log(`  Total Stars: ${totalStars}`);
  console.log(`  Total Forks: ${totalForks}`);
  console.log(`  Followers: ${user.followers.totalCount}`);
  console.log(`  Contributed To: ${user.repositoriesContributedTo.totalCount}`);
  console.log(chalk.cyan('\nTop Languages:'));
  Object.entries(languages).sort((a, b) => b[1] - a[1]).slice(0, 5).forEach(([lang, count]) => {
    console.log(`  ${lang}: ${count} repos`);
  });
  console.log(chalk.cyan('\nTop Repos:'));
  repos.slice(0, 5).forEach(r => {
    console.log(`  ⭐ ${r.name}: ${r.stargazerCount} stars`);
  });
}

async function main() {
  console.log(chalk.cyan(`
╔═══════════════════════════════════════╗
║  📊 Repo Stats Generator v1.0.0    ║
╚═══════════════════════════════════════╝
  `));
  await showStats();
}

if (require.main === module) main().catch(console.error);
module.exports = { main };
