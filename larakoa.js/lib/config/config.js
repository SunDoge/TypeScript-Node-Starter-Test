const fs = require('fs');
const path = require('path');
const { Inject } = require('injection-js');

module.exports = class Config {
    static get parameters() {
        return [new Inject('app')];
    }

    constructor(app) {
        this.app = app;

        const configFiles = fs.readdirSync(path.join(this.app.baseDir, 'config'));

        for (let configFile of configFiles) {
            let config = require(path.join(this.app.baseDir, 'config', configFile));

            if (typeof config === 'function') {
                config = config(this.app);
            }
            // console.log(config);
            // this[config.split('.')[0]] = require(path.join(this.app.baseDir, 'config', config))(this.app);
            this[configFile.split('.')[0]] = config;
        }
    }
}