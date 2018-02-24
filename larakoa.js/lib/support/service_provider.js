const { Inject } = require('injection-js');

module.exports = class ServiceProvider {
    static get parameters() {
        return [new Inject('app')];
    }

    constructor(app) {
        this.app = app;
    }
}