module.exports = {

    //数据库配置信息
    dbUrl: 'mongodb://yihe_user:5203344_zmkm@localhost:27017/',
    dbName: 'yihemall',

    //服务器的域名
    //domain: "192.168.0.112:8800",
    //server_ip: "192.168.0.112",
    server_ip : "localhost",
    server_port: "8800",
    server_domain: "https://server.yihemall.cn",

    client_domain: "https://app.yihemall.cn",

    //每页查询的数据（分页用）
    page_size: 20,
    

    //最低充值金额
    topup_threshold: 100,
    //最低提现金额
    withdraw_threshold: 50,
    //提现手续费
    withdraw_fee_rate:0.05,

    //支付宝配置
    alipay_app_id: "2018123062735455",
    alipay_seller_id:'2088431025693742',
    alipay_seller_email: 'qcbmc@yihegroup.cc',
    alipay_private_key_path: './public/key/private-key.pem',
    alipay_public_key_path: './public/key/public-key.pem',

    //微信app的配置
    weixin_app_id: "wx6dc5cde2c0c79ab7",//微信开放平台审核通过的应用APPID
    weixin_app_secret: "77e31254261d534ce71947bb6c9f6d96",

    weixin_partner_id: "1521944881",//微信支付分配的商户号
    weixin_partner_key: 'kjldfnKlkdfn21df215df2a12dga3afs', //微信商户平台API密钥

    //微信公众号的配置
    weixin_mp_app_id: "wxde4393c66d04cfd0",
    weixin_mp_app_secret: "c6c3b61b62b624662ae329ff1eedf0e0",

    

    
    
    
}