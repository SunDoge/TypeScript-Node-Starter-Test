/**
 * Module dependencies.
 */
const format = require('util').format;


/**
 * Expose `flash()` function on requests.
 *
 * @return {Function}
 * @api public
 */

module.exports = function () {
    return async (ctx, next) => {
        await flash()(ctx, async function () {
            const render = ctx.render;

            ctx.render = async function () {
                ctx.state.messages = ctx.flash();
                await render.apply(ctx, arguments);
            }

            await next();
        })
    }
}

function flash(options) {
    options = options || {};
    let safe = (options.unsafe === undefined) ? true : !options.unsafe;

    return async (ctx, next) => {
        if (ctx.request.flash && safe) { return await next(); }
        ctx.flash = ctx.request.flash = _flash;
        await next();
    }
}

/**
 * Queue flash `msg` of the given `type`.
 * @param {String} type
 * @param {String} msg
 * @return {Array|Object|Number}
 * @api public
 */
function _flash(type, msg) {

    if (this.session === undefined) throw Error('this.flash() requires sessions');

    let msgs = this.session.flash = this.session.flash || {};

    if (type && msg) {
        if (arguments.length > 2 && format) {
            let args = Array.prototype.slice.call(arguments, 1);
            msg = format.apply(undefined, args);

        } else if (Array.isArray(msg)) {
            msg.forEach(function (val) {
                (msgs[type] = msgs[type] || []).push(val);
            });
            return msgs[type].length;

        }
        return (msgs[type] = msgs[type] || []).push(msg);

    } else if (type) {
        var arr = msgs[type];
        delete msgs[type];
        return arr || [];

    } else {
        this.session.flash = {};
        return msgs;
    }
}
