var mongoose=require('mongoose');

// var UserSchema = mongoose.Schema({
//     username: String
// });

// module.exports = mongoose.model('User', UserSchema, 'user');


/*
*schema对象，将模型暴漏出去
* */


let collection = {
    //会员等级规则
    grade: {
        gid: { type: Number, unique: true },  //id
        grade: { type: Number, default: 1 },//1,2,3,4,5,6 等级
        title: { type: String, trim: true }, //等级名称
        status: { type: Number, default: 1 }, //状态
        visible: { type: Number, default: 1 }, //是否在app端可见
        initial_top_up_yihecoin: {type:Number,default:193},  //激活账户时（首次充值）的一合币数量
        min_consumption: { type: Number, default: 193 },//最低消费额,仅仅用于消费
        consumption_discount: { type: Number, default: 0.9 },//消费打折
        initial_rewards_son: [   //首次分享奖励
            {
                grade: Number,  //下级等级
                reward: Number,   //奖金额
                extra_bonus: { type: Number, default: 0 }, //额外奖金额
                num_of_fans: { type: Number, default: 0 }  //每达到第几个粉丝时
            }
        ],

        initial_rewards_grandson: [
            {
                grade: Number,  //下下级等级
                reward: Number,   //奖金额
                extra_bonus: { type: Number, default: 0 }, //额外奖金额
                num_of_fans: { type: Number, default: 0 }  //每达到第几个粉丝时
            }
        ],

        top_up_rules: {   //充值规则
            //min: { type: Number, default: 193 },   //最低充值额
            max: { type: Number, default: 100000 },   //单次最高充值额,
            discount: { type: Number, default: 0.15 }   //折扣，具体数据(百分比)
        },
  
        top_up_rewards_son: [   //下级充值后，给能得到的奖励
            {
                grade: Number,  //下级粉丝等级
                reward_rate: { type: Number, default: 0.00 },   //奖金比例，百分比
            }
        ]
    },


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

            //min_consumption_yihecoin: { type: Number, default: 193 },
            // sum_grade_2_num_by_cash: { type: Number, default: 0 },   //创客报单次数（仅指用现金激活，不含用一合币激活的）
            // sum_grade_3_num_by_cash: { type: Number, default: 0 },   //合伙人报单次数（仅指用现金激活，不含用一合币激活的）
            // sum_grade_2_num_all: { type: Number, default: 0 },   //创客报单次数（含用现金激活和用一合币激活的总数）
            // sum_grade_3_num_all: { type: Number, default: 0 },   //合伙人报单次数（含用现金激活和用一合币激活的总数）
            // sum_withdrawal: { type: Number, default: 0 },    //提现合计
            // sum_awards: { type: Number, default: 0 },       //奖金合计
            // sum_self_cash_top_up: { type: Number, default: 0 },   //自己账户充值合计（指用支付宝等-->自己现金账户）
            // sum_self_yihecoin_top_up: { type: Number, default: 0 },   //自己账户充值合计（指用现金-->自己一合币）
            // sum_fans_cash_top_up: { type: Number, default: 0 },   //给下级粉丝充值合计（指用现金-->别人一合币）
            // sum_transfer_yihecoin_to_others: { type: Number, default: 0 },  //一合币转账合计（含给粉丝充值）（指一合币-->别人一合币）
            //sum_consumption_cash: { type: Number, default: 0 },   //现金消费合计（购物）
            //sum_consumption_yihecoin: { type: Number, default: 0 }  //一合币消费合计（购物） 
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

    /**  商品类别信息 */
    catalog: {
        cid: { type: Number, unique: true },
        title: { type: String, unique: true },
        image: String,
        level: Number,  //第几级分类  1,2,3
        parent_id: Number,   //第1级的话，parent_id=0, 第2、3级的话，就是上级的cid
        status: { type: Number, default: 0 },
        weight: { type: Number, min: 1, max: 255 },   //权重
        description: { type: String, trim: true }
    },

    /**
     * 商品
     */
    product: {
        pid: { type: Number, unique: true },
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

    order_item: {
        item_id: { type: Number, unique: true },
        oid: Number,
        uid: Number,   //用户
        type: Number,     //类型：兑换，购物（正常销售、限时促销、团购），领养等
        product_id: Number,
        product_title: String,
        specification: String,   //购买时选择的规格，例如：颜色
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
        subtotal: {
            cash: Number,    //订单状态：含邮费
            yihecoin: Number
        },

        status: { type: Number, default: 0 },  //订单状态：已删除-2，已取消-1、未付款未发货0、已付款未发货1、已经付款已发货2（交易成功，结束）

        payment_status: { type: Number, default: 0 },  //付款状态：已退款-2，退款中-1（退款金额多少），未付款0、已付款1、

        order_time: { type: Date, default: Date.now }, //下单时间
    },

    /**  购物车 */
    cart: {
        cart_id: { type: Number, unique: true },
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

    /**  账号变动明细 */
    account_detail: {
        adid: { type: Number, unique: true },
        uid: Number,  //用户编号
        log_id:Number, //pay_id，或top_up_id，或wid
        trans_type: Number,//交易类型：购买支付支出1，转账（给他人充值）支出2，报单支出3，现金充值10，一合币充值11，报单奖金收入12，转账收入13，激活收入14，粉丝充值奖金收入15，粉丝消费奖金收入16，升级17,粉丝升级奖金收入18，提现申请 21，提现成功31
        amount: {   //金额变动情况   
            cash: Number,
            offset: Number,
            yihecoin: Number,
            withdrawing: Number
        },
        subject: String, //交易内容（摘要）
        transaction_time: { type: Date, default: Date.now }  //账号变动时间
    },


    /**  商品支付流水 */
    pay_log: {
        plid: { type: Number, unique: true },
        oid: Number,  //订单编号
        uid: Number,  //用户编号
        amount: {   //支付金额
            cash: Number,
            offset: Number,
            yihecoin: Number
        },
        subject: String, //交易内容（摘要）
        payment_time: { type: Date, default: Date.now }  //支付时间
    },

    /**  充值流水记录（含支付宝、微信对现金账户的充值，支付宝、微信、现金（含可对冲）、一合币对一合币的充值） */
    top_up_log: {
        tlid: { type: Number, unique: true },
        trade_no: { type: String, unique: true },  //对外业务编号
        uid_pay: Number,  //付款用户编号
        uid_income: Number,  //充值收款用户编号
        payment_type: Number,  //支付类型:现金余额(含可对冲)1、一合币2、支付宝4，微信5，
        fb_payment_no: String,  //反馈回来的支付宝，微信等交易流水编号。现金1、可对冲2、一合币3的流水号等于“tlid + "_" + trade_no”
        amount: {   //充值金额
            cash: Number,
            yihecoin: Number
        },
        subject: String, //充值摘要内容
        status: { type: String, default: "WAIT_BUYER_PAY" }, //TRADE_FINISHED(创建),TRADE_SUCCESS（支付成功）,TRADE_CLOSED（关闭）,FINISHED（结束）
        top_up_time: { type: Date, default: Date.now }  //充值时间
    },

    /**  提现流水 */
    withdraw_log: {
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
    reward_log: {
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

        /**  转账流水记录（含支付宝、微信对现金账户的充值，支付宝、微信、现金（含可对冲）、一合币对一合币的充值） */
    transfer_log: {
        tid: { type: Number, unique: true },
        trade_no: { type: String, unique: true },  //对外业务编号
        uid_payer: Number,  //付款用户编号
        uid_payee: Number,  //收款用户编号
        trans_type: String,  //支付类型:现金、一合币，
        amount: {   //充值金额
            cash: Number,
            yihecoin: Number
        },
        subject: { type: String, default: '转账' }, //充值摘要内容
        trans_time: { type: Date, default: Date.now }  //充值时间
    },

        /**  转账流水记录（含支付宝、微信对现金账户的充值，支付宝、微信、现金（含可对冲）、一合币对一合币的充值） */
    upgrade_log: {
        ugid: { type: Number, unique: true },
        trade_no: { type: String, unique: true },  //对外业务编号
        uid_payer: Number,  //付款用户编号
        uid_upgrade: Number,  //升级用户编号
        trans_type: String,  //支付类型:现金，
        amount: {   //升级支付的金额
            cash: Number,
            yihecoin: Number
        },
        subject: { type: String, default: '用户升级' }, //充值摘要内容
        trans_time: { type: Date, default: Date.now }  //充值时间
    },

    banner: {
        bid: { type: Number, unique: true },
        title: { type: String, trim: true, required: true },
        status: { type: Number, default: 1 },    //失效-1  有效1
        image_url: { type: String, required: true },
        weight: { type: Number, min: 1, max: 255 }   //权重
    },

    //序列自增长用
    counter: {
        "key": { type: String, required: true },
        "sequence_value": { type: Number, default: 1 }
    }
};

module.exports = {
    collections: collection,
    grade: mongoose.model('grade',collection['grade'],'membership_grades'),
    user: mongoose.model('user', collection['user'], 'users'),
    catalog: mongoose.model('catalog', collection['catalog'], 'product_catalogs'),
    product: mongoose.model('product', collection['product'], 'products'),
    order: mongoose.model('order', collection['order'], 'orders'),
    order_item: mongoose.model('order_item', collection['order_item'], 'order_items'),
    cart: mongoose.model('cart', collection['cart'], 'shopping_carts'),
    account_detail: mongoose.model('account_detail', collection['account_detail'], 'account_details'),
    pay_log: mongoose.model('pay_log', collection['pay_log'], 'paylogs'),
    top_up_log: mongoose.model('top_up_log', collection['top_up_log'], 'top_up_logs'),
    withdraw_log: mongoose.model('withdraw_log', collection['withdraw_log'], 'withdraw_logs'),
    reward_log: mongoose.model('reward_log', collection['reward_log'], 'reward_logs'),
    upgrade_log: mongoose.model('upgrade_log', collection['upgrade_log'], 'upgrade_logs'),
    transfer_log: mongoose.model('transfer_log', collection['transfer_log'], 'transfer_logs'),
    banner: mongoose.model('banner', collection['banner'], 'banners'),
    counter: mongoose.model('counter', collection['counter'], 'counters')
};

