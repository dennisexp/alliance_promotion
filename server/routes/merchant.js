const router = require('koa-router')();
const MongoDB = require('../config/db');

const userCtrl = require('../controller/user');
const merchantCtrl = require('../controller/merchant');


  router.get('/', async (ctx, next) => {
    //ctx.body = 'this a merchants response!';

    let mid = 10;

    let salesRes = await merchantCtrl.getSales(mid);

    ctx.success(salesRes)

    return;


    /** 以下代码，手动给用户匹配商家
    let ret = await merchantCtrl.collectCoupons();
    console.log("info---------", ret.data.length);
    let updateInfo = { "grade": 1 };
    updateInfo.statistics = ret.data;

    let update = await userCtrl.update("osGnz0zfLtbbIci51XIG_Eo6HPr4", updateInfo);
    console.log("result", update);
    
    ctx.success(update.data)
     */

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
    return;
  }
    
  let ret = await MongoDB.findInTable("merchant", { mid: mid, status: 1 });
  
  console.log("可用商家的数量", ret.length);

  if (ret.length == 0)
    ctx.error("无可用商家");
  else ctx.success(ret.data[0])
    
});

/**
 * 获取指定管理员名下商户的销售
 */
router.get('/sales', async (ctx, next) => {
  let openid = ctx.request.query.openid;
  let sign = ctx.request.query.sign;

  if (!openid || !sign) {
    ctx.error("参数错误");
    return;
  }

  let verification = await userCtrl.verify(openid, { openid: openid }, sign);


  if (verification.status == 0) {
    ctx.error(verification.message);
    return;
  }

  let userinfo = verification.data;

  if (!userinfo || userinfo.type!=2 || !userinfo.mid) {
    ctx.error("参数错误，不是商户管理员用户，无权访问商户信息");
    return;
  }

  userinfo = {mid:10};

  let sales = await merchantCtrl.getSales(userinfo.mid);

  //分成两个序列，已经成交，未成交的
  let orderFinishedList = [];
  let orderPendingList = [];

  if (sales.status==0) {
    ctx.error(sales.message);
    return;
  }

  sales.data.forEach(order => {
    order.status == 0 ? orderPendingList.push(order) : orderFinishedList.push(order);
  });
  console.log("orderPendingList");
  console.log(orderPendingList);
  console.log("orderFinishedList");
  console.log(orderFinishedList);

  let ret = {
    orderPendingList: orderPendingList,
    orderFinishedList: orderFinishedList
  }

  ctx.success(ret);
});



module.exports=router.routes();






