const Router = require('../larakoa.js/lib/routing/router');

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

    router.get('/account', 'user@getAccount');
}