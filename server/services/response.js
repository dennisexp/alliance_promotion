/**
 * @author songchengen   Achilles
 * @date 2018/7/17   2019/11/11
 * @description 中间件  将success的code改为1，error的code改为0
 */

const { success, error } = require('./response_util');

module.exports = async (ctx, next) => {
    ctx.success = success.bind(null, ctx);
    ctx.error = error.bind(null, ctx);
    await next();
}
