const Controller = require('./controller');

module.exports = class ContactController extends Controller {
    async getContact() {
        await this.ctx.render("contact", {
            title: "Contact",
        });
    }

    async postContact() {
        this.ctx.assert("name", "Name cannot be blank").notEmpty();
        this.ctx.assert("email", "Email is not valid").isEmail();
        this.ctx.assert("message", "Message cannot be blank").notEmpty();

    }
}