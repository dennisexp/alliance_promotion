/**
 * 整合所有子路由
 */
const router = require('koa-router')();
const Config = require('../config/config');
const Util = require('../config/util');

var MongoDB = require('../config/db');

router.get('/welcome', async (ctx, next) => {
  ctx.state = {
    title: '一合优品联盟商家'
  };

  //await ctx.render('index', { title: ctx.state });
});


router.get('/initDB', async (ctx, next) => {

  let counter = [
    { key: "merchant", sequence_value: 1 },
    { key: "order", sequence_value: 1 },
    { key: "coupon_usage", sequence_value: 1 },
    { key: "feedback", sequence_value: 1 },
    { key: "withdraw", sequence_value: 1 },
    { key: "application", sequence_value: 1 },
    { key: "activation", sequence_value: 1 }
  ];

  // await mongoDB.insertMany("counter",counter).then(result => {
  //   console.log("result", result);
  // });
  
  // await MongoDB.findInTable('counter').then((res) => {
  //   ctx.success(res);
  //   console.log(res);
  // });

  //生成6位数验证码

});

/**
 * 插入激活码
 */
router.get('/v_code', async (ctx, next) => {

  let counter = 1
  const num = 5000; //生成一千个
  return;

  while (counter <= num) {
    let code = Util.uuid(6, 32);
    //let aid = await Util.getNextSequenceValue("activation");
    let exist = await MongoDB.findInTable("activation", { "code": code });

    //不重复，添加到数据库
    if (exist.length == 0) {
      let ret = await MongoDB.insert("activation", { aid: counter, code: code });
      
      if (ret.status == 1) {
        counter++;
        //ctx.success();
      } else {
        //ctx.error();
        console.log("验证码重复", counter, code);
        continue;
      }
      
    } else {
      //重复，跳过
      continue;
    }
  }

  console.log("生成结束", counter);

});

/**
 * 投诉
 */
router.post('/complain', async (ctx, next) => {

  let openid = ctx.request.body.openid;
  let complain_type = ctx.request.body.complain_type;
  let phone = ctx.request.body.phone;
  let content = ctx.request.body.content;
  

  if (!phone || !content) {
    ctx.error();
    return;
  }

  let fid = await Util.getNextSequenceValue("feedback");

  let complain = {
    fid: fid,
    openid: openid,
    phone: phone,
    subject: complain_type,
    content: content
  }

  await MongoDB.insert("feedback", complain).then(result => {
    console.log("feedback", result);
    if (result.status == 1) {
      ctx.success();
    } else {
      ctx.error();
    }
  });
  
});

/**
 * 申请加入商家联盟
 */
router.post('/application', async (ctx, next) => {

  let openid = ctx.request.body.openid;
  let name = ctx.request.body.name;
  let mobilephone = ctx.request.body.mobilephone;
  let catalog = ctx.request.body.catalog;
  let business_name = ctx.request.body.business_name;
  let address = ctx.request.body.address;

  if (!mobilephone || !business_name) {
    ctx.error();
    return;
  }

  let aid = await Util.getNextSequenceValue("application");

  let application = {
    aid: aid,
    openid: openid,
    name: name,
    mobilephone: mobilephone,
    catalog: catalog,
    business_name: business_name,
    address: address
  }

  await MongoDB.insert("application", application).then(result => {
    console.log("application", result);
    if (result.status == 1) {
      ctx.success();
    } else {
      ctx.error();
    }
  });
  
});

module.exports=router.routes();