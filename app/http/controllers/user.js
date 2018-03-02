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
        this.ctx.assert("email", "Email is not valid").isEmail();
        this.ctx.assert("password", "Password cannot be blank").notEmpty();
        this.ctx.sanitize("email").normalizeEmail({ gmail_remove_dots: false });

        const errors = this.ctx.validationErrors();

        if (errors) {
            this.ctx.flash("errors", errors);
            return this.ctx.redirect("/login");
        }

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
        this.ctx.assert("email", "Email is not valid").isEmail();
        this.ctx.assert("password", "Password must be at least 4 characters long").len({ min: 4 });
        this.ctx.assert("confirmPassword", "Passwords do not match").equals(this.ctx.request.body.password);
        this.ctx.sanitize("email").normalizeEmail({ gmail_remove_dots: false });


        const errors = this.ctx.validationErrors();

        if (errors) {
            this.ctx.flash("errors", errors);
            return this.ctx.redirect("/signup");
        }

        // console.log(this.ctx.request.body);
        const user = new User({
            email: this.ctx.request.body.email,
            password: this.ctx.request.body.password
        });

        await User.findOne({ email: this.ctx.request.body.email }, (err, existingUser) => {
            // if (err) { return next(err); }
            if (err) {
                throw err;
            }

            if (existingUser) {
                this.ctx.flash("errors", { msg: "Account with that email address already exists." });
                return this.ctx.redirect("/signup");
            }



            user.save((err) => {
                // if (err) { return next(err); }
                if (err) {
                    // throw err;
                    throw err;
                }
                this.ctx.logIn(user, (err) => {
                    if (err) {
                        // return next(err);
                        // throw err;
                        throw err;
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
        this.ctx.assert("email", "Please enter a valid email address.").isEmail();
        this.ctx.sanitize("email").normalizeEmail({ gmail_remove_dots: false });

        const errors = this.ctx.validationErrors();

        if (errors) {
            this.ctx.flash("errors", errors);
            return this.ctx.redirect("/account");
        }

        await User.findById(this.ctx.state.user.id, (err, user) => {
            if (err) {
                throw err;
            }
            user.email = this.ctx.request.body.email || "";
            user.profile.name = this.ctx.request.body.name || "";
            user.profile.gender = this.ctx.request.body.gender || "";
            user.profile.location = this.ctx.request.body.location || "";
            user.profile.website = this.ctx.request.body.website || "";
            user.save((err) => {
                if (err) {
                    if (err.code === 11000) {
                        this.ctx.flash("errors", { msg: "The email address you have entered is already associated with an account." });
                        return this.ctx.redirect("/account");
                    }
                    // return next(err);
                    throw err;
                }
                this.ctx.flash("success", { msg: "Profile information has been updated." });
                this.ctx.redirect("/account");
            });
        });


    }

    async postUpdatePassword() {
        this.ctx.assert("password", "Password must be at least 4 characters long").len({ min: 4 });
        this.ctx.assert("confirmPassword", "Passwords do not match").equals(this.ctx.request.body.password);

        const errors = this.ctx.validationErrors();

        if (errors) {
            this.ctx.flash("errors", errors);
            return this.ctx.redirect("/account");
        }

        await User.findById(this.ctx.state.user.id, (err, user) => {
            if (err) { throw err; }
            user.password = this.ctx.request.body.password;
            user.save((err) => {
                if (err) { throw err; }
                this.ctx.flash("success", { msg: "Password has been changed." });
                this.ctx.redirect("/account");
            });
        });
    }

    async postDeleteAccount() {
        await User.remove({ _id: this.ctx.state.user.id }, (err) => {
            if (err) { throw err; }
            this.ctx.logout();
            this.ctx.flash("info", { msg: "Your account has been deleted." });
            this.ctx.redirect("/");
        });
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