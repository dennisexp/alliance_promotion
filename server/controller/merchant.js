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
        
    }
    
}