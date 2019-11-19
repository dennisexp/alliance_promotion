var mongoose=require('mongoose');

/*
*schema对象，将模型暴漏出去
* */

//user, merchant,order,usage,reward,withdraw,

let collection = {
    grade: {
        //1：未付款（30元），1：已付款(或者已激活为有券用户)的普通用户（70元），2：推广员（100元），
        //3：合伙人（120），4：超人（150），6：Achilles（190）
        gid: { type: Number, unique: true },
        title: { type: String, trim: true },
        bonus: Number
    },

    user: {   //用户模型
        openid: { type: String, unique: true, trim: true },
        name: { type: String, default: "", trim: true },//真实姓名
        nickname: { type: String, trim: true },   //登录的用户名，须唯一
        mobilephone: { type: Number, trim: true },
        invitation_code: String,  //邀请码，推荐码  唯一  字母和数字组合
        sex: Number,//值为1时是男性，值为2时是女性，值为0时是未知
        headimgurl: String,
        password: { type: String },
        salt: String,
        type: { type: Number, default: 1 },  //会员类型，1：用户，2：用户兼商户
        grade: { type: Number, default: 0 },//0：未付款（30元），1：已付款(或者已激活为有券用户)的普通用户（70元），2：推广员（100元），3：合伙人（120），4：领导人（150），6：Achilles（190）
        status: { type: Number, default: 1 },
        create_time: { type: Date, default: Date.now },
        last_login_time: Date,
        parent_code: { type: String, default: "0" },//上级节点
        balance: {
            bonus: { type: Number, default: 0 },
            withdrawing: { type: Number, default: 0 },
            withdrawals: { type: Number, default: 0 }
        },
        statistics: {
            used: [
                {
                    mid: { type: Number, required: true }, //商户ID
                    coupons: [ //各种优惠券
                        {
                            cid: { type: Number, required: true },//券的id
                            payment: { type: Number, default: 0 },//付款金额
                            pay_time: { type: Date, default: Date.now },//使用时间
                        }
                    ],   
                }
            ],
            unused: [
                {
                    mid: { type: Number, required: true }, //商户ID
                    coupons: [ //优惠券
                        {
                            cid: { type: Number, required: true },
                            number: { type: Number, default: 1 },//张数
                        }
                    ],   
                }
            ],
        },
        account: { //提现的账户信息
            account_type: { type: String, trim: true, default: '支付宝' },
            account_name: { type: String, trim: true, default: '' },
            account_number: { type: String, trim: true, default: '' }
            
        },
        address: {
            city: String, //普通用户个人资料填写的城市
            province: String, //用户个人资料填写的省份
            country: String //国家，如中国为CN
        }
        
    },

    /**
     * 商家
     */
    merchant: {
        mid: { type: Number, unique: true },
        openid: { type: String },
        title: { type: String, trim: true, required: true },
        telephone: { type: String, required: true },
        display_order: { type: Number, default: 1 },   //排序顺序 12345
        status: { type: Number, default: 1 },         //是否显示(上架1，下架-1，草稿0，删除-2等)
        cid: { type: Number, required: true },  //类别id
        recommend: { type: Number, default: 0 },  //特别推荐
        address: {//地址
            text: { type: String, required: true },//文本地址
            map:{ type: String },//地图位置
        },
        media: {
            thumbnail_url: String, //头像缩略图
            video_url: String,/**短视频的地址*/
            slideshow: [ //轮播图
                {
                    url: String
                }
            ],
            detail:[ //详细图
                {
                    url: String
                }
            ]
        },
        coupons: [ //现金消费合计（购物）
            {
                cid: { type: Number, required: true },//优惠券的id
                label: { type: String, required: true },//名称
                type: { type: Number, default: 1 }, //单次使用1，无限次使用2
                display_order:{ type: String, required: true }
            }
        ],
        regulation: String,
        create_time: { type: Date, default: Date.now }
    },

    /** 订单: 购买优惠券的订单 */
    order: {
        oid: { type: Number, unique: true },
        openid: { type: String, required: true },
        nickname: String, //微信的nickname
        parent_code: { type: String },
        subject: String,//订单摘要，描述等
        trade_no: String,  //对外业务编号
        payment_no: String,  //微信发回来的付款编号 
        amount: {    //含邮费
            payment: Number,
            bonus: Number
        },
        status: { type: String, default: "WAIT_BUYER_PAY" },  //TRADE_FINISHED(创建),TRADE_SUCCESS（支付成功）,TRADE_CLOSED（关闭）,FINISHED（结束）
        order_time: { type: Date, default: Date.now }, //下单时间
        payment_time: { type: Date} //付款单时间
    },


    /**  优惠券使用情况 */
    coupon_usage: {
        usage_id: { type: Number, unique: true },
        openid: { type: String, required: true },
        mid: { type: Number, required: true }, //商户ID
        coupons: {
            cid: { type: Number, required: true },
            number: { type: Number, default: 1 },//张数
        },
        payment: { type: Number, default: 0 },//付款金额
        use_time: { type: Date, default: Date.now },//使用时间
        status: { type: Number, default: 0 },//0:待商家确认，1：已确认
    },

    /**  提现流水 */
    withdraw: {
        wid: { type: Number, unique: true },
        openid: { type: String, required: true },  //用户编号
        amount: Number, //提现金额
        fee: Number, //提现手续费
        subject: String, //交易内容（摘要）
        status: { type: Number, default: 0 },// 状态，拒绝-1，申请0，成功1
        account: { //提现的账户信息
            account_type: String,
            account_number: { type: String, trim: true },
            account_name: { type: String, trim: true }
        },
        apply_time: { type: Date, default: Date.now },  //提现申请时间
        audit_time: { type: Date }  //支付时间
    },

    /**  投诉和反馈 */
    feedback: {
        fid: { type: Number, unique: true },
        openid: { type: String, required: true },  //用户编号
        phone: Number,
        subject: String, //投诉标题
        content: String, //投诉内容（摘要）
        submit_time: { type: Date, default: Date.now }  //支付时间
    },

    /**  申请加入活动 */
    application: {
        aid: { type: Number, unique: true },
        openid: { type: String, required: true },
        name: {type: String, required: true},
        mobilephone: { type: String, required: true },
        catalog: { type: String, required: true },
        business_name: { type: String, required: true },
        address:{ type: String, required: true },
        submit_time: { type: Date, default: Date.now }  //申请时间
    },

    /**  激活码登记表 */
    activation: {
        aid: { type: Number, unique: true },
        openid: { type: String },
        name: {type: String},
        mobilephone: { type: String },
        code: { type: String, unique: true, required: true },
        status: { type: Number, default: 0 },         //是否正常(已使用1，未使用0，作废-1，)
        activate_time: { type: Date }  //激活时间
    },

    //序列自增长用
    counter: {
        "key": { type: String, required: true },
        "sequence_value": { type: Number, default: 1 }
    }
};

module.exports = {
    collections: collection,
    grade: mongoose.model('grade', collection['grade'], 'grades'),
    user: mongoose.model('user', collection['user'], 'users'),
    merchant: mongoose.model('merchant', collection['merchant'], 'merchants'),
    order: mongoose.model('order', collection['order'], 'orders'),
    coupon_usage: mongoose.model('coupon_usage', collection['coupon_usage'], 'coupon_usage'),
    withdraw: mongoose.model('withdraw', collection['withdraw'], 'withdraw_info'),
    feedback: mongoose.model('feedback', collection['feedback'], 'feedbacks'),
    application: mongoose.model('application', collection['application'], 'applications'),
    activation: mongoose.model('activation', collection['activation'], 'activations'),
    counter: mongoose.model('counter', collection['counter'], 'counters')
};

