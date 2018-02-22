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

dotenv.config({ path: ".env.example" });

const app = new Application();

app.register([
    {
        provide: 'views', useFactory: function () {
            return views(app.baseDir + '/views', app.config.view)
        }
    },
    {
        provide: 'static', useFactory: function () {
            return serve(app.baseDir + '/public');
        }
    },
    {
        provide: 'bodyParser', useFactory: function () {
            return bodyParser();
        }
    },
    {
        provide: 'session', useFactory: function () {
            return session({}, app)
        }
    },
    {
        provide: 'flash', useFactory: function () {
            return flash();
        }
    },
    {
        provide: 'error', useFactory: function () {
            return error({
                engine: 'pug',
                template: app.baseDir + '/views/error.pug'
            });
        }
    }
]);

app.keys = ['secret'];

app.use(app.make('static'));
app.use(app.make('bodyParser'));
app.use(app.make('session'));
app.use(app.make('views'))
app.use(app.make('flash'));
app.use(app.make('error'));

app.use(passport.initialize());
app.use(passport.session());

app.router.group({ namespace: 'app/http/controllers' }, (router) => {
    require('../routes/web')(router)
});

app.router.group({ namespace: 'app/http/controllers' }, (router) => {
    require('../routes/api')(router)
});

app.useRouter();

// console.log(app.config)

module.exports = app;