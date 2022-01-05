const chalk = require('chalk');
const prompt = require('prompt');
const fluidbm = require('../lib/fluidbm');

const authCommand = {
    command: 'auth',
    describe: 'authenticate with Fluidbm CLI Token for api requests',
    handler: async () => {
        console.log('A Fluidbm CLI Token is required to authenticate.');
        console.log(
            `Copy your token from your Fluidbm Dashboard and paste it below: ${chalk.blue(
                `${fluidbm.baseUrl}/account`,
            )}`,
        );
        console.log('-------------------------------------------');

        const promptSchema = {
            properties: {
                token: {
                    pattern: /[a-zA-Z0-9]{32,}/,
                    message: 'Enter a valid token with 32 characters',
                    required: true,
                    hidden: true,
                },
            },
        };

        prompt.start();
        const promptResponse = await prompt.get(promptSchema);
        fluidbm.setApiToken(promptResponse.token);

        console.log(chalk.green(`✔ Successfully authenticated`));
    },
};

module.exports = authCommand;
