const router = require('koa-router')();
const MongoDB = require('../config/db');

const userCtrl = require('../controller/user');
const merchantCtrl = require('../controller/merchant');


  router.get('/', async (ctx, next) => {
    //ctx.body = 'this a merchants response!';

    // let mid = 10;

    // let salesRes = await merchantCtrl.getSales(mid);

    // ctx.success(salesRes)

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
 * 获取指定管理员名下商户的销售记录
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

  let sales = await merchantCtrl.getSales(userinfo.mid);

  sales.status == 1 ? ctx.success(sales.data) : ctx.error(sales.message);

  // if (sales.status==0) {
  //   ctx.error(sales.message);
  // } else {
  //   ctx.success(sales.data);
  // }

});

/**
 * 更新销售指定的记录：核销、退回
 */
router.post('/sales', async (ctx, next) => {
  let usage_id = ctx.request.body.usage_id;
  let status = ctx.request.body.status;//修改的值
  let openid = ctx.request.body.openid;
  let sign = ctx.request.body.sign;

  if (!openid || !sign ||!usage_id ||!status) {
    ctx.error("参数错误");
    return;
  }

  let params = {
    openid: openid,
    usage_id: usage_id,
    status: status
  }

  let verification = await userCtrl.verify(openid, params, sign);

  if (verification.status == 0) {
    ctx.error(verification.message);
    return;
  }

  //验签正确后，更新
  let ret = await merchantCtrl.updateSales(usage_id, { status: status });
  if (ret.status==0) {
    ctx.error(ret.message);
    return;
  }

  //如果商户设置退回该券的话（状态-1）。则需要将顾客的券的状态改回来。
  let res = await userCtrl.validateCoupon(ret.data.openid, ret.data.mid, ret.data.cid);

  //获取操作后的销售记录
  let sales = await merchantCtrl.getSales(verification.data.mid);

  ret.status == 1 ? ctx.success(sales.data) : ctx.error(sales.message);

});


module.exports=router.routes();