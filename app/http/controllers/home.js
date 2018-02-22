const Controller = require('./controller');

module.exports = class HomeController extends Controller {
    async index() {
        await this.ctx.render('home', { title: 'Home' });
        // this.ctx.body = 'test'
    }
}