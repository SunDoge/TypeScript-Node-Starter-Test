const KoaApplication = require('koa');
const { ReflectiveInjector } = require('injection-js');
const Router = require('./routing/router');
const BaseRouter = require('koa-router');
const mitol = require('mitol');
const debug = require('debug')('koa:application');
const Config = require('./config/config');


module.exports = class Application extends KoaApplication {

    constructor(options = {}) {

        options.baseDir = options.baseDir || process.cwd();
        options.type = options.type || 'application';

        super();

        this.options = options;
        this.providers = [];
        this.resolved = false;
        // this.controllers = new Map();
        // Final works
        this.bootstrapContainer();
        // this.bootstrapRouter();


    }

    bootstrapContainer() {
        this.register({ provide: 'app', useValue: this });
        // this.register({ provide: ThisApplication, useValue: this });
        this.registerContainerAliases();
    }

    registerContainerAliases() {
        // test router
        this.register([
            { provide: 'baseRouter', useFactory: function () { return new BaseRouter(); } },
            { provide: 'router', useClass: Router },
            { provide: 'config', useClass: Config },
        ]);
    }

    // bootstrapRouter() {
    //     this.router = this.make('router');
    // }
    get router() {
        return this.make('router');
    }

    get config() {
        return this.make('config');
    }

    register(provider) {
        if (provider instanceof Array) {
            this.providers = this.providers.concat(provider);
        } else {
            this.providers.push(provider);
        }

        // this.resolveAndCreate();
        this.resolved = false;
    }

    resolveAndCreate() {
        this.injector = ReflectiveInjector.resolveAndCreate(this.providers);
        this.resolved = true;
    }

    make(token, notFoundValue) {

        if (!this.resolved) {
            this.resolveAndCreate();
        }

        return this.injector.get(token, notFoundValue);
    }

    useRouter() {
        this.use(this.router.callback());
        this.use(this.router.allowedMethods());
    }

    useMiddleware(middleware) {
        middleware.forEach((value) => {
            this.use(value(this))
        });
    }

    routeMiddleware(middleware) {
        if (!middleware instanceof Array) {
            middleware = [middleware];
        }

        middleware.forEach((value, index) => {
            this.register({ provide: index, useFactory: value, deps: ['app'] });
        });
    }

    get baseDir() {
        return this.options.baseDir;
    }

    // listen(...args) {
    //     debug('listen');
    //     const server = mitol.createServer(this.callback());
    //     return server.listen(...args);
    // }
}