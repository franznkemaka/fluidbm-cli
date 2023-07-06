const fluidbm = require('../lib/fluidbm');
const chalk = require('chalk');
const axios = require('axios');
const fs = require('fs/promises');
const fsSync = require('fs');
const path = require('path');

const getProjectPath = (relativePath) => path.join(process.cwd(), '/', relativePath);

const getStructure = (module) => module === undefined ? pathStructure.app : pathStructure.module;
const getFolderPath = (folder, module = undefined) => path.join(process.cwd(), '/', getStructure(module).root(module), '/', getStructure(module)[folder]);

const pathStructure = {
    app: {
        root: () => 'app',
        models: 'Models',
        factories: 'database/factories',
        migrations: 'database/migrations',
        seeders: 'database/seeders',
    },
    module: {
        root: (module) => 'Modules/' + module,
        models: 'Entities',
        factories: 'Database/factories',
        migrations: 'Database/migrations',
        seeders: 'Database/seeders',
    }
}

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
        } else if (e?.response?.status == 404) {
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
    command: 'pull [module]',
    describe: 'fetches all generated remote and saves it locally',
    handler: async (argv) => {
        const startTime = process.hrtime();
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

            const structure = getStructure(argv.module)
            console.log(chalk.magenta(structure.root(argv.module)));

            const modelBaseDir = getFolderPath('models', argv.module);
            if (!fsSync.existsSync(modelBaseDir)) {
                !isDryRun && (await fs.mkdir(modelBaseDir, { recursive: true }));
            }

            if (models.length > 0) {
                console.log('├─── Models ─> ' + chalk.magenta(structure.models));
            }
            for (const model of models) {
                const modelFilePath = path.join(modelBaseDir, model.filename);
                !isDryRun && (await fs.writeFile(modelFilePath, model.content));
                console.log('│  ├─ ' + chalk.green(model.name));
            }

            // -- model factories
            const modelFactoryBaseDir = getFolderPath('factories', argv.module);
            if (!fsSync.existsSync(modelFactoryBaseDir)) {
                !isDryRun && (await fs.mkdir(modelFactoryBaseDir, { recursive: true }));
            }
            if (schema.modelFactories?.length > 0) {
                console.log('├─── Model Factories ─> ' + chalk.magenta(structure.factories));
            }
            for (const modelFactory of schema.modelFactories) {
                const modelFactoryFilePath = path.join(modelFactoryBaseDir, modelFactory.filename);
                !isDryRun && (await fs.writeFile(modelFactoryFilePath, modelFactory.content));
                console.log('│  ├─ ' + chalk.green(modelFactory.name + 'Factory'));
            }

            // -- migrations
            const migrationBaseDir = getFolderPath('migrations', argv.module);
            if (!fsSync.existsSync(migrationBaseDir)) {
                !isDryRun && (await fs.mkdir(migrationBaseDir, { recursive: true }));
            }
            if (schema.migrations?.length > 0) {
                console.log('├─── Migrations ─> ' + chalk.magenta(structure.migrations));
            }
            for (const migration of schema.migrations) {
                const migrationFilePath = path.join(migrationBaseDir, migration.filename);
                !isDryRun && (await fs.writeFile(migrationFilePath, migration.content));
                console.log('│  ├─ ' + chalk.green(migration.name));
            }

            // -- db seeder
            const dbSeeder = schema.dbSeeder;
            const seederBaseDir = getFolderPath('seeders', argv.module);
            if (!fsSync.existsSync(seederBaseDir)) {
                !isDryRun && (await fs.mkdir(seederBaseDir, { recursive: true }));
            }
            if (dbSeeder?.content?.length > 0) {
                console.log('├─── Seeder ─> ' + chalk.magenta(structure.seeders));
                const seederFilePath = path.join(seederBaseDir, dbSeeder.filename);
                !isDryRun && (await fs.writeFile(seederFilePath, dbSeeder.content));
                console.log('│  ├─ ' + chalk.green(dbSeeder.name));
            }
            console.log(`${chalk.green('success')} Pull completed`);
            const executionTime = process.hrtime(startTime);

            console.log(
                `Done in ${(executionTime[0] * 1000 + executionTime[1] / 1e9).toFixed(2)}s`,
            );
        } catch (e) {
            console.log(chalk.red('An unexpected error occurred whiling cloning'));
            console.error(e);
        }
    },
};

module.exports = pullCommand;
