const Controller = require('./controller');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: "SendGrid",
    auth: {
        user: process.env.SENDGRID_USER,
        pass: process.env.SENDGRID_PASSWORD
    }
});

module.exports = class ContactController extends Controller {
    async getContact() {
        this.ctx.state.messages = {};
        await this.ctx.render("contact", {
            title: "Contact",
        });
    }

    async postContact() {
        this.ctx.assert("name", "Name cannot be blank").notEmpty();
        this.ctx.assert("email", "Email is not valid").isEmail();
        this.ctx.assert("message", "Message cannot be blank").notEmpty();

        const errors = this.ctx.validationErrors();

        if (errors) {
            this.ctx.flash("errors", errors);
            return this.ctx.redirect("/contact");
        }

        const mailOptions = {
            to: "384813529@qq.com",
            from: `${this.ctx.request.body.name} <${this.ctx.request.body.email}>`,
            subject: "Contact Form",
            text: this.ctx.request.body.message
        };

        await transporter.sendMail(mailOptions).then(() => {
            this.ctx.flash("success", { msg: "Email has been sent successfully!" });
            this.ctx.redirect("/contact");
        }).catch((err) => {
            this.ctx.flash("errors", { msg: err.message });
            this.ctx.redirect("/contact");
        })
    }
}