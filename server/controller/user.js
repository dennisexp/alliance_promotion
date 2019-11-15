const MongoDB = require('../config/db');
const Util = require("../config/util");

module.exports = {

    /**
     * 验证签名
     * @param {*} openid String
     * @param {*} params Object {} JSON格式，签名的参数
     * @param {*} sign String，待验证签名的值
     */
    
    async verify(openid, params, sign) {
        //
        if (!openid || !sign || !params) {
            return { "status": 0, "message": "参数错误" };
        };

        let res = await MongoDB.findInTable('user', {
            "openid": openid,
            "status": 1
        });

        if (res.length == 0) { //找不到该用户，则返回
            return { "status": 0, "message": "找不到用户信息" };
        }

        //console.log("user", res.data[0]);
        
        let salt = res.data[0].salt;

        params.salt = salt;

        //console.log("params",params);

        let verification = Util.sign(params);

        //console.log("verification", verification);

        //签名验证通过，返回用户信息
        if (verification === sign) {
            let userinfo = res.data[0];
            userinfo.salt = "";//去掉这个
            userinfo.password = "";
            return { "status": 1, "message": "签名正确", "data": userinfo };
        } else {
            return { "status": 0, "message": "签名错误" };
        }
    },

    /**
     * 修改用户信息
     * @param {*} openid 
     * @param {*} info 
     */
    async update(openid, info) {
        if (!openid || !info) {
            return { "status": 0, "message": "参数错误" };
        };

        // let res = await MongoDB.findInTable('user', {
        //     "openid": openid,
        //     "status": 1
        // });

        // if (res.length == 0) { //找不到该用户，则返回
        //     return { "status": 0, "message": "找不到用户信息" };
        // }

        let options = { upsert: false, new: true };
        let res = await MongoDB.findOneAndModify("user", { "openid": openid }, info, options);
        console.log("-----update-----",res);
        if (res.status == 1) {
            let userinfo = res.data;
            userinfo.salt = "";//去掉这个
            userinfo.password = "";
            return { "status": 1, "message": "SUCCESS", "data": userinfo };
        } else {
            return { "status": 0, "message": "找不到用户信息或信息修改失败" };
        }
        
    },

    getSalt() {
        
    },

    
}