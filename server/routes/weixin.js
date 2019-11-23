const router = require('koa-router')();
const WeChatAPI = require('co-wechat-api');
const OAuth = require('co-wechat-oauth');
const tenpay = require('tenpay');
const fs = require('fs');

const Config = require('../config/config');
const MongoDB = require('../config/db');
const Util = require('../config/util');
const userCtrl = require('../controller/user');
const merchantCtrl = require('../controller/merchant');

var client = new OAuth(Config.weixin.mp_app_id, Config.weixin.mp_app_secret);

//多进程，token需要全局维护，以下为保存token的接口。
// var client = new OAuth(Config.weixin.mp_app_id, Config.weixin.mp_app_secret, async (openid) => {
//   // 传入一个根据openid获取对应的全局token的方法
//   var txt = await fs.readFile('public/weixin/' + openid + ':access_token.txt', 'utf8');
//   return JSON.parse(txt);
// }, async (openid, token) => {
//   // 请将token存储到全局，跨进程、跨机器级别的全局，比如写到数据库、redis等
//   // 这样才能在cluster模式及多机情况下使用，以下为写入到文件的示例
//   // 持久化时请注意，每个openid都对应一个唯一的token!
//   await fs.writeFile('public/weixin/' + openid + ':access_token.txt', JSON.stringify(token));
// });

//const wx_api = new WeChatAPI(Config.weixin.mp_app_id, Config.weixin.mp_app_secret);
/**
 * 多线程接口配置
 */
const wx_api = new WeChatAPI(Config.weixin.mp_app_id, Config.weixin.mp_app_secret, async () => {
  // 传入一个获取全局 token 的方法
  var txt = fs.readFileSync('public/weixin/access_token.txt', 'utf8');
  return JSON.parse(txt);
}, async (token) => {
  // 请将 token 存储到全局，跨进程、跨机器级别的全局，比如写到数据库、redis等
  // 这样才能在cluster模式及多机情况下使用，以下为写入到文件的示例
  fs.writeFileSync('public/weixin/access_token.txt', JSON.stringify(token));
});


//微信公众号支付时的配置
const wx_mp_config = {
  appid: Config.weixin.mp_app_id,
  mchid: Config.weixin.partner_id,
  partnerKey: Config.weixin.partner_key,
  //pfx: require('fs').readFileSync('证书文件路径'),
  notify_url: Config.domain.server_domain + '/weixin/mp_pay_notify'
  //spbill_create_ip: 'IP地址'
};
// 调试模式(传入第二个参数为true, 可在控制台输出数据)
const wx_mp_api = new tenpay(wx_mp_config, true);

router.get('/', async (ctx, next) => {
  ctx.state = {
    title: '一合优品微信API'
  };

  ctx.success("一合优品微信API");

  //await ctx.render('index', { title: ctx.state });
});

/**
 * 生成引导用户点击的URL。
 */
router.get('/authorizeURL', async (ctx, next) => {

  let redirect_uri = ctx.request.query.redirect_uri;
  let invitation_code = ctx.request.query.invitation_code;

  //console.log(ctx.request.query);
  
  if (!redirect_uri) {
    ctx.error();
    return;
  }

  //产生获得code的url
  let url = client.getAuthorizeURL(decodeURIComponent(redirect_uri), JSON.stringify({ invitation_code: invitation_code }), 'snsapi_userinfo');

  //let url = "http://localhost:8100/home?code=021sIgA41MC5pT1p1Nz415SvA41sIgAg";
  ctx.success(encodeURIComponent(url));

  let pv = await Util.getNextSequenceValue("page_view");

  console.log("-------累计访问量：", pv, "-------");
});

/**
 * 获得用户的微信信息。
 */
