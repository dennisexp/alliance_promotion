/**
 * 整合所有子路由
 */
const router = require('koa-router')();

//const home = require('./home');
//const api = require('./api');
//const admin = require('./admin');
//const work = require('./work');
//const error = require('./error');

//var mongoDB = require('../config/db');


router.get('/welcome', async (ctx, next) => {
  ctx.state = {
    title: '一合优品联盟商家'
  };

  //await ctx.render('index', { title: ctx.state });
});

router.get('/test', async (ctx, next) => {

  ctx.body = 'this a users response!';

  // await mongoDB.findInTable('user').then((res) => {
  //   ctx.body = res.data[0].name;
      
  //   //console.log(res);
      
  //   console.log("1. " + res.data[0].name + ":" + res.data[0].password);
      
  // });

    
});


module.exports=router.routes();