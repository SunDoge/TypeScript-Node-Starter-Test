const { ReflectiveInjector } = require('injection-js');

class Container {

    constructor() {
        // Should be resolved providers.
        this.providers = [];
        this.hasResolvedAndCreated = false;
    }

    register(providers) {
        if (providers instanceof Array) {
            this.providers = this.providers.concat(ReflectiveInjector.resolve(providers));
        } else {
            this.providers.push(providers)
        }

    }

    get(token, notFoundValue) {
        if (!this.hasResolvedAndCreated) {
            this.resolveAndCreate();
        }
        return this.injector.get(token, notFoundValue);
    }

    resolveAndCreate() {
        this.injector = ReflectiveInjector.fromResolvedProviders(this.providers);
        this.hasResolvedAndCreated = true;
    }

    make(provider) {
        return this.injector.resolveAndInstantiate(provider);
    }

}

module.exports = new Container();