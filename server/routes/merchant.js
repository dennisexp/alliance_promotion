const router = require('koa-router')();
const MongoDB = require('../config/db');

  router.get('/', async (ctx, next) => {
    ctx.body = 'this a merchants response!';
  });

router.get('/all', async (ctx, next) => {
    
  let ret = await MongoDB.findInTable("merchant", { status: 1 });
  
  console.log("可用商家的数量", ret.length);

  if (ret.length == 0)
    ctx.error("无可用商家");
  else ctx.success(ret.data)
    
});

module.exports=router.routes();






