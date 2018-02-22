const Controller = require('./controller');
const passport = require('koa-passport');
const User = require('../models/user');

module.exports = class UserController extends Controller {
    async getLogin() {
        if (this.ctx.user) {
            this.ctx.redirect('/');
        }

        await this.ctx.render('account/login', { title: "Login", messages: {} });
    }

    async postLogin() {
        // this.ctx.assert("email", "Email is not valid").isEmail();
        // this.ctx.assert("password", "Password cannot be blank").notEmpty();

        passport.authenticate('local', (err, user, info) => {
            if (err) { throw err; }
            if (!user) {
                this.ctx.flash("errors", info.message);
                return this.ctx.redirect("/login");
            }

            this.ctx.logIn(user, (err) => {
                if (err) { throw err };
                this.ctx.flash("success", { msg: "Success! You are logged in." });
                this.ctx.redirect(req.session.returnTo || "/");
            });
        })(this.ctx);
    }

    async logout() {
        this.ctx.logout();
        this.ctx.redirect('/');
    }

    async getForgot() {
        if (this.ctx.isAuthenticated()) {
            return this.ctx.redirect('/');
        }

        await this.ctx.render("account/forgot", {
            title: "Forgot Password", messages: {}
        });
    }

    async postForgot() {

    }

    async getReset() {

    }

    async postReset() {

    }

    async getSignup() {
        if (this.ctx.user) {
            return this.ctx.redirect('/');
        }

        await this.ctx.render("account/signup", {
            title: "Create Account"
        });
    }

    async postSignup() {
        const user = new User({
            email: req.body.email,
            password: req.body.password
        });
    }

    async getAccount() {
        await this.ctx.render("account/profile", {
            title: "Account Management"
        });
    }
}