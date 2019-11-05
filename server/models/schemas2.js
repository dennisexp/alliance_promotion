var mongoose=require('mongoose');

/*
*schema对象，将模型暴漏出去
* */

//user, merchant,order,usage,reward,withdraw,

let collection = {
    //会员等级规则

    user: {   //用户模型
        uid: { type: Number, unique: true },
        name: { type: String, default: "一合用户", trim: true },//真实姓名
        nickname: { type: String, unique: true, trim: true },   //登录的用户名，须唯一
        idnumber: { type: String, default: "", trim: true },
        mobilephone: { type: Number, default: 0, trim: true },
        invitation_code: String,  //邀请码，推荐码  唯一  字母和数字组合
        birthday: Date,
        password: { type: String, required: true },
        salt: String,
        grade_id: Number,  //会员等级gid
        status: { type: Number, default: 0 },
        createtime: { type: Date, default: Date.now },
        last_login_time: Date,
        parent_id: Number,//上级节点
        creater_id: Number,//创建人
        active_type: Number,//现金账户1，一合币账户2
        balance: {
            cash: { type: Number, default: 0 },
            offset: { type: Number, default: 0 },
            yihecoin: { type: Number, default: 0 },
            withdrawing: { type: Number, default: 0 }
        },
        statistics: {
            consumption: {
                min_yihecoin: { type: Number, default: 193 }, //必须用于消费的额度
                sum_cash: { type: Number, default: 0 },   //现金消费合计（购物）
                sum_yihecoin: { type: Number, default: 0 }  //一合币消费合计（购物） 
            },
            balance: {
                sum_withdrawal: { type: Number, default: 0 },    //提现合计
                sum_awards: { type: Number, default: 0 },       //奖金合计
                sum_self_cash_top_up: { type: Number, default: 0 },   //自己账户充值合计（指用支付宝等-->自己现金账户）
                sum_self_yihecoin_top_up: { type: Number, default: 0 },   //自己账户充值合计（指用现金-->自己一合币）
                sum_fans_cash_top_up: { type: Number, default: 0 },   //给下级粉丝充值合计（指用现金-->别人一合币）
                sum_fans_yihecoin_top_up: { type: Number, default: 0 },   //给下级粉丝充值合计（指用现金-->别人一合币）
                sum_transfer_cash: { type: Number, default: 0 },  //现金转账合计（含给粉丝充值）（指现金-->别人现金）
                sum_transfer_yihecoin: { type: Number, default: 0 }  //一合币转账合计（含给粉丝充值）（指一合币-->别人一合币）
            },
            activate_fans_son_by_cash: [
                {
                    grade: Number,
                    num: { type: Number, default: 0 }
                }
            ],
            activate_fans_grandson_by_cash: [
                {
                    grade: Number,
                    num: { type: Number, default: 0 }
                }
            ],
            activate_fans_son_by_yihecoin: [
                {
                    grade: Number,
                    num: { type: Number, default: 0 }
                }
            ],
            activate_fans_grandson_by_yihecoin: [
                {
                    grade: Number,
                    num: { type: Number, default: 0 }
                }
            ]

        },
        account: { //提现的账户信息
            account_type: { type: String, trim: true, default: '支付宝' },
            number: { type: String, trim: true, default: '' },
            account_name: { type: String, trim: true, default: '' }
        },
        addresses: [
            {
                province: String,
                city: String,
                district: String,
                street: { type: String, trim: true },
                receiver: { type: String, trim: true },
                phone: Number,
                is_default: Boolean
            }
        ]
    },

    /**
     * 商家
     */
    merchant: {
        mid: { type: Number, unique: true },
        title: { type: String, trim: true, required: true },
        display_area: { type: Number, default: 1 },   //兑换区产品1   或是源头直供2，都显示0，选一
        status: { type: Number, default: 0 },         //是否显示(上架1，下架-1，草稿0，删除-2等)
        cid: { type: Number, required: true },  //类别id
        feature: {    //显示在推荐区0,1(hot)，新品区0,1,都没有0
            recommend: { type: Number, default: 0 },
            new_arrival: { type: Number, default: 0 }
        },
        specification: [   //购买时选择的规格
            {
                key: String,//例如：颜色
                value: [String]  //[黄色、紫色]
            }
        ],
        inventory: Number,   //库存
        count: Number,   //销量
        selling_type: { type: Number, default: 1 },   //销售方式：正常销售1、兑换2，领养3等 限时促销11、团购12等    

        price: {
            cash: Number,
            yihecoin: Number
        },
        sale: {
            sale_price_cash: Number,
            sale_yihecoin: Number,
            sale_end_date: Date
        },
        group_purchase: {
            min_quantity: Number,
            gp_price_cash: Number,
            gp_yihecoin: Number,
            gp_end_date: Date
        },
        express_fee: {
            cash: Number,
            yihecoin: Number
        },

        images: {
            thumbnail_url: String,
            slideshow: [
                {
                    url: String
                }
            ]
        },
        description: String,
        detail: String,
        create_time: { type: Date, default: Date.now },
        last_update_time: { type: Date, default: Date.now }
    },

    /**  订单 */
    order: {
        oid: { type: Number, unique: true },
        uid: Number,
        user_name: String,
        trade_no: Number,  //对外业务编号 
        total: {    //含邮费
            cash: Number,
            yihecoin: Number
        },

        status: { type: Number, default: 0 },  //订单状态：已删除-2，已取消-1、未付款0、已付款但未发货1，全部已经已发货2

        order_time: { type: Date, default: Date.now }, //下单时间

        payment_time: { type: Date}, //付款单时间

        shipping_address: {
            address: { type: String, trim: true },
            receiver: { type: String, trim: true },
            phone: Number
        },

        express: {
            company: String,//如果为0，则表示是自提的。
            tracking_number: String,
            update_time: { type: Date, default: Date.now }   //发单时间
        },

        comment: String//买家留言
    },


    /**  优惠券使用情况 */
    usage: {
        usage_id: { type: Number, unique: true },
        uid: Number,
        user_name: String,
        products: [
            {
                type: Number,     //类型：兑换，购物（正常销售、限时促销、团购），领养等
                product_id: Number,
                product_title: String,
                quantity: Number,
                price: {
                    cash: Number,
                    yihecoin: Number
                },
                order_price: {
                    cash: Number,
                    yihecoin: Number
                },
                express_fee: {
                    cash: Number,
                    yihecoin: Number
                },
                subtotal: { //含运费
                    cash: Number,
                    yihecoin: Number
                },
                add_time: { type: Date, default: Date.now },//  添加时间   30天自动删除
                status: { type: Number, default: 1 }    //失效-1  有效1
            }
        ]
    },

    /**  提现流水 */
    log_withdraw: {
        wid: { type: Number, unique: true },
        uid: Number,  //用户编号
        amount: Number, //提现金额
        fee: Number, //提现手续费
        subject: String, //交易内容（摘要）
        status: { type: Number, default: 0 },// 状态，拒绝-1，申请0，成功1
        account: { //提现的账户信息
            account_type: String,
            number: { type: String, trim: true },
            account_name: { type: String, trim: true }
        },
        apply_time: { type: Date, default: Date.now },  //提现申请时间
        audit_time: { type: Date }  //支付时间
    },

    //奖金来源：用现金激活粉丝，自己给自己用现金充值，自己给粉丝充值（转账），粉丝充值（使用现金）、粉丝购物（使用现金）
    log_reward: {
        rid: { type: Number, unique: true },
        reward_type: Number, //自己充值11（现金-->一合币），自己购物12。下级粉丝现金激活3，下下级粉丝现金激活4，下级粉丝现金充值21，下下级粉丝现金充值22，下级粉丝现金升级25，下下级粉丝现金升级26，下级粉丝购物31，下下级粉丝购物32。
        oid: Number,  //订单编号：上述类别中的各个编号top_up_log中的id，购物的order中id。激活编号（粉丝id），充值编号，订单编号
        uid: { type: Number, required: true }, //奖金收款人的id
        amount: {   //奖金金额
            cash: Number, //这个数据，可能加到offset账户中
            yihecoin: Number
        },
        subject: String, //奖金摘要内容
        reward_time: { type: Date, default: Date.now }  //奖金产生时间
    },


    //序列自增长用
    counter: {
        "key": { type: String, required: true },
        "sequence_value": { type: Number, default: 1 }
    }
};

module.exports = {
    collections: collection,
    user: mongoose.model('user', collection['user'], 'users'),
    product: mongoose.model('product', collection['product'], 'products'),
    order: mongoose.model('order', collection['order'], 'orders'),
    account_detail: mongoose.model('account_detail', collection['account_detail'], 'account_details'),
    pay_log: mongoose.model('pay_log', collection['pay_log'], 'paylogs'),
    top_up_log: mongoose.model('top_up_log', collection['top_up_log'], 'top_up_logs'),
    withdraw_log: mongoose.model('withdraw_log', collection['withdraw_log'], 'withdraw_logs'),
    reward_log: mongoose.model('reward_log', collection['reward_log'], 'reward_logs'),
    banner: mongoose.model('banner', collection['banner'], 'banners'),
    counter: mongoose.model('counter', collection['counter'], 'counters')
};

