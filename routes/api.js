const Router = require('../larakoa.js/lib/routing/router');
const passport = require('../app/http/middleware/passport');

/**
 * 
 * @param {Router} router 
 */
module.exports = (router) => {
    router.get('/api', 'api@getApi');
    router.get('/api/facebook', {
        middleware: [
            passport.isAuthenticated,
            passport.isAuthorized
        ],
        uses: 'api@getFacebook'
    });
}