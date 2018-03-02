const Application = require('../larakoa.js/lib/application');
const views = require('koa-views');
const serve = require('koa-static');
const path = require('path');
const bodyParser = require('koa-bodyparser')
const session = require('koa-session');
const passport = require('koa-passport')
const flash = require('../app/http/middleware/koa-flash');
const error = require('koa-error');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const validator = require('koa2-validator');
// const mongoStore = require('koa-session-mongo');
const bluebird = require('bluebird');

// const MongoStore = mongo(session);

dotenv.config({ path: ".env.example" });

const app = new Application();

const mongoUrl = process.env.MONGOLAB_URI;

mongoose.Promise = bluebird;

mongoose.connect(mongoUrl, {}).then(
    () => { /** ready to use. The `mongoose.connect()` promise resolves to undefined. */ },
).catch(err => {
    console.log("MongoDB connection error. Please make sure MongoDB is running. " + err);
    // process.exit();
});

// app.register([
//     {
//         provide: 'views', useFactory: function (config) {
//             return views(app.baseDir + '/views', config.view)
//         }, deps: ['config']
//     },
//     {
//         provide: 'static', useFactory: function () {
//             return serve(app.baseDir + '/public');
//         }
//     },
//     {
//         provide: 'bodyParser', useFactory: function () {
//             return bodyParser();
//         }
//     },
//     {
//         provide: 'session', useFactory: function () {
//             return session({}, app)
//         }
//     },
//     {
//         provide: 'flash', useFactory: function () {
//             return flash();
//         }
//     },
//     {
//         provide: 'error', useFactory: function () {
//             return error({
//                 engine: 'pug',
//                 template: app.baseDir + '/views/error.pug'
//             });
//         }
//     }
// ]);

app.keys = ['secret'];

app.useMiddleware([
    (app) => { return serve(path.join(app.baseDir, 'public')); },
    (app) => { return bodyParser(); },
    (app) => { return validator(); },
    (app) => {
        return session({

        }, app);
    },
    (app) => { return views(path.join(app.baseDir, 'views'), app.config.view); },
    (app) => { return flash(); },
    (app) => {
        return error({
            engine: 'pug',
            template: path.join(app.baseDir, '/views/error.pug')
        })
    },
])

// app.use(app.make('static'));
// app.use(app.make('bodyParser'));
// app.use(app.make('session'));
// app.use(app.make('views'))
// app.use(app.make('flash'));
// app.use(app.make('error'));

app.use(passport.initialize());
app.use(passport.session());

app.router.group({ namespace: 'app/http/controllers' }, (router) => {
    require('../routes/web')(router)
});

app.router.group({ namespace: 'app/http/controllers' }, (router) => {
    require('../routes/api')(router)
});

app.useRouter();

// console.log(app.container.providers);

module.exports = app;