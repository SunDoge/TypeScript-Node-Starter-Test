const { Inject } = require('injection-js');
const Application = require('../application');
const BaseRouter = require('koa-router');

module.exports = class Router {

    static get parameters() {
        return [new Inject('app'), new Inject('baseRouter')];
    }

    /**
     * 
     * 
     * @param {Application} app 
     * @param {BaseRouter} baseRouter
     */
    constructor(app, baseRouter) {
        this.app = app;
        this.baseRouter = baseRouter;
        this.groupStack = [];
        this.namedRoutes = new Map();
        this.routes = new Map();
    }

    group(attributes, callback) {
        if (attributes.middleware != undefined && typeof attributes.middleware == 'string') {
            attributes.middleware = attributes.middleware.split('|');
        }

        this.updateGroupStack(attributes);

        callback(this);

        this.groupStack.pop();
    }

    updateGroupStack(attributes) {
        if (this.groupStack.length > 0) {
            attributes = this.mergeWithLastGroup(attributes);
        }

        this.groupStack.push(attributes);
    }


    mergeGroup(newGroup, oldGroup) {

        newGroup.namespace = Router.formatUsesPrefix(newGroup, oldGroup);

        newGroup.prefix = Router.formatGroupPrefix(newGroup, oldGroup);

        if (newGroup.domain != undefined) {
            oldGroup.domain = undefined;
        }

        if (oldGroup.as != undefined) {
            newGroup.as = oldGroup.as + (newGroup.as != undefined) ? '.' + newGroup.as : '';
        }

        // null is also !isset(), use == undefined
        if (oldGroup.suffix != undefined && newGroup.suffix == undefined) {
            newGroup.suffix = oldGroup.suffix;
        }

        // return array_merge_recursive(Arr::except($old, ['namespace', 'prefix', 'as', 'suffix']), $new);
        let middleware = [];

        if (oldGroup.middleware != undefined) {
            middleware = middleware.concat(oldGroup.middleware);
        }

        if (newGroup.middleware != undefined) {
            middleware = middleware.concat(newGroup.middleware);
        }

        newGroup.middleware = middleware;
        // console.log('newGroup.middleware', middleware)
        return newGroup;
    }

    mergeWithLastGroup(newGroup) {
        return this.mergeGroup(newGroup, this.groupStack.slice(-1)[0]);
    }

    static formatUsesPrefix(newUses, oldUses) {
        if (newUses.namespace != undefined) {
            return oldUses.namespace != undefined && newUses.namespace.indexOf('/') !== 0
                ? oldUses.namespace.replace(/^\/+|\/+$/g, '') + '/' + newUses.namespace.replace(/^\/+|\/+$/g, '')
                : newUses.namespace.replace(/^\/+|\/+$/g, '');
        }

        return oldUses.namespace != undefined ? oldUses.namespace : null;
    }

    static formatGroupPrefix(newGroup, oldGroup) {
        const oldPrefix = oldGroup.prefix != undefined ? oldGroup.prefix : null;

        if (newGroup.prefix != undefined) {
            return (oldPrefix ? oldPrefix.replace(/^\/+|\/+$/g, '') : '') + '/' + newGroup.prefix.replace(/^\/+|\/+$/g, '');
        }
        return oldPrefix;
    }

    addRoute(method, uri, action) {
        action = this.parseAction(action);

        let attributes = null;

        if (this.hasGroupStack()) {
            attributes = this.mergeWithLastGroup({});
        }

        if (attributes && attributes instanceof Object) {
            if (attributes.prefix != undefined) {
                uri = attributes.prefix.replace(/^\/+|\/+$/g, '') + '/' + uri.replace(/^\/+|\/+$/g, '');
            }

            if (attributes.suffix != undefined) {
                // rtrim suffix
                uri = uri.replace(/^\/+|\/+$/g, '') + attributes.suffix.replace(/\/+$/g, '');
            }

            action = this.mergeGroupAttributes(action, attributes);
        }

        uri = '/' + uri.replace(/^\/+|\/+$/g, '');

        if (action.as != undefined) {
            this.namedRoutes.set(action.as, uri);
        }

        if (method instanceof Object) {
            for (let verb of method) {
                // (this.baseRouter as any)[verb]();
                this.routes.set(verb + uri, { method: verb, uri: uri, action: action });
            }
        } else {
            this.routes.set(method + uri, { method: method, uri: uri, action: action });
        }
    }

    parseAction(action) {
        if (typeof action == 'string') {
            return { uses: action };
        } else if (typeof action == 'function') {
            return { fn: action }
        }
        // console.log('action', action)
        if (action.middleware != undefined && typeof action.middleware == 'string') {
            action.middleware = action.middleware.split('|');
            // console.log(action.middleware);
        }

        return action;
    }

    hasGroupStack() {
        return this.groupStack.length > 0;
    }

    mergeGroupAttributes(action, attributes) {
        const namespace = attributes.namespace ? attributes.namespace : null;
        const middleware = attributes.middleware ? attributes.middleware : null;
        const as = attributes.as ? attributes.as : null;

        return this.mergeNamespaceGroup(
            this.mergeMiddlewareGroup(
                this.mergeAsGroup(action, as),
                middleware
            ),
            namespace
        );
    }

    mergeNamespaceGroup(action, namespace = null) {
        if (namespace && action.uses != undefined) {
            action.uses = namespace + '/' + action.uses;
        }

        return action;
    }

    mergeMiddlewareGroup(action, middleware = null) {
        if (middleware) {
            if (action.middleware != undefined) {
                action.middleware = middleware.concat(action.middleware);
            } else {
                action.middleware = middleware;
            }
        }
        return action;
    }

    mergeAsGroup(action, as = null) {
        if (as && as.length > 0) {
            if (action.as != undefined) {
                action.as = as + '.' + action.as;
            } else {
                action.as = as;
            }
        }

        return action;
    }

    get(uri, action) {
        this.addRoute('get', uri, action);
        return this;
    }

    post(uri, action) {
        this.addRoute('post', uri, action);
        return this;
    }

    put(uri, action) {
        this.addRoute('put', uri, action);
        return this;
    }

    patch(uri, action) {
        this.addRoute('patch', uri, action);
        return this;
    }

    del(uri, action) {
        this.addRoute('del', uri, action);
        return this;
    }

    delete(uri, action) {
        this.addRoute('delete', uri, action);
        return this;
    }

    all(uri, action) {
        this.addRoute('all', uri, action);
        return this;
    }

    static url(path, params) {
        return BaseRouter.url(path, params);
    }

    redirect(source, destination, code) {
        return this.baseRouter.redirect.apply(this);
    }

    parseRoute(route) {
        let middleware = [];

        // if (route.action) {


        if (route.action.middleware) {

            for (let m of route.action.middleware) {
                if (typeof m == 'string') {
                    middleware.push(this.app.make(m))
                } else {
                    middleware.push(m);
                }
                // console.log('m = ', m)
            }
        }

        if (route.action.uses) {
            const callable = route.action.uses.split('@');
            const classPath = this.app.baseDir + '/' + callable[0];
            // console.log('classPath:', classPath);
            // console.log('path', this.app.path())
            const methodName = callable[1];

            const Controller = require(classPath);

            // Should controller be newed per request? I'll leave it here.
            // this.app.controllers.set(callable[0], new controller);
            this.app.register({ provide: callable[0], useClass: Controller });

            // console.log(this.app.controllers);

            middleware.push(async ctx => {
                // await (ctx.app as Application).make(className).setContext(ctx)[methodName];
                // console.log(methodName)
                // console.log(((ctx.app as Application).controllers.get(callable[0])!.setContext(ctx) as any)[methodName])
                // await ctx.app.controllers.get(callable[0]).setContext(ctx)[methodName]();
                await ctx.app.make(callable[0]).setContext(ctx)[methodName]();
            });

        } else if (route.action.fn) {
            middleware.push(route.action.fn)
        }

        if (route.action.as) {
            this.baseRouter[route.method](route.action.as, route.uri, ...middleware);
        } else {
            this.baseRouter[route.method](route.uri, ...middleware);
        }
    }

    allowedMethods() {
        return this.baseRouter.allowedMethods();
    }

    callback() {
        this.routes.forEach((route) => {
            this.parseRoute(route);
        })

        return this.baseRouter.routes();
    }

    url(name, params, options) {
        return this.baseRouter.url(name, params, options);
    }
}