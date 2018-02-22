const Controller = require('./controller');
const graph = require('fbgraph')

module.exports = class ApiController extends Controller {
    async getApi() {
        await this.ctx.render("api/index", {
            title: "API Examples",
        });
    }

    async getFacebook() {
        const token = this.ctx.state.user.tokens.find((token) => token.kind === 'facebook');
        graph.setAccessToken(token.accessToken);
        graph.get(`${this.ctx.state.user.facebook}?fields=id,name,email,first_name,last_name,gender,link,locale,timezone`, async (err, results) => {
            if (err) { throw err; }
            await this.ctx.render("api/facebook", {
                title: "Facebook API",
                profile: results
            });
        });
    }
}