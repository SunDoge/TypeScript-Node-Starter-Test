const Router = require('../larakoa.js/lib/routing/router');
const passportConfig = require('../app/http/middleware/passport');
const passport = require('koa-passport');

/**
 * 
 * @param {Router} router 
 */
module.exports = (router) => {
    router.get('/api', 'api@getApi');
    router.get('/api/facebook', {
        middleware: [
            passportConfig.isAuthenticated,
            passportConfig.isAuthorized
        ],
        uses: 'api@getFacebook'
    });

    router.get("/auth/facebook", passport.authenticate("facebook", { scope: ["email", "public_profile"] }));
    router.get("/auth/facebook/callback", {
        middleware: passport.authenticate("facebook", { failureRedirect: "/login" }), fn: (ctx) => {
            res.redirect(req.session.returnTo || "/");
        }
    });
}