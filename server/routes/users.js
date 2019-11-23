const router = require('koa-router')();

const Util = require("../config/util");
const Config = require("../config/config");
const MongoDB = require('../config/db');
const userCtrl = require('../controller/user');
const merchantCtrl = require('../controller/merchant');

router.get('/', async (ctx, next) => {
  //ctx.body = 'this a users response! ' + Util.uuid(6, 32);


  return;
  let codes = ["AJLXKD72", "E7U16DFD", "8T3VXTSJ", "DD79ES5J", "96315GQR", "QC3VB7HT", "CHHUESWY", "A35637G5", "EFM32B55", "FDCFUC22", "1KDJ9LM9", "39KXYHNL", "GLLWX59U", "7HQX7BUE", "SHMMY76J", "93NENCBT", "3XW1R8SV", "PX48NHJV", "M5ARA9M7", "NJU6SEKW", "V8VN71M1", "3MRQVXPQ", "PCVMTXFA", "M54WBM4P", "PHHW2VXY", "PUSV6W57", "84AQRXMD", "26QC6QLK", "MGS7GL4A", "AFWVP8XY", "EMVN3GDX", "JVRVLYF6", "WUEQ1RCB", "S84Y4H1F", "LXA31C69", "W9TYTR33", "5D7TTAKC", "JXR5XGVP", "FQAJYY5F"];


  //return;
  //生成海报（带二维码的）
  let invitation_code = "AJLXKD72"; 
    let source_poster = Config.static_path + Config.poster_path + Config.source_poster;
  console.log("source_poster", source_poster);
  
  codes.forEach( async element => {
    

      let url = Config.domain.client_domain + "/home?invitation_code=" + element;
      console.log("----url----", url);

      let code_img = await Util.createQr(url, "qr_" + element);
      console.log("code_img", code_img);

      let output = Config.static_path + Config.poster_path + element + ".jpg";
      console.log("output", output);

      let poster = await Util.addWaterMark(source_poster, code_img.data, output);
      console.log("poster", poster);

      if (poster.status == 0) {
        console.log("--生成带海报的二维码错误--");
      }
      

  });

    
    
  

  //ctx.body = ret2;
  ctx.success("finish");

  

  //生成邀请码，需要和数据库确认下，是否重复
  return;
  // let invitation_code = "5203344";//Util.uuid(8,32);
  // let same = true;
  // while (same) {
  //   let ret = await MongoDB.findInTable("user", { invitation_code: invitation_code });
  //   console.log("activeCode", ret);
  //   if (ret.length == 0) {
  //     same = false;//没有重复的，可用
  //     console.log("activeCode OK", invitation_code);
  //   } else {
  //     //有重复的，再来一个
      
  //     invitation_code = Util.uuid(8, 32);
  //     console.log("有重复，再来一个", invitation_code);
  //   }
  // }

  ctx.success(invitation_code)
  
  
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
      if (res.status == 1 && res.data) {
        let userinfo = res.data;
        //userinfo.salt = "";
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
      if (res.status == 1 && res.data) {
        let userinfo = res.data;
        //userinfo.salt = "";
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

  if (amount < Config.withdraw_threshold) {
    ctx.error("提现金额不得低于"+Config.withdraw_threshold+"元");
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
      return;
    }

    if (!userinfo.account.account_name || !userinfo.account.account_number) {
      ctx.error("提现账户信息不完整，请先填写完整再提现");
      return;
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
          ctx.error("提现操作失败，请返回重试或联系客服");
        }
      });
      
    } else {
      ctx.error("提现操作失败，请返回重试或联系客服");
    }

  } else {
    ctx.error(verification.message);
  }

});

/**
 * 用激活码激活
 */
