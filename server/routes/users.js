const router = require('koa-router')();





  router.get('/', async (ctx, next) => {
    ctx.body = 'this a users response!';
  });

  router.get('/ttt', async (ctx, next) => {
    ctx.body = 'this a userssss response!';
  });

module.exports=router.routes();






