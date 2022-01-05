const fluidbm = require('../lib/fluidbm');
const chalk = require('chalk');

const cloneCommand = {
    command: 'clone <url>',
    describe: 'to set active schema model',
    handler: (argv) => {
        try {
            const schemaUrl = argv.url;
            const project = fluidbm.getCurrentProject();
            if (project?.schemaId && !argv.force) {
                console.log(chalk.yellow('Already using schema: ', project?.schemaId));
                console.log(`Use --force to switch to provided: ${chalk.yellow(schemaUrl)}`);
                return;
            }
            const schemaId = schemaUrl?.split?.('/').at?.(-1)?.replace?.('#', '')?.trim?.();
            if (!schemaId) {
                console.log(chalk.red(`Unable to extract schema ID from input: ${schemaId}`));
                return;
            }
            // add new
            console.log(chalk.green(`✔ Successfully cloned schema ${schemaId}`));
            fluidbm.addProject({ schemaId });
        } catch (e) {
            console.log(chalk.red('An unexpected error occurred whiling cloning'));
            console.error(e);
        }
    },
};

module.exports = cloneCommand;