router.post('/activation', async (ctx, next) => {
  let openid = ctx.request.body.openid;
  let name = ctx.request.body.name;
  let mobilephone = ctx.request.body.mobilephone;
  let code = ctx.request.body.code;
  let sign = ctx.request.body.sign;
  
  if (!openid || !name || !mobilephone || !code ||!sign) {
    ctx.error("参数不完整");
    return;
  }

  let params = {
    mobilephone: mobilephone,
    openid: openid,
    name: name,
    code: code,
  }

  let verification = await userCtrl.verify(openid, params, sign);

  //console.log("verification", verification);

  //  签名正确，修改账户
  if (verification.status == 1) {
    let userinfo = verification.data;

    //先更新用户信息
    let res = await userCtrl.update(openid, { name: name, mobilephone: mobilephone });
    if (res.status == 1) {
      userinfo = res.data;
    } else {
      console.log("无法获取用户激信息。", res.message);
      ctx.error("无法获取用户激信息，请重试或联系客服");
      return;
    }

    if (userinfo.grade >= 1) {
      ctx.success(userinfo, "该用户已激活，无需再次激活");
      return;
    }

    //再去核对验证码，先把空格去了，然后再全部变成大写字母
    code = code.replace(/\s*/g, "").toUpperCase();

    //签名验证通过，操作提现: user表和withdraw表
    let result = await MongoDB.findOneAndModify("activation", { "code": code, "status":0 }, {
      $set: {
        "name": name,
        "openid": openid,
        "status": 1,
        "mobilephone": mobilephone,
        "activate_time": new Date()
      }
    });

    console.log("激活结果", result);

    //user表操作成功，接着将提用户状态改为付费用户
    if (result.status == 1 && result.data != null) {
      let updateInfo = { "grade": 1, "name": name, "mobilephone": mobilephone };

      let coupons = await merchantCtrl.collectCoupons();
      if (coupons.status==0) {//无可用的福利券，错误产生
        console.log("用户", openid, "激活大礼包失败。");
      } else {
        console.log("用户", openid, "成功激活",coupons.data.length+"家商户的大礼包。");
        updateInfo.statistics = coupons.data;
      }

    //更新用户信息
      let ret = await userCtrl.update(openid, updateInfo);
      if (ret.status == 1) {
        console.log("用户激活成功。", ret.message);
        ctx.success(ret.data, "激活成功");
      } else {
        console.log("用户激活失败。", ret.message);
        ctx.error("用户激活失败，请联系客服");
      }

    } else {
      //验证不通过
      ctx.error("激活码不正确，请重试或联系客服购买激活码");;
    }

  } else {
    ctx.error(verification.message);
  }

});

/**
 * 获得用户福利券信息
 */
router.get('/coupons', async (ctx, next) => {
  
  let openid = ctx.request.query.openid;
  let sign = ctx.request.query.sign;
  if (!openid || !sign) {
    ctx.error("参数不完整");
    return;
  }

  let verification = await userCtrl.verify(openid, { openid: openid }, sign);

  if (verification.status == 1) {
    //将优惠券分为已经使用的，和未使用的，查出来
    let couponList = verification.data.statistics;
    let ret = userCtrl.sepatateCoupons(couponList);
    ret.openid = openid;

    ctx.success(ret);
  } else {
    ctx.error(verification.message);
  }

});

router.post('/usage', async (ctx, next) => {
  let openid = ctx.request.body.openid;
  let amount = ctx.request.body.amount;
  let mid = ctx.request.body.mid;
  let coupon_id = ctx.request.body.coupon_id;
  let coupon_label = ctx.request.body.coupon_label;
  let sign = ctx.request.body.sign;
  
  if (!openid || !amount ||!sign || !mid || !coupon_id) {
    ctx.error("参数不完整");
    return;
  }

  let params = {
    openid: openid,
    amount: amount,
    mid: mid,
    coupon_id: coupon_id,
    coupon_label: coupon_label
  }

  let verification = await userCtrl.verify(openid, params, sign);

  //console.log("verification", verification);

  //  签名正确，插入usage表，已经将改福利券改为已经使用：0
  if (verification.status == 1) {


    //签名验证通过，操作提现: user表和coupon_usage表
    //let result = await MongoDB.findOneAndModify("user", { "openid": openid, "statistics.mid": mid, "statistics.coupons.cid": coupon_id, "statistics.coupons.type":1 }, { "statistics.coupons.status": 0 });

    //user表操作成功，接着将提交申请插入
    //if (result.status == 1) {
      let uid = await Util.getNextSequenceValue("coupon_usage");

      let coupon_usage = {
        usage_id: uid,
        openid: openid,
        mid: mid,
        cid: coupon_id,
        coupon: coupon_label,
        payment: amount,
        status: 0,
      }

      await MongoDB.insert("coupon_usage", coupon_usage).then(res => {
        if (res.status == 1) {

          //将优惠券分为已经使用的，和未使用的，查出来
          let couponList=[];
          // if (result.data) {
          //   couponList = result.data.statistics;
          // } else {
            couponList = verification.data.statistics;
          //}
          
          let ret = userCtrl.sepatateCoupons(couponList);
          ret.openid = openid;

          ctx.success(ret);
          
        } else {
          ctx.error("福利券使用失败，请返回重试或联系客服");
        }
      });
      
    // } else {
    //   ctx.error("提现操作失败，请返回重试或联系客服");
    // }

    //1、将该福利券插入coupon_usage
  } else {
    
    ctx.error(verification.message);
  }
});


module.exports=router.routes();