const Controller = require('../../lib/routing/controller');

module.exports = class TestController extends Controller{
    async index() {
        this.ctx.body = JSON.stringify({
            'code': 'ok',
            'error': this.ctx.params.name,
            'payload': 'Hello World'
        });
    }
}