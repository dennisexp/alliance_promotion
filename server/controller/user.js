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
            //userinfo.salt = "";//去掉这个
            userinfo.password = "";
            return { "status": 1, "message": "签名正确", "data": userinfo };
        } else {
            return { "status": 0, "message": "操作未经授权" };
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

        let options = { upsert: false, new: true };
        let res = await MongoDB.findOneAndModify("user", { "openid": openid }, info, options);
        //console.log("-----update-----",res);
        if (res.status == 1 && res.data) {
            let userinfo = res.data;
            //userinfo.salt = "";//去掉这个
            userinfo.password = "";
            return { "status": 1, "message": "SUCCESS", "data": userinfo };
        } else {
            return { "status": 0, "message": "找不到用户信息或信息修改失败" };
        }
        
    },

    async getInfoByInvitationCode(code) {
        if (!code || code.trim() == "0" || code == 0) {
            return { "status": 0, "message": "参数错误" };
        };

        let condition = [
            {
                $match: {
                    "invitation_code": code.trim(),
                    "status": 1
                }
            },
            {
                $lookup: {
                    from: "grades",
                    localField: "grade",
                    foreignField: "gid",
                    as: "grade"
                }
            },
            {
                $project: {
                    "_id": 0,
                    openid: 1,
                    nickname: 1,
                    grade: 1
                }
            },
            { $unwind: "$grade" },
            { $limit: 1 }];
        
        let res = await MongoDB.aggregate("user", condition);
        //console.log("userinfo by code ", res);
        if (res.length > 0) {
            return { "status": 1, "message": "SUCCESS", "data": res.data[0] };
        } else {
            return { "status": 0, "message": "找不到用户信息" };
        }
        
    },

    /**
     * 将用户的福利券，分开为已使用和未使用
     * @param {*} couponList 
     */
    sepatateCoupons(couponList) {
        let availableCouponList = [];
        let usedCouponList = [];
        couponList.forEach(merchant => {
            //先弄可用的券
            let info = {
                mid: merchant.mid,
                title: merchant.title,
                telephone: merchant.telephone,
                address: merchant.address,
                cid: merchant.cid,
                display_order: merchant.display_order,
            }
            let availableListTemp = [];
            
            merchant.coupons.forEach(coupon => {
                let c = {
                    cid: coupon.cid,
                    label: coupon.label,
                    type: coupon.type,
                    status: coupon.status
                }
                if (coupon.status == 1) {
                    availableListTemp.push(c);
                }
            });

            //   console.log("availableListTemp");
            // console.log(availableListTemp);
            // console.log("usedTemp");
            //   console.log(usedTemp);
            
            if (availableListTemp.length > 0) {
                let temp = info;
                temp.coupons = availableListTemp;
                availableCouponList.push(temp);//未使用的券
            }

        });

        couponList.forEach(merchant => {
            //在弄已失效的
            let info = {
                mid: merchant.mid,
                title: merchant.title,
                telephone: merchant.telephone,
                address: merchant.address,
                cid: merchant.cid,
                display_order: merchant.display_order,
            }
            let usedTemp = [];

            //console.log("user merchant");
            //console.log(merchant);
            
            merchant.coupons.forEach(coupon => {
                let c = {
                    cid: coupon.cid,
                    label: coupon.label,
                    type: coupon.type,
                    status: coupon.status
                }
                if (coupon.status == 0) {
                    usedTemp.push(c);
                }
            });

            //   console.log("availableListTemp");
            // console.log(availableListTemp);
            // console.log("usedTemp");
            //   console.log(usedTemp);
            
            if (usedTemp.length > 0) {
                let temp = info;
                temp.coupons = usedTemp;
                usedCouponList.push(temp);//已经使用的券
            }
        });

        let ret = {
            availableCouponList: availableCouponList,
            usedCouponList: usedCouponList
        }
        return ret;
    },

    /**
     * 将使用过的福利券失效
     * @param {*} openid 用户的openid
     * @param {*} mid 商家id
     * @param {*} cid 福利券id
     */
    async invalidateCoupon(openid, mid, cid) {
        let ret = await this.updateCouponStatus(openid, mid, cid, 0);
        return ret;
    },

    /**
     * 将使用过的福利券重新激活生效
     * @param {*} openid 用户的openid
     * @param {*} mid 商家id
     * @param {*} cid 福利券id
     */
    async validateCoupon(openid, mid, cid) {
        let ret = await this.updateCouponStatus(openid, mid, cid, 1);
        return ret;
    },

    /**
     * 将使用过的福利券失效或重新生效
     * @param {*} openid 用户的openid
     * @param {*} mid 商家id
     * @param {*} cid 福利券id
     * @param {*} status 更新后的状态，1激活可用，0失效
     */
    async updateCouponStatus(openid, mid, cid, status) {
        if (!openid || !mid || !cid || !(status==1 || status==0)) {
            return { "status": 0, "message": "参数错误" };
        }
        
        let condition = { "openid": openid }

        let update = { $set: { "statistics.$[i].coupons.$[j].status": status } }

        let options = {
            upsert: false,
            new: true,
            arrayFilters: [
                {
                    "i": { $type: "object" },
                    "i.mid": +mid,
                    "i.coupons": { $type: "object" }
                },
                {
                    "j": { $type: "object" },
                    "j.type": 1,
                    "j.cid": +cid
                }
            ]
        }
        
        let ret = await MongoDB.findOneAndModify("user", condition, update, options);
        //console.log(ret.data);

        if (ret.status==1) 
            return { "status": 1, "message": "SUCCESS", "data": ret.data };
        else
            return { "status": 0, "message": "无该用户的信息" };
        
    }
    
}