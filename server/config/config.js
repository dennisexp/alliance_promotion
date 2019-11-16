module.exports = {

    //数据库配置信息
    mongoDB: {
        dbUrl: 'mongodb://yihe_user:5203344_zmkm@localhost:27017/',
        dbName: 'alliance_promotion',
    },

    //服务器的域名
    domain: {
        port: 8801,
        server_domain: "http://jnserver.yihemall.cn",
        client_domain: "http://app.yihemall.cn",
    },
    

    //每页查询的数据（分页用）
    page_size: 20,
    
    //最低提现金额
    withdraw_threshold: 30,

    //大礼包的
    price: 0.01,

    //生成激活码的salt
    yiheSalt:"S2O33A4@Mann1n9",

    //微信公众号的配置和商户配置
    weixin: {
        partner_id: "1521944881",//微信支付分配的商户号
        partner_key: 'kjldfnKlkdfn21df215df2a12dga3afs', //微信商户平台API密钥

        //微信公众号的配置
        mp_app_id: "wxde4393c66d04cfd0",
        mp_app_secret: "c6c3b61b62b624662ae329ff1eedf0e0",
    },

}