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
        if (!mid || +mid<=0) return { "status": 0, "message": "商户参数错误" };
        
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
                    "_id": 0, "usage_id": 1, "customer.openid": 1, "customer.nickname": 1, "customer.headimgurl": 1,
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
        //console.log(ret.data);
        if (ret.length == 0) return { "status": 0, "message": "无销售记录" };
        
        //分成两个序列，已经成交，未成交的
        let orderFinishedList = [];
        let orderPendingList = [];

        ret.data.forEach(order => {
            order.status == 0 ? orderPendingList.push(order) : orderFinishedList.push(order);
        });
        // console.log("orderPendingList");
        // console.log(orderPendingList);
        // console.log("orderFinishedList");
        // console.log(orderFinishedList);

        let list = {
            orderPendingList: orderPendingList,
            orderFinishedList: orderFinishedList
        }

        return { "status": 1, "message": "SUCCESS", "data": list };
    },

    /**
     * 更新销售记录：福利券的信息等
     * @param {*} usage_id 
     * @param {*} info 
     */
    async updateSales(usage_id, info) {
        if (!usage_id || !info) {
            return { "status": 0, "message": "商户参数错误" };
        }

        let ret = await MongoDB.findOneAndModify("coupon_usage", { usage_id: usage_id }, info);

        if (ret.status==1 && ret.data) {
            return { "status": 1, "message": "SUCCESS", data: ret.data };
        } else {
            return { "status": 0, "message": "操作失败" };
        }
    }
    
}