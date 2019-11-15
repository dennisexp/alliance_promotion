/**!
 * koa2-response - util.js
 * Copyright(c) 2018
 * MIT Licensed
 *
 * Authors:
 *   detectiveHLH <detectivehlh@qq.com>
 */

'use strict';

const defaultResponse = {
  data: [],
  status: {
    code: 1,
    message: 'SUCCESS'
  }
};

/**
 * response
 * @param ctx
 * @param data 数据
 * @param message 错误描述 || [错误描述, 错误码]
 * @param code 错误码 
 */
const response = (ctx, data, message, code) => {
  if (typeof message == 'object') {
    message = message[0];
    code = message[1];
  }
  ctx.body = {
    data,
    status: {
      code,
      message
    }
  }
}

/**
 * response 成功
 * @param ctx
 * @param data 数据
 * @param message 错误描述 || [错误描述, 错误码]
 * @param code 错误码 
 */
exports.success = (ctx, data, message = 'SUCCESS', code = 1) => {
  if (typeof message === 'object') {
    message = message[0];
    code = message[1];
  }
  response(ctx, data, message, code);
}

/**
 * response 异常
 * @param ctx
 * @param message 错误描述 || [错误描述, 错误码]
 * @param code 错误码 
 */
exports.error = (ctx, message = 'ERROR', code = 0) => {
  if (typeof message === 'object') {
    message = message[0];
    code = message[1];
  }
  response(ctx, defaultResponse.data, message, code);
}