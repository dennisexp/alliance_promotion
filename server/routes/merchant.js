const router = require('koa-router')();
const Util = require("../config/util")

  router.get('/', async (ctx, next) => {
    ctx.body = 'this a merchants response!';
  });

  router.get('/ttt', async (ctx, next) => {
    //ctx.body = 'this a userssss response!';
    let code = Util.uuid(6,33);
    ctx.body = code;
    console.log("code: ", code);

    let data = '123456789ABCDEFGHJKLMNPQRSTUVWXY'.split('');

    //console.log("data: ", Util.shuffle(data));
    
  });

module.exports=router.routes();