router.get('/userinfo', async (ctx, next) => {

  let code = ctx.request.query.code;
  let parent_code = ctx.request.query.parent_code;

  //console.log(ctx.request.query);
  //console.log("code: ",code);
  if (!code) {
    ctx.error(); 
    return;
  }

  try {
    var user = await client.getUserByCode(code);
    console.log("获取微信用户反馈信息:\n", user);
  } catch (e) {
    ctx.error("无法获取微信用户信息");
    console.log("无法获取微信用户信息:\n", e);
    return;
  }
  //let user = await client.getUserByCode(code);
  /**
  let user = {
    openid: 'osGnz081kpGgyULuJQicl_SwpPr4',
    nickname: '王者杨杰',
    sex: 1,
    language: 'zh_CN',
    city: '',
    province: '',
    country: 'Palau',
    headimgurl: 'http://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTIcu3Rib4t1wYDcPDj1lhOTXaaMnbmg02NEGSLkfhEAqDytzPsmm1kc0FfuwuGOicDxrt82hphyOZJQ/132',
    privilege: [] 
  };
   */

  let exist = await MongoDB.findInTable("user", { "openid": user.openid });
  //console.log("用户是否存在", exist);

  let params = {
    openid: user.openid,
    nickname: user.nickname,
    sex: user.sex,
    headimgurl: user.headimgurl,
    address: {
      city: user.city, //普通用户个人资料填写的城市
      province: user.province, //用户个人资料填写的省份
      country: user.country //国家，如中国为CN
    },
    last_login_time: new Date()
  }
  //不存在，则插入（须加上salt和邀请码）
  if (exist.length == 0) {
    //生成邀请码，需要和数据库确认下，是否重复
    let invitation_code = Util.uuid(8,32);
    let same = true;
    while (same) {
      let ret = await MongoDB.findInTable("user", { invitation_code: invitation_code });
      //console.log("invitation_code", ret);
      if (ret.length == 0) {
        same = false;//没有重复的，可用
        console.log("invitation_code OK", invitation_code);
      } else {
        //有重复的，再来一个
        console.log("invitation_code 有重复，再生一个", invitation_code);
        invitation_code = Util.uuid(8,32);
      }
    }

    params.invitation_code = invitation_code;

    //生成salt
    params.salt = Util.generateSalt();

    //生成海报（带二维码的）
    let source_poster = Config.static_path + Config.poster_path + Config.source_poster;
    
    let url = Config.domain.client_domain + "/home?invitation_code=" + invitation_code;
    //console.log("----url----", url);
    
    let code_img = await Util.createQr(url, "qr_" + invitation_code);
    let output = Config.static_path + Config.poster_path + invitation_code + ".jpg";

    let poster = await Util.addWaterMark(source_poster, code_img.data, output);
    if (poster.status==0) {
      console.log("--生成带海报的二维码错误--");
    } 

    //检查验证码是否存在，不存在时设置为0    
    if (!parent_code) {
      parent_code = Config.default_invitation_code;
    } else {
      let ret = await MongoDB.findInTable("user", { invitation_code: parent_code });
      if (ret.length == 0) {
        console.log("上级的邀请码不正确", parent_code);
        parent_code = Config.default_invitation_code;
      } else {
        //正确的
      }
    }

    params.parent_code = parent_code + "";
    console.log("即将插入新用户的信息", params);
  }

  //console.log("待升级的用户信息", params);
  let options = { upsert: true, new: true, setDefaultsOnInsert: true };
  //存在的话，更新信息。
  await MongoDB.findOneAndModify("user", { "openid": user.openid }, params, options).then(res => {
    // console.log("订单状态修改后");
    //console.log(res);
    if (res.status == 1 && res.data) {
      let userinfo = res.data;
      userinfo.password = "";
      ctx.success(userinfo);
      //console.log("成功获得且返回用户信息", userinfo);
    } else {
      ctx.error("无法获取微信用户信息");
      console.log("----无法获得用户信息----");
    }
  })
  
});

/**
 * 微信公众号支付
 */
router.post('/mp_pay', async (ctx, next) => {
  let openid = ctx.request.body.openid;
  let name = ctx.request.body.name;
  let mobilephone = ctx.request.body.mobilephone;  
  let sign = ctx.request.body.sign;

  if (!openid || !name || !mobilephone || !sign) {
    ctx.error("参数不完整");
    return;
  }

  let amount = Config.price;

  //验证签名
  let params = {
    openid: openid,
    name: name,
    mobilephone: mobilephone,
  }

  let verification = await userCtrl.verify(openid, params, sign);

  //console.log("verification", verification);
  //  签名正确，拼装微信支付订单
  if (verification.status == 1) {
    //将姓名和手机号添加到数据库中
    let userinfo = verification.data;
    if (userinfo.grade >= 1) {
      //已经是付费用户了，无需再购买，每人限购一次
      //console.log("update",ret.message);
      ctx.error("免单大礼包已激活，无需再次购买");
      return;
    }
    let ret = await userCtrl.update(openid, { name: name, mobilephone: mobilephone });
    if (ret.status == 1) {
      console.log("update",ret.message);
    } else {
      console.log("update error", ret.message);
      //ctx.error("无法产生微信预付订单，请刷新页面后重试或联系客服");
      //return;
    }

    let outTradeNo = Util.getTradeNo("wx");

  //获得订单信息
    let payInfo = await wx_mp_api.getPayParams({
      out_trade_no: outTradeNo,
      body: '免单大礼包',
      total_fee: +amount * 100,
      openid: openid
    });

    if(!payInfo){
      ctx.error("无法产生微信预付订单，请刷新页面后重试或联系客服");
      return;
    }

    //将支付记录插入预支付订单表格中
  //将充值记录插入数据
    let oid = await Util.getNextSequenceValue("order");
    
    let order = {
      "oid": oid,
      "openid": openid, //付款用户编号
      "nickname": userinfo.nickname, //微信名称
      "parent_code": userinfo.parent_code, //上级ID
      "subject": "购买免单大礼包",
      "trade_no": outTradeNo, //微信等交易流水编号。
      "payment_no":"",//微信返回来的付款账单号
      "amount": { //充值金额
        "payment": +amount,
        "bonus": 0
      },
      "status": "WAIT_BUYER_PAY",//WAIT_BUYER_PAY(创建),TRADE_SUCCESS（支付成功）,TRADE_CLOSED（关闭）,TRADE_FINISHED（结束）
      "order_time": new Date()
    };

  //插入充值记录
    await MongoDB.insert("order", order, true).then(res => {
      console.log('微信公众号支付预支付订单插入结果', res);
      if (res.status == 1) {
        ctx.success(payInfo);
      } else {
        ctx.error("微信预支付订单创建错误，请重试或联系客服")
      }
    });

  } else {
    ctx.error(verification.message);
  }

});

