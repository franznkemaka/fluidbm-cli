const Configstore = require('configstore');
const conf = new Configstore('fluidbm');

const fluidbm = {
    baseUrl: 'https://fluidbm.com',

    isAuthenticated: () => {
        const apiToken = fluidbm.getApiToken();
        return !!apiToken && apiToken.length > 30;
    },

    getCurrentProject: () => {
        const currentProjectPathId = process.cwd();
        const projects = conf.get('fluidbm.projects') ?? {};
        return projects[currentProjectPathId] ?? undefined;
    },

    addProject: (project) => {
        const currentProjectPathId = process.cwd();
        const projects = conf.get('fluidbm.projects') ?? {};
        projects[currentProjectPathId] = project;
        conf.set('fluidbm.projects', projects);
        return project;
    },

    getApiToken: () => {
        return conf.get('fluidbm.token');
    },

    setApiToken: (token) => {
        conf.set('fluidbm.token', token);
    },

    getProjectUrl: (schemaId) => {
        return `${fluidbm.baseUrl}/schema/${schemaId}`;
    },
};

if (process.env.NODE_ENV === 'development') {
    fluidbm.baseUrl = 'http://localhost:3000';
}

module.exports = fluidbm;
