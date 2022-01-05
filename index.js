#!/usr/bin/env node

const chalk = require('chalk');
const figlet = require('figlet');
const yargs = require('yargs');

const authCommand = require('./commands/auth');
const cloneCommand = require('./commands/clone');
const pullCommand = require('./commands/pull');

console.log(chalk.yellow(figlet.textSync('Fluidbm', { horizontalLayout: 'full' })));

yargs
    .command(cloneCommand)
    .command(pullCommand)
    .command(authCommand)
    .demandCommand()
    .help(true)
    .parse();
