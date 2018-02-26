const mongoose = require('mongoose');
const crypto = require('crypto');
const bcrypt = require('bcrypt-nodejs');

const userSchema = new mongoose.Schema({
    email: { type: String, unique: true },
    password: String,
    passwordResetToken: String,
    passwordResetExpires: Date,

    facebook: String,
    twitter: String,
    google: String,
    tokens: Array,

    profile: {
        name: String,
        gender: String,
        location: String,
        website: String,
        picture: String
    }
}, { timestamps: true });

userSchema.pre("save", function save(next) {
    const user = this;
    if (!user.isModified("password")) { return next(); }
    bcrypt.genSalt(10, (err, salt) => {
        if (err) { return next(err); }
        bcrypt.hash(user.password, salt, undefined, (err, hash) => {
            if (err) {
                return next(err);
                // throw err;
            }
            user.password = hash;
            next();
        });
    });
});

userSchema.methods.comparePassword = function (candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
        cb(err, isMatch);
    });
};

userSchema.methods.gravatar = function (size) {
    if (!size) {
        size = 200;
    }
    if (!this.email) {
        return `https://gravatar.com/avatar/?s=${size}&d=retro`;
    }
    const md5 = crypto.createHash("md5").update(this.email).digest("hex");
    return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
};

// const User = mongoose.model("User", userSchema);
module.exports = mongoose.model("User", userSchema);
