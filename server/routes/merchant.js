const router = require('koa-router')();
const MongoDB = require('../config/db');

const userCtrl = require('../controller/user');
const merchantCtrl = require('../controller/merchant');


  router.get('/', async (ctx, next) => {
    //ctx.body = 'this a merchants response!';
    return;
    let ret = await merchantCtrl.collectCoupons();

    console.log("info---------", ret.data.length);
    let updateInfo = { "grade": 1 };
    updateInfo.statistics = ret.data;

    let update = await userCtrl.update("osGnz081kpGgyULuJQicl_SwpPr4", updateInfo);
    

    console.log("result", update);
    

    ctx.success(update.data)

  });

  /**
   * 获取所有商家的信息
   */
router.get('/all', async (ctx, next) => {

  let condition = [
    { $match: { "status": 1 } },
    { $sort: { cid: 1, display_order: 1 } }
  ]
    
  let ret = await MongoDB.aggregate("merchant", condition);
  
  //console.log("可用商家的数量", ret.length);

  if (ret.length == 0)
    ctx.error("无可用商家");
  else ctx.success(ret.data)
    
});

/**
 * 获取指定商家的信息
 */
router.get('/info', async (ctx, next) => {

  let mid = ctx.request.query.mid;

  if (!mid) {
    ctx.error("参数错误");
  }
    
  let ret = await MongoDB.findInTable("merchant", { mid: mid, status: 1 });
  
  console.log("可用商家的数量", ret.length);

  if (ret.length == 0)
    ctx.error("无可用商家");
  else ctx.success(ret.data[0])
    
});

module.exports=router.routes();






