module.exports = class Model {
    static get parameters() {
        return [new Inject('sequelize')];
    }

    get name() {
        return '';
    }

    get attributes() {
        return {};
    }

    get options() {
        return {};
    }

    constructor(sequelize) {
        this.sequelize = sequelize;
        Object.assign(
            this,
            this.sequelize.define(this.name, this.attributes, this.options)
        )
    }
}