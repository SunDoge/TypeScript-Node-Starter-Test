const { ReflectiveInjector } = require('injection-js');

class Container {

    constructor() {
        // Should be resolved providers.
        this.providers = [];
        this.hasUpdated = true;
    }

    get injector() {
        if (this.hasUpdated) {
            this.resolveAndCreate();
        }

        return this._injector;
    }

    set injector(val) {
        this._injector = val;
        this.hasUpdated = false;
    }

    register(provider) {
        if (provider instanceof Array) {
            this.providers = this.providers.concat(provider);
        } else {
            this.providers.push(provider);
        }
        this.hasUpdated = true;
    }

    get(token, notFoundValue) {
        return this.injector.get(token, notFoundValue);
    }

    resolveAndCreate() {
        this.injector = ReflectiveInjector.resolveAndCreate(this.providers);
    }

    make(provider) {
        return this.injector.resolveAndInstantiate(provider);
    }

}

module.exports = new Container();