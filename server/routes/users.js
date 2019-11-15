const router = require('koa-router')();
const Util = require("../config/util");
const Conifg = require("../config/config");
const MongoDB = require('../config/db');
const userCtrl = require('../controller/user');

router.get('/', async (ctx, next) => {
  ctx.body = 'this a users response! '+Util.getYiheCode()+"  "+Util.getTradeNo("wx");
});


/**
 * 获得用户账户信息
 */
router.get('/info', async (ctx, next) => {
  
  let openid = ctx.request.query.openid;
  let sign = ctx.request.query.sign;
  if (!openid || !sign) {
    ctx.error("参数不完整");
    return;
  }

  let verification = await userCtrl.verify(openid, { openid: openid }, sign);

  if (verification.status == 1) {
    ctx.success(verification.data);
  } else {
    ctx.error(verification.message);
  }

});

/**
 * 修改用户账户信息,只能修改一个字段的
 */
router.post('/info', async (ctx, next) => {

  let info = ctx.request.body.info;//修改的值
  let sign = ctx.request.body.sign;
  let openid = ctx.request.body.openid;

  if (!openid || !sign || !info) {
    ctx.error("参数不完整");
    return;
  }

  let params = {
    openid: openid,
    info: info,
  }

  let verification = await userCtrl.verify(openid, params, sign);

  //console.log("verification", verification);
  //  签名正确，修改账户
  if (verification.status == 1) {

    let newData = JSON.parse(info);
    await MongoDB.findOneAndModify("user", { "openid": openid }, newData).then(async res => {
      if (res.status == 1) {
        let userinfo = res.data;
        userinfo.salt = "";
        userinfo.password = "";
        ctx.success(userinfo);
      } else {
        ctx.error("用户信息修改失败");
      }
    });

  } else {
    ctx.error(verification.message);
  }

});


/**
 * 修改提现的支付宝账户信息
 */
router.post('/alipay_info', async (ctx, next) => {
  let openid = ctx.request.body.openid;
  let account_name = ctx.request.body.account_name;
  let account_number = ctx.request.body.account_number;
  let sign = ctx.request.body.sign;

  if (!openid || !account_name || !account_number || !sign) {
    ctx.error("参数不完整");
    return;
  }

  let params = {
    openid: openid,
    account_name: account_name,
    account_number: account_number
  }

  let verification = await userCtrl.verify(openid, params, sign);

  //console.log("verification", verification);
  //  签名正确，修改账户
  if (verification.status == 1) {
    await MongoDB.findOneAndModify("user", { "openid": openid }, {
        "account.account_name": account_name,
        "account.account_number": account_number
    }).then(async res => {
      if (res.status == 1) {
        let userinfo = res.data;
        userinfo.salt = "";
        userinfo.password = "";
        ctx.success(userinfo);
      } else {
        ctx.error("提现账户信息修改失败");
      }
    });

  } else {
    ctx.error(verification.message);
  }

});

/**
 * 申请提现
 */
router.post('/withdraw', async (ctx, next) => {

  let openid = ctx.request.body.openid;
  let amount = ctx.request.body.amount;
  let sign = ctx.request.body.sign;

  if (!openid || !amount || !sign) {
    ctx.error("参数不完整");
    return;
  }

  if (amount < Conifg.withdraw_threshold) {
    ctx.error("提现金额不得低于"+Conifg.withdraw_threshold+"元");
    return;
  }

  let params = {
    openid: openid,
    amount: amount,
  }

  let verification = await userCtrl.verify(openid, params, sign);

  //console.log("verification", verification);

  //  签名正确，修改账户
  if (verification.status == 1) {
    let userinfo = verification.data;
    if (amount > userinfo.balance.bonus) {
      ctx.error("不得超过可提现的金额");
    }

    if (!userinfo.account.account_name || !userinfo.account.account_number) {
      ctx.error("提现账户信息不完整，请先填写完整再提现");
    }

    //签名验证通过，操作提现: user表和withdraw表
    let result = await MongoDB.findOneAndModify("user", { "openid": openid }, {
      $inc: {
        "balance.bonus": -amount,
        "balance.withdrawing": +amount
      }
    });

    userinfo = result.data;

    //user表操作成功，接着将提交申请插入
    if (result.status == 1) {
      let wid = await Util.getNextSequenceValue("withdraw");

      let withdraw = {
        wid: wid,
        openid: openid,
        amount: amount,
        fee: 0,
        subject: "提现",
        status: 0,
        account: userinfo.account,
      }

      await MongoDB.insert("withdraw", withdraw).then(res => {
        if (res.status == 1) {
          ctx.success(userinfo);
        } else {
          ctx.error("提现操作失败，请返回重试或联系管理员");
        }
      });
      
    } else {
      ctx.error("提现操作失败，请返回重试或联系管理员");
    }

  } else {
    ctx.error(verification.message);
  }


});

module.exports=router.routes();






