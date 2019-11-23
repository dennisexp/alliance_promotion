const MongoDB = require('../config/db');
const Util = require("../config/util");

module.exports = {

    /**
     * 获得商家优惠券大礼包
     */
    async collectCoupons() {
        let condition = [
            { $match: { "status": 1 } },
            {
                $project: {
                    "_id": 0,
                    cid: 1,
                    mid: 1,
                    title: 1,
                    telephone: 1,
                    address: 1,
                    display_order: 1,
                    coupons:1
                }
            },
            { $sort: { cid: 1, display_order: 1 } }
        ]

        let res = await MongoDB.aggregate("merchant", condition);

        //console.log(res.data);

        if (res.length > 0) {
            let list = [];
            res.data.forEach(element => {//组装成user schema里面格式
                let info = {
                    mid: element.mid,
                    title: element.title,
                    telephone: element.telephone,
                    address: element.address.text,
                    cid: element.cid,
                    display_order: element.display_order,
                    coupons: element.coupons
                }
                list.push(info);
            });
            return { "status": 1, "message": "SUCCESS", "data": list };
        } else {
            return { "status": 0, "message": "无可用的优惠券" };
        }
        
    },

    /**
     * 获得商户的销售信息
     * @param {*} mid 
     */
    async getSales(mid) {
        let condition = [
            { $match: { "mid": mid, $or: [{ "status": 1 }, { "status": 0 }] } },
            {
                $lookup: {
                    from: "merchants",
                    localField: "mid",
                    foreignField: "mid",
                    as: "merchant"
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "openid",
                    foreignField: "openid",
                    as: "customer"
                }
            },
            {
                $project: {
                    "_id": 0, "usage_id": 1, "openid": 1, "customer": "$customer.nickname",
                    "mid": 1, "merchant": "$merchant.title", "cid": 1, "coupon": 1, "payment": 1,
                    "use_time": 1, "status": 1
                }
            },
             { $unwind: "$merchant" }, 
             { $unwind: "$customer" }, 
            { $sort: { "status": 1, "use_time": -1 } }
        ]

        //console.log(condition);
        
        let ret = await MongoDB.aggregate("coupon_usage", condition);
        //console.log(ret);
        if (ret.length>0) {
            return { "status": 1, "message": "SUCCESS", "data": ret.data };
        } else {
            return { "status": 0, "message": "无销售记录" };
        }
    }
    
}