const Controller = require('./controller');
const passport = require('koa-passport');
const User = require('../models/user');

module.exports = class UserController extends Controller {
    async getLogin() {
        if (this.ctx.user) {
            return this.ctx.redirect('/');
        }
        await this.ctx.render('account/login', { title: "Login" });
    }

    async postLogin() {
        // this.ctx.assert("email", "Email is not valid").isEmail();
        // this.ctx.assert("password", "Password cannot be blank").notEmpty();

        await passport.authenticate('local', (err, user, info) => {
            if (err) { throw err; }
            if (!user) {
                this.ctx.flash("errors", { msg: info.message });
                return this.ctx.redirect("/login");
            }

            this.ctx.logIn(user, (err) => {
                if (err) { throw err };
                this.ctx.flash("success", { msg: "Success! You are logged in." });
                this.ctx.redirect(this.ctx.session.returnTo || "/");
            });
        })(this.ctx);
    }

    async logout() {
        this.ctx.logout();
        this.ctx.redirect('/');
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
        // console.log(this.ctx.request.body);
        const user = new User({
            email: this.ctx.request.body.email,
            password: this.ctx.request.body.password
        });

        await User.findOne({ email: this.ctx.request.body.email }, (err, existingUser) => {
            // if (err) { return next(err); }
            if (err) {
                console.log(err);
            }

            if (existingUser) {
                this.ctx.flash("errors", { msg: "Account with that email address already exists." });
                return this.ctx.redirect("/signup");
            }



            user.save((err) => {
                // if (err) { return next(err); }
                if (err) {
                    // throw err;
                    console.log(err);
                }
                this.ctx.logIn(user, (err) => {
                    if (err) {
                        // return next(err);
                        // throw err;
                        console.log(err);
                    }
                    this.ctx.redirect("/");
                });
            });
        });
    }

    async getAccount() {
        await this.ctx.render("account/profile", {
            title: "Account Management"
        });
    }

    async postUpdateProfile() {
        
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


}