//微信app支付时返回的值
router.post('/mp_pay_notify', wx_mp_api.middleware("pay"), async (ctx, next) => {

  ctx.reply("FAIL");//设置一个默认值
  
  try {
    if (!ctx.request.weixin) {
        console.log("-- 微信支付通知无内容 --");
        return; //没有值的情况下，不操作
    }
    
    console.log("-- 通知内容 --");
    console.log(ctx.request.weixin);

    let return_code = ctx.request.weixin.return_code;
    let result_code = ctx.request.weixin.result_code;
    let out_trade_no = ctx.request.weixin.out_trade_no;
    let total_amount = ((+ctx.request.weixin.total_fee) / 100).toFixed(2);
    let transaction_id = ctx.request.weixin.transaction_id;

    //先检测下该订单是否支付成功，
    //是否是本商户创建的，成功的话，再延签，然后再更新状态
    if (!return_code==='SUCCESS' || !result_code==='SUCCESS') {
      console.log("==支付未成功，不需要操作==");
      return; //交易不成功的话，返回
    }

    let order = await MongoDB.findInTable('order', {"trade_no": out_trade_no, "status": "WAIT_BUYER_PAY" });
    console.log(order);

    if (order.length == 0) { //不匹配单号和金额，则返回
      //找不到相应订单
      console.log("找不到相应的支付订单", out_trade_no);
      return;
    }

    //获得充值客户的id和订单id
    let oid = order.data[0].oid;
    let openid = order.data[0].openid;
    let parent_code = order.data[0].parent_code;

    let parent = await userCtrl.getInfoByInvitationCode(parent_code);
    
    console.log("用户id:", openid);
    console.log("parent:", parent);

    //更改订单信息，并修改充值人员的账户信息

    //更新order状态
    let orderRet = await MongoDB.findOneAndModify("order", { "oid": oid }, {
      "status": return_code,
      "payment_no": transaction_id,
      "payment_time": new Date(),
      "amount.bonus": parent.status == 1 ? parent.data.grade.bonus : 0
    });
    
    if (orderRet.status != 1 || !orderRet.data) {
      //更新失败
      console.log('订单账户变动记录更新结果：', return_code);
      //.log(res.status);
      return;
    }
    
    //状态TRADE_SUCCESS的通知触发条件是商户签约的产品支持退款功能的前提下，买家付款成功
    //交易状态TRADE_FINISHED的通知触发条件是商户签约的产品不支持退款功能的前提下，买家付款成功；或者，商户签约的产品支持退款功能的前提下，交易已经成功并且已经超过可退款期限。
    //修改付款用户的信息。

    let updateInfo = { "grade": 1 };

    let coupons = await merchantCtrl.collectCoupons();
    if (coupons.status==0) {//无可用的福利券，错误产生
      console.log("用户", openid, "激活大礼包失败。");
    } else {
      console.log("用户", openid, "成功激活",coupons.data.length+"家商户的大礼包。");
      updateInfo.statistics = coupons.data;
    }

    //更新用户信息
    let userRet = await userCtrl.update(openid, updateInfo);
    
    if (userRet.status == 0) {
      console.log('订单处理结束：失败');
      console.log(userRet.message);
      return;
    }

    console.log(userRet.data.nickname, "订单状态处理");

    if (parent.status == 1) {
      let p_openid = parent.data.openid;
      let bonus = parent.data.grade.bonus;
      let parentRet = await userCtrl.update(p_openid, { $inc: { "balance.bonus": +bonus } });
      console.log("奖金状态处理",parentRet);
    }
    
    ctx.reply("");//成功
  } catch (e) {
    console.log('订单处理结束：失败');
    console.log(e);
    return;
  }
})

/**
 * 获取微信JS的配置
 */
router.get('/js_config', async (ctx, next) => {
  let url = ctx.request.query.url;

  let param = {
    debug: false,
    jsApiList: ['updateAppMessageShareData', 'updateTimelineShareData','onMenuShareTimeline','onMenuShareAppMessage'],
    url: decodeURIComponent(url)
  };
  let config = await wx_api.getJsConfig(param);

  //.log("JS Config", config);
  if (config) 
    ctx.success(config);
  else 
    ctx.error("无法获取微信公众号配置");
  
});


module.exports=router.routes();