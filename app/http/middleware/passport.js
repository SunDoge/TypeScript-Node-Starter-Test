const _ = require('lodash');

exports.isAuthenticated = async (ctx, next) => {
    if (ctx.isAuthenticated()) {
        await next();
    } else {
        ctx.redirect('/login');
    }
}

exports.isAuthorized = async (ctx, next) => {
    const provider = ctx.path.split('/').slice(-1)[0];
    if (_.find(ctx.state.user.tokens, { kind: provider })) {
        await next();
    } else {
        ctx.redirect(`/auth/${provider}`);
    }
}