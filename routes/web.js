const Router = require('../larakoa.js/lib/routing/router');
const passportConfig = require('../app/http/middleware/passport');

/**
 * 
 * @param {Router} router 
 */
module.exports = (router) => {
    router.get('/', 'home@index');

    router.get('/login', 'user@getLogin');
    router.post('/login', 'user@postLogin');

    router.get('/logout', 'user@logout');

    router.get('/forgot', 'user@getForgot');
    router.post('/forgot', 'user@postForgot');

    router.get('/reset/:token', 'user@getReset');
    router.post('/reset/:token', 'user@postReset');

    router.get('/signup', 'user@getSignup');
    router.post('/signup', 'user@postSignup');

    router.get('/contact', 'contact@getContact');
    router.post('/contact', 'contact@postContact');

    // router.get('/account', 'user@getAccount');
    // router.post('/account/profile', {middleware: [passportConfig.isAuthenticated], uses: 'user@postUpdateProfile'});
    router.group({prefix: '/account', middleware: [passportConfig.isAuthenticated]}, () => {
        router.get('/', 'user@getAccount');
        router.post('/profile', 'user@postUpdateProfile');
        router.post('/password', 'user@postUpdatePassword');
        router.post('/delete', 'user@postDeleteAccount');
        router.get('/unlink/:provider', 'user@getOauthUnlink')
    })
}