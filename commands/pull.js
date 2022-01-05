const fluidbm = require('../lib/fluidbm');
const chalk = require('chalk');
const axios = require('axios');
const fs = require('fs/promises');
const fsSync = require('fs');
const path = require('path');

const getProjectPath = (relativePath) => path.join(process.cwd(), '/', relativePath);

const fetchSchemaCode = async (schemaId) => {
    try {
        res = await axios.get(`${fluidbm.baseUrl}/api/schema/${schemaId}/code`, {
            headers: {
                Authorization: `Bearer ${fluidbm.getApiToken()}`,
            },
        });
        return res.data;
    } catch (e) {
        if (e?.response?.status == 401) {
            // force logout
            fluidbm.setApiToken(undefined);
            console.log(
                chalk.red(
                    '❌ Invalid Fluidbm CLI Token, please use `fluidbm auth` to authenticate then try agin',
                ),
            );
        } else if (e?.response.status == 404) {
            console.log(
                chalk.red(
                    '❌ Project no longer available, please use `fluidbm clone --force` to re-clone then try agin',
                ),
            );
        } else {
            console.log(chalk.red(`An unexpected error occurred`));
            console.error(e);
        }
        return false;
    }
};

const pullCommand = {
    command: 'pull',
    describe: 'fetches all generated remote and saves it locally',
    handler: async (argv) => {
        const isDryRun = argv.dryRun === true;
        try {
            if (!fluidbm.isAuthenticated()) {
                console.log("You're not logged in");
                console.log(
                    chalk.yellow('Use `fluidbm auth` to authenticate first then try again'),
                );
                return;
            }

            const project = fluidbm.getCurrentProject();
            if (!project) {
                console.log(
                    chalk.red('No active project found, please clone a schema to get started'),
                );
                return;
            }

            // -- fetch code
            const schema = await fetchSchemaCode(project.schemaId);
            if (!schema) {
                return;
            }

            // -- models
            const models = schema.models;

            if (models.length == 0) {
                console.log(
                    chalk.yellow(
                        `Your project is currently empty: Create some models here: ${fluidbm.getProjectUrl(
                            project.schemaId,
                        )}`,
                    ),
                );
            }

            const modelBaseDir = getProjectPath('app/Models');
            if (!fsSync.existsSync(modelBaseDir)) {
                !isDryRun && (await fs.mkdir(modelBaseDir, { recursive: true }));
            }

            if (models.length > 0) {
                console.log('├─── Models');
            }
            for (const model of models) {
                const modelFilePath = path.join(modelBaseDir, model.filename);
                !isDryRun && (await fs.writeFile(modelFilePath, model.content));
                console.log(
                    chalk.green(
                        `│  ├─ ✔ Successfully created Model (${model.name}) at ${modelFilePath}`,
                    ),
                );
            }

            // -- model factories
            const modelFactoryBaseDir = getProjectPath('database/factories');
            if (!fsSync.existsSync(modelFactoryBaseDir)) {
                !isDryRun && (await fs.mkdir(modelFactoryBaseDir, { recursive: true }));
            }
            if (schema.modelFactories?.length > 0) {
                console.log('├─── Model Factories');
            }
            for (const modelFactory of schema.modelFactories) {
                const modelFactoryFilePath = path.join(modelFactoryBaseDir, modelFactory.filename);
                !isDryRun && (await fs.writeFile(modelFactoryFilePath, modelFactory.content));
                console.log(
                    chalk.green(
                        `│  ├─ ✔ Successfully created ${modelFactory.name}Factory at ${modelFactoryFilePath}`,
                    ),
                );
            }

            // -- migrations
            const migrationBaseDir = getProjectPath('database/migrations');
            if (!fsSync.existsSync(migrationBaseDir)) {
                !isDryRun && (await fs.mkdir(migrationBaseDir, { recursive: true }));
            }
            if (schema.migrations?.length > 0) {
                console.log('├─── Migrations');
            }
            for (const migration of schema.migrations) {
                const migrationFilePath = path.join(migrationBaseDir, migration.filename);
                !isDryRun && (await fs.writeFile(migrationFilePath, migration.content));
                console.log(
                    chalk.green(
                        `│  ├─ ✔ Successfully created ${migration.name} table migration at ${migrationFilePath}`,
                    ),
                );
            }

            // -- db seeder
            const dbSeeder = schema.dbSeeder;
            const seederBaseDir = getProjectPath('database/seeders');
            if (!fsSync.existsSync(seederBaseDir)) {
                !isDryRun && (await fs.mkdir(seederBaseDir, { recursive: true }));
            }
            if (dbSeeder?.content?.length > 0) {
                console.log('├─── Seeder');
                const seederFilePath = path.join(seederBaseDir, dbSeeder.filename);
                !isDryRun && (await fs.writeFile(seederFilePath, dbSeeder.content));
                console.log(
                    chalk.green(
                        `│  ├─ ✔ Successfully created ${dbSeeder.name} seeder at ${seederFilePath}`,
                    ),
                );
            }
        } catch (e) {
            console.log(chalk.red('An unexpected error occurred whiling cloning'));
            console.error(e);
        }
    },
};

module.exports = pullCommand;
