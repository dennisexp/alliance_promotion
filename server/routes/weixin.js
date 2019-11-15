const router = require('koa-router')();
const WeChatAPI = require('co-wechat-api');
const OAuth = require('co-wechat-oauth');
const tenpay = require('tenpay');
const fs = require('fs');

const Config = require('../config/config');
const MongoDB = require('../config/db');
const Util = require('../config/util');
const userCtrl = require('../controller/user');

//var client = new OAuth(Config.weixin.mp_app_id, Config.weixin.mp_app_secret);

//多进程，token需要全局维护，以下为保存token的接口。
// var client = new OAuth(Config.weixin.mp_app_id, Config.weixin.mp_app_secret, function (openid, callback) {
//   // 传入一个根据openid获取对应的全局token的方法
//   // 在getUser时会通过该方法来获取token
//   Token.getToken(openid, callback);
// }, function (openid, token, callback) {
//   // 持久化时请注意，每个openid都对应一个唯一的token!
//   Token.setToken(openid, token, callback);
//   });

const wx_api = new WeChatAPI(Config.weixin.mp_app_id, Config.weixin.mp_app_secret);
/**
 * 多线程接口配置

const wx_api = new WeChatAPI(Config.weixin.mp_app_id, Config.weixin.mp_app_secret, async () => {
  // 传入一个获取全局 token 的方法
  var txt = fs.readFileSync('public/weixin/access_token.txt', 'utf8');
  return JSON.parse(txt);
}, async (token) => {
  // 请将 token 存储到全局，跨进程、跨机器级别的全局，比如写到数据库、redis等
  // 这样才能在cluster模式及多机情况下使用，以下为写入到文件的示例
  fs.writeFileSync('public/weixin/access_token.txt', JSON.stringify(token));
});
 */

//微信公众号支付时的配置
const wx_mp_config = {
  appid: Config.weixin.mp_app_id,
  mchid: Config.weixin.partner_id,
  partnerKey: Config.weixin.partner_key,
  //pfx: require('fs').readFileSync('证书文件路径'),
  notify_url: Config.server_domain + '/weixin/mp_pay_notify',
  //spbill_create_ip: 'IP地址'
};
// 调试模式(传入第二个参数为true, 可在控制台输出数据)
const wx_mp_api = new tenpay(wx_mp_config, false);

router.get('/', async (ctx, next) => {
  ctx.state = {
    title: '一合优品微信API'
  };

  await ctx.render('index', { title: ctx.state });
});

/**
 * 生成引导用户点击的URL。
 */
router.get('/authorizeURL', async (ctx, next) => {

  let redirect_uri = ctx.request.query.redirect_uri;

  if (!redirect_uri) {
    ctx.error();
    return;
  }

  //产生获得code的url
  //let url = client.getAuthorizeURL(redirect_uri, 'STATE', 'snsapi_userinfo');

  let url = "http://localhost:8100/home?code=021sIgA41MC5pT1p1Nz415SvA41sIgAg";
  ctx.success(url);

  console.log("url", url);
});

/**
 * 获得用户的微信信息。
 */
router.get('/userinfo', async (ctx, next) => {

  let code = ctx.request.query.code;
  console.log("code: ",code);
  if (!code) {
    ctx.error(); 
    return;
  }

  //let user = await client.getUserByCode(code);
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

  let options = { upsert: true, new: true, setDefaultsOnInsert: true };
  await MongoDB.findOneAndModify("user",{"openid":user.openid},user,options).then(res => { 
    // console.log("订单状态修改后");
    console.log(res);
    if (res.status == 1) {
      let userinfo = res.data;
      userinfo.password = "";
      ctx.success(userinfo);
    } else {
      ctx.error("无法获取微信用户信息"); 
    }
    
  });
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
    let ret = await userCtrl.update(openid, { name: name, mobilephone: mobilephone });
    if (ret.status == 1) {
      console.log("update",ret.message);
    } else {
      console.log("update error",ret.message);
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
      "parent_id": userinfo.parent_id, //上级ID
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

/**
 * 获取微信JS的配置
 */
router.get('/js_config', async (ctx, next) => {
  let param = {
    debug: true,
    jsApiList: ['updateAppMessageShareData', 'updateTimelineShareData'],
    url: 'http://app.yihemall.cn'
  };
  let config = await wx_api.getJsConfig(param);
  console.log("JS Config", config);

  ctx.success(config);
  
});


module.exports=router.routes();