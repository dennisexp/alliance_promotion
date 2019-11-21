const Koa = require('koa')
const Router = require('koa-router')
const app = new Koa()
const router = new Router()

const views = require('koa-views')
const co = require('co')
const convert = require('koa-convert')
const json = require('koa-json')
const jsonp = require('koa-jsonp')
const cors = require('koa2-cors')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const koalogger = require('koa-logger')
const debug = require('debug')('koa2:server')
const path = require('path')
const Moment = require("moment");

const response = require('./services/response');

const config = require('./config/config')

const index = require('./routes/index')
const user = require('./routes/users')
const weixin = require('./routes/weixin')
const merchant = require('./routes/merchant')

//const port = process.env.PORT || config.domain.port

// error handler
onerror(app);

router.use('/user', user);
router.use('/weixin', weixin);
router.use('/merchant', merchant);
router.use(index);


// middlewares
// logger 使用插件替换自己写的
// app.use(async (ctx, next) => {
//   const start = new Date()
//   await next()
//   const ms = new Date() - start
//   console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
// })

const logger = koalogger((str) => {                // 使用日志中间件
  console.log(Moment().format('YYYY-MM-DD HH:mm:ss') + str);
});

app.use(convert(bodyparser({
  enableTypes: ['json', 'form', 'text'],
  extendTypes: {
    text: ['text/xml', 'application/xml']
  }
})))
  //.use(json())
  .use(jsonp())
  .use(cors())   //配置后台允许跨域
  .use(logger)  
  .use(require('koa-static')(__dirname + '/'+ config.static_path))
  .use(views(path.join(__dirname, '/views'), { options: {settings: {views: path.join(__dirname, 'views')}}, map: {'njk': 'nunjucks'}, extension: 'njk' }))
  .use(response)
  .use(router.routes())
  .use(router.allowedMethods())

router.get('/', async (ctx, next) => {
  // ctx.body = 'Hello World'
  ctx.state = {
    title: '一合优品商家联盟'
  }
  await ctx.render('index', ctx.state)
})


app.on('error', function(err, ctx) {
  console.log(err)
  logger.error('server error', err, ctx)
})

module.exports = app.listen(config.domain.port, () => {
  console.log(`Listening on http://localhost:${config.domain.port}`);
})
