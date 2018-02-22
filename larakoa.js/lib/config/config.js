const fs = require('fs');
const path = require('path');
const { Inject } = require('injection-js');

module.exports = class Config {
    static get parameters() {
        return [new Inject('app')];
    }

    constructor(app) {
        this.app = app;

        const configs = fs.readdirSync(path.join(this.app.baseDir, 'config'));

        for (let config of configs) {
            this[config.split('.')[0]] = require(path.join(this.app.baseDir, 'config', config));
        }
    }
}