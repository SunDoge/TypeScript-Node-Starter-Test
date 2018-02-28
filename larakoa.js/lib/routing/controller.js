// const Context = require('./context');
const Context = require('koa/lib/context');
const Application = require('../application');

module.exports = class Controller {

    /**
     * 
     * @param {Context} ctx
     * 
     */
    setContext(ctx) {
        this.ctx = ctx;
        this.app = ctx.app;
        return this;
    }
}