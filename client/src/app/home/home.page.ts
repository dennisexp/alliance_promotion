import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, PopoverController, AlertController, ToastController } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';

import { CommonService } from '../services/common.service';
import { StorageService } from '../services/storage.service';
import { UserDaoService } from '../services/user.dao.services';
import { BaseUI } from '../component/baseui';

import * as moment from 'moment';
declare var window: any;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage extends BaseUI {

  public bgCss = [
    this.sanitizer.bypassSecurityTrustStyle(`url(http://app.yihemall.cn/assets/img/merchant0.png) 0% 0% / 100% 100%`),
    this.sanitizer.bypassSecurityTrustStyle(`url(http://app.yihemall.cn/assets/img/merchant1.png) 0% 0% / 100% 100%`),
    this.sanitizer.bypassSecurityTrustStyle(`url(http://app.yihemall.cn/assets/img/merchant2.png) 0% 0% / 100% 100%`),
  ];

  public none = this.sanitizer.bypassSecurityTrustStyle(`display:none`);
  public border = this.sanitizer.bypassSecurityTrustStyle(`border-radius: 0 0 1rem 1rem;`);

  public userinfo:any = {
    openid: "",
    grade: 0
  };

  public merchantList: [{}];

  /**
   * 倒计时剩余天数
   */
  public timeDay: number = 0;
  /**
   * 倒计时剩余小时数
   */
  public timeHour: number = 0;
  /**
   * 倒计时剩余分钟数
   */
  public timeMinute: number = 0;
  /**
   * 倒计时剩余秒数
   */
  public timeSecond: number = 0;
  /**
   * 倒计时类型 ,未开始，一开始未结束，已结束
   */
  public timerLabel: string;
  /**
   * 待比较时间
   */
  public compareTime: Date;
  /**
   * 倒计时控制器
   */
  public timer: any = null;

  private _endTime: Date = new Date('2020/02/22 23:59:59');
  //private _endTime: Date = new Date('2019-11-09 21:26:15');
  private _startTime: Date = new Date('2019/11/22 09:13:00');
  //private _startTime: Date = new Date('2019-11-09 21:26:00');
  
  constructor(
    public common: CommonService,
    public storage: StorageService,
    public userDao: UserDaoService,
    public sanitizer:DomSanitizer,
    public activatedRoute: ActivatedRoute,
    public navController: NavController,
    public alertController: AlertController,
    public toastController: ToastController,
    public popoverController: PopoverController
  ) {
    super();
  }
  
  ngOnInit() {
    let code: any;
    let invitation_code: any;
    let openid: any;
    
    this.activatedRoute.queryParams.subscribe((data: any) => {
      console.log("local data: ", data);
      if (data && data.code) {
        code = data.code;
      }

      if (data && data.state) {
        try {
          invitation_code = JSON.parse(data.state).invitation_code;
        } catch(e){
          console.log("state error: ", data.state);
        }
      }

      if (data && data.openid) {
        openid = data.openid;
      }

    });

    //code = "021sIgA41MC5pT1p1Nz415SvA41sIgAg";
    //return;
    this.userinfo = this.storage.get("userinfo_" + openid);

    if (openid && openid.trim()!="" && this.userinfo && this.userinfo.openid) {
      //正常的用户

    } else if (!code || code.trim() == "") {
      //公众号验证，获得code，进而获得openid
      //如果code为空，则获取code
      this.getCode(invitation_code);
      //如果code已经获取，那么获取openid以及用户的信息等
    } else {
      let api = "weixin/userinfo?code=" + code;// + "&parent_code=" + invitation_code;
      api = invitation_code ? (api + "&parent_code=" + invitation_code) : api;
      this.common.ajaxGet(api).then((response:any)=>{
        //console.log("response: ",response);
        if (response && response.status.code == 1) {
          this.userinfo = response.data;//获得用户信息
          this.storage.set("userinfo_" + this.userinfo.openid, this.userinfo);
          console.log("userinfo", this.userinfo);
        } else {
          //super.presentFailureToast(this.toastController, "无法获得微信用户的信息，请重试");
          this.getCode(invitation_code);//再重新刷一遍
        }
      })
    }
  }

  getCode(invitation_code) {
    let api = "weixin/authorizeURL?redirect_uri=" + encodeURIComponent(this.common.config.app_domain + "home");//+"&invitation_code="+invitation_code;
      api = invitation_code ? (api + "&invitation_code=" + invitation_code) : api;
      this.common.ajaxGet(api).then((response: any) => {
        //console.log("response",response);
        if (response && response.status.code==1) {
          window.location=decodeURIComponent(response.data)+"";
          //console.log('打开url',response.data);
        } else {
          super.presentFailureToast(this.toastController, "无法获得微信用户的信息，请重试");
        }
      })
  }

  async ionViewDidEnter() {
    this.processTime();
    //获得商家信息
    let merchants = await this.common.ajaxGet("merchant/all");
    if (merchants && merchants['status'].code == 1) {
      this.merchantList = merchants['data'];
    }

    console.log("merchantList");
    console.log(this.merchantList);
    
  }

  ionViewWillLeave() {
    this.isPlay? this.playAudio():"";
  }

  processTime() {
    const now = new Date();
    //尚未开始
    if (this._startTime > now) {
      this.timerLabel = "离活动开始还有";
      this.compareTime = this._startTime;
      this.start();
    }
    //已开始尚未结束
    else if (this._endTime > now) {
      this.timerLabel = "火爆抢购中，离结束还有";
      this.compareTime = this._endTime;
      this.start();
    }
    //已结束
    else {
      this.timerLabel = "抢购已结束";
    }
  }

  /**
   * 处理时间，获取距离开始或结束剩余的天时分秒
   * @param compareTime 
   */
  private processCountDownTime(compareTime: Date) {
    const currentTime: Date = new Date();
    if (compareTime) {
      let days = moment(compareTime).diff(currentTime,"days");
      let hours = moment(compareTime).diff(currentTime,"hours")-days*24;
      let minutes = moment(compareTime).diff(currentTime,"minutes")-(days*24+hours)*60;
      let seconds = moment(compareTime).diff(currentTime,"seconds")-((days*24+hours)*60+minutes)*60;

      this.timeDay = days;
      this.timeHour = hours;
      this.timeMinute = minutes;
      this.timeSecond = seconds;

      if (days <= 0 && hours <= 0 && minutes <= 0 && seconds <= 0) {
        clearInterval(this.timer);
        this.timer = null;
        this.processTime();
        return;
      }
      
    }
  }

  private start() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.timer = setInterval(() => {
      this.processCountDownTime(this.compareTime);
    }, 1000);
  }

  /**
   * 查看指定商家，OK -- 按钮
   * @param mid 
   */
  goTo(mid) {
    this.navController.navigateForward('/info', {
      queryParams: {
        mid: mid,
        openid: this.userinfo ? this.userinfo.openid : ""
      }
    })
  }

  /**
   * 投诉，OK
   */
  complain() {
    this.navController.navigateForward('/complain', {
      queryParams: {
        openid: this.userinfo ? this.userinfo.openid : ""
      }
    })
  }
  /**
   * 提现 OK
   */
  withdraw() {
    this.navController.navigateForward('/withdraw', {
      queryParams: {
        openid: this.userinfo ? this.userinfo.openid : ""
      }
    })
  }

  share() {
    this.navController.navigateForward('/share', {
      queryParams: {
        openid: this.userinfo ? this.userinfo.openid : ""
      }
    })

    //this.navController.navigateForward('/share?openid='+this.userinfo.openid+'&invitation='+this.userinfo.invitation_code);
//     console.log("url", encodeURIComponent(window.location.href.split('#')[0]));
//     let response = await this.common.ajaxGet("weixin/js_config?url="+encodeURIComponent(window.location.href.split('#')[0]));
//     //let response = await this.common.ajaxGet("weixin/js_config?url="+window.location.href);
    
//     if (!response || response['status'].code == 0) {
//       //没有获取到配置，报错
//       super.presentFailureToast(this.toastController, response['status'].message);
//       return;
//     } 

//     let config = response['data'];

//     console.log("config",config);
//     window.wx.config({
//       debug: config.debug, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
//       appId: config.appId, // 必填，公众号的唯一标识
//       timestamp: config.timestamp, // 必填，生成签名的时间戳
//       nonceStr: config.nonceStr, // 必填，生成签名的随机串
//       signature: config.signature,// 必填，签名
//       jsApiList: config.jsApiList // 必填，需要使用的JS接口列表
//     });//通过config接口注入权限验证配置
// console.log("window.wx",window.wx);

//     window.wx.ready(function () {
//       // config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把相关接口放在ready函数中调用来确保正确执行。对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。

      
//       window.wx.updateAppMessageShareData({
//         title: '标题', // 分享标题
//         desc: '描述', // 分享描述
//         link: 'http://app.yihemall.cn/home', // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
//         imgUrl: 'assets/img/contact.jpg', // 分享图标
//         success: function () {
//           // 设置成功

// console.log("0000000");



//         }
//       });

//       window.wx.error(function (res) {
//         // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
//         alert("error")
//       });

//     });
  }

  sales() {
    this.navController.navigateForward('/sales-table', {
      queryParams: {
        openid: this.userinfo ? this.userinfo.openid : ""
      }
    })
  }

  coupon() {
    this.navController.navigateForward('/coupon-list', {
      queryParams: {
        openid: this.userinfo ? this.userinfo.openid : ""
      }
    })
  }

  /**
   * 联系客服
   */
  customerService() {
    this.navController.navigateForward('/customer-service', {
      queryParams: {
        openid: this.userinfo ? this.userinfo.openid : ""
      }
    })
  }
  /**
   * 申请加入联盟商家，OK
   */
  application() {
    this.navController.navigateForward('/application', {
      queryParams: {
        openid: this.userinfo ? this.userinfo.openid : ""
      }
    })
  }

  public isPlay = true;
  playAudio() {
    let audio_img = document.getElementById("audio_img");

    let audio = <HTMLAudioElement>document.getElementById('audio');//////</HTMLAudioElement>
    
    if(this.isPlay){
      this.isPlay = false;
      audio_img.setAttribute("src", "assets/img/musical-notes-mute.png");
      audio.pause();
    }else{
      this.isPlay = true;
      audio_img.setAttribute("src","assets/img/musical-notes.png");
      audio.play();
    }
  }

  /**
   * 两个途径获取福利券
   * @param type 
   */
  async presentAlertCollect(type) {
    
    if (!this.userinfo || !this.userinfo.openid) {
      super.presentFailureToast(this.toastController, "账号未经授权，请刷新页面后重试");
      return;
    }

    const alertCon = await this.alertController.create({
      backdropDismiss:false,
      header: '领取免单大礼包',
      message: '可通过微信支付直接购买领取，<br />或者通过输入激活码激活领取',
      inputs: [
        {
          name: 'radio1',
          type: 'radio',
          label: '微信支付购买',
          value: 'buy',
          checked: ("activate"!=type)
        },
        {
          name: 'radio2',
          type: 'radio',
          label: '激活码激活',
          value: 'activate',
          checked: ("activate"==type)
        }
      ],
      buttons: [
        {
          text: '取消',
          role: 'cancel',
          handler: () => {
            //console.log('Canceled');
          }
        }, {
          text: '下一步',
          handler: (data) => {
            if (data == 'buy') {
              this.presentAlertBuy();
            } else {
              this.presentAlertActivate();
            }
            
          }
        }
      ]
    });

    await alertCon.present();
  }

  /**
   * 微信支付购买
   */
  async presentAlertBuy() {
    let salt = this.userinfo.salt;
    //let salt = "5203344";
    if (!salt) {
      super.presentFailureToast(this.toastController, "账号未经授权，请刷新页面后重试");
      return;
    }
    
    //await this.refreshUser(10); 

    // let old_name = this.userinfo.name ? this.userinfo.name : "";
    // let old_mobilephone = this.userinfo.mobilephone ? this.userinfo.mobilephone : "";

    // console.log("old_userinfo", this.userinfo);
    // console.log("old_name", old_name);
    // console.log("old_mobilephone", old_mobilephone);
    const alertCon = await this.alertController.create({
      backdropDismiss:false,
      header: '购买免单大礼包',
      message: '仅需支付'+this.common.config.price+'元<br />即可获得价值2万多元的免单大礼包<br />名单中所有商家的福利券全部自动激活<br />有效期内所有商家均可享受免单服务<br />不限本人使用，不限、不限、不限',
      inputs: [
        {
          name: 'name',
          type: 'text',
          value: this.userinfo.name,
          placeholder: '请输入真实姓名'
        },
        {
          name: 'mobilephone',
          type: 'number',
          value: this.userinfo.mobilephone,
          placeholder: '请输入手机号码'
        }
      ],
      buttons: [
        {
          text: '上一步',
          //role: 'cancel',
          handler: () => {
            //console.log('Canceled');
            this.presentAlertCollect("buy");
          }
        }, {
          text: '购买',
          handler: (data) => {
            //console.log(data);
            let name = data.name.trim();
            let mobilephone = data.mobilephone;

            this.userinfo.name = name;
            this.userinfo.mobilephone = mobilephone;

            if (name.length < 2) {
              super.presentFailureToast(this.toastController, "请输入您的姓名");
              return false;
            }

            if ((""+mobilephone).length != 11 || !this.common.validateMobilephoneNum(mobilephone+"")) {
              super.presentFailureToast(this.toastController, "请输入正确的手机号码");
              return false;
            }

            let sign = this.common.sign({
              openid: this.userinfo.openid,
              name: name,
              mobilephone: mobilephone,
              salt: salt
            });

            let order = {
              openid: this.userinfo.openid,
              name: name,
              mobilephone: mobilephone,
              sign: sign
            }

            //console.log("sign",sign);
            
            //充服务器端调取并拼装订单信息//公众号支付
            this.common.ajaxPost("weixin/mp_pay", order).then(async (response: any) => {
              console.log(response);
              if (response && response.status.code == 1) {
                let payInfo = response.data;
                //console.log(payInfo);

                if (typeof window.WeixinJSBridge == "undefined") {
                  if (document.addEventListener) {
                    document.addEventListener('WeixinJSBridgeReady', this.onBridgeReady, false);
                  } else if (window.document.attachEvent) {
                    window.document.attachEvent('WeixinJSBridgeReady', this.onBridgeReady);
                    window.document.attachEvent('onWeixinJSBridgeReady', this.onBridgeReady);
                  }
                } else {
                  await this.onBridgeReady(payInfo);//调取支付操作
                }
          
              } else {
                super.presentFailureToast(this.toastController, response.status.message);
              }
            }).catch(error => {
              console.log("1");
              //console.log("状态异常，支付失败");
              console.log(error);
              super.presentFailureToast(this.toastController, "状态异常，支付失败");
            });
          }
        }
      ]
    });

    await alertCon.present();
    
  }

  /**
   * 验证码激活
   */
  async presentAlertActivate() {

    let salt = this.userinfo.salt;
    //let salt = "5203344";
    if (!salt) {
      super.presentFailureToast(this.toastController, "账号未经授权，请刷新页面后重试");
      return;
    }

    //await this.refreshUser(10); 

    let old_name = this.userinfo.name ? this.userinfo.name : "";
    let old_mobilephone = this.userinfo.mobilephone ? this.userinfo.mobilephone : 0;

    // console.log("old_userinfo", this.userinfo);
    // console.log("old_name", old_name);
    // console.log("old_mobilephone", old_mobilephone);

    const alertCon = await this.alertController.create({
      backdropDismiss:false,
      header: '激活免单大礼包',
      message: '激活码验证通过后<br />即可获得价值2万多元的免单大礼包<br />名单中所有商家的福利券全部自动激活<br />有效期内所有商家均可享受免单服务<br />不限本人使用，不限、不限、不限',
      inputs: [
        {
          name: 'name',
          type: 'text',
          value: this.userinfo.name,
          placeholder: '请输入真实姓名'
        },
        {
          name: 'mobilephone',
          type: 'number',
          value: this.userinfo.mobilephone,
          placeholder: '请输入手机号码'
        },
        {
          name: 'code',
          type: 'text',
          value: '',
          placeholder: '请输入有效激活码'
        }
      ],
      buttons: [
        {
          text: '上一步',
          //role: 'cancel',
          handler: () => {
            //console.log('Canceled');
            this.presentAlertCollect("activate");
          }
        }, {
          text: '激活',
          handler: (data) => {
            //console.log(data);
            console.log(data);
            let name = data.name.trim();
            let mobilephone = data.mobilephone; 
            let code = data.code.trim();

            this.userinfo.name = name;
            this.userinfo.mobilephone = mobilephone;

            if (name.length < 2) {
              super.presentFailureToast(this.toastController, "请输入您的姓名");
              return false;
            }

            if ((""+mobilephone).length != 11 || !this.common.validateMobilephoneNum(mobilephone+"")) {
              super.presentFailureToast(this.toastController, "请输入正确的手机号码");
              return false;
            }

            if (code.length != 6) {
              super.presentFailureToast(this.toastController, "请输入6位激活码");
              return false;
            }

            let sign = this.common.sign({
              openid: this.userinfo.openid,
              mobilephone: mobilephone,
              name: name,
              code: code,
              salt: salt
            });

            let post = {
              openid: this.userinfo.openid,
              mobilephone: mobilephone,
              name: name,
              code: code,
              sign: sign
            }

            //console.log("sign", sign);
                                    
            //
            this.common.ajaxPost("user/activation", post).then(async (response: any) => {
              if (response && response['status'].code == 1) {
                this.userinfo = response['data'];
                this.storage.set("userinfo_" + this.userinfo.openid, this.userinfo);
                //console.log(userinfo);
                //刷新用户

                super.presentToast(this.toastController, response['status'].message);

              } else {
                super.presentFailureToast(this.toastController, response['status'].message);
                this.presentAlertActivate();
                return false;
              }

            });
          }
        }
      ]
    });

    await alertCon.present();
  }

  //微信内置浏览器的支付
  onBridgeReady(payInfo){
    window.WeixinJSBridge.invoke(
      'getBrandWCPayRequest', {
         "appId":payInfo.appId,  //公众号名称，由商户传入     
         "timeStamp":payInfo.timeStamp,         //时间戳，自1970年以来的秒数     
         "nonceStr":payInfo.nonceStr, //随机串     
         "package":payInfo.package,     
         "signType":payInfo.signType,         //微信签名方式：     
         "paySign":payInfo.paySign //微信签名 
      }, (res)=>{
      if(res.err_msg == "get_brand_wcpay_request:ok" ){
      // 使用以上方式判断前端返回,微信团队郑重提示：
            //res.err_msg将在用户支付成功后返回ok，但并不保证它绝对可靠。
        //刷新userinfo
        this.refreshUser(3000);       
        
      } else if (res.err_msg == "get_brand_wcpay_request:fail") {

        super.presentFailureToast(this.toastController, "支付失败，请重试。");
      } else {
        //支付失败

      } 
   }); 
  }

  /**
   * 延时3秒刷新用户信息
   */
  async refreshUser(interval) {
    let salt = this.userinfo.salt;
    //let salt = "5203344";
    if (!this.userinfo.openid || this.userinfo.openid.trim() == "" || !salt || salt.trim() == "") {
      super.presentFailureToast(this.toastController, "账号未经授权，请刷新页面后重试");
      return;
    }

    setTimeout(async () => {
      let result = await this.userDao.getUserInfo(this.userinfo.openid, salt);
      if (result.status == 1) {
        //console.log("refreshUser OK");        
        this.userinfo = result.data;
        this.storage.set("userinfo_" + this.userinfo.openid, this.userinfo);
      } else {
        super.presentFailureToast(this.toastController, result.message);
      }
    }, interval);
  }

  /**
   * 更新用户信息
   * @param tag 字段、标签
   * @param info {} 新的值，用JSON表述
   */
  async updateUser(info) {

    if (!info){
      super.presentFailureToast(this.toastController, "无可修改的信息");
      return;
    }

    let salt = this.userinfo.salt;
    //let salt = "5203344";
    if (!this.userinfo.openid || this.userinfo.openid.trim() == "" || !salt || salt.trim() == "") {
      super.presentFailureToast(this.toastController, "账号未经授权，请刷新页面后重试");
      return;
    }

    let sign = this.common.sign({
      openid: this.userinfo.openid,
      info: JSON.stringify(info),
      salt: salt
    })

    let post = {
      openid: this.userinfo.openid,
      info: JSON.stringify(info),
      sign: sign
    }

    let api = "user/info";
    this.common.ajaxPost(api, post).then(async (response: any) => {
      if (response && response.status.code == 1) {
        this.userinfo = response.data; //更新用户信息
        this.storage.set("userinfo_" + this.userinfo.openid, this.userinfo);
      } else {
        super.presentFailureToast(this.toastController, response.status.message);
      }
    });

  }

  /**
   * 展开和折叠优惠券
   * @param mid 
   * @param num 
   */
  expand_fold(mid, num) {

    if(num<3) return;//3个以下，不操作展开和折叠

    if (document.getElementById("m_" + mid + "_up").style.display == "none") {//展开
       document.getElementById("m_" + mid + "_up").style.display = "block";
      document.getElementById("m_" + mid + "_down").style.display = "none";

      document.getElementById("m_" + mid + "_c_" + 1).style.borderRadius = "0";//第二个下面直角
      document.getElementById("m_" + mid + "_c_" + (num-1)).style.borderRadius = "0 0 1rem 1rem";//最后一个下面半圆角度

      for (let i = 2; i < num; i++) {
        document.getElementById("m_" + mid + "_c_" + i).style.display = "block";
      }
    } else {//折叠
      document.getElementById("m_" + mid + "_up").style.display = "none";
      document.getElementById("m_" + mid + "_down").style.display = "block";
      document.getElementById("m_" + mid + "_c_" + 1).style.borderRadius = "0 0 1rem 1rem";//折叠后，第二个下面半圆角
      for (let i = 2; i < num; i++) {
        document.getElementById("m_" + mid + "_c_" + i).style.display = "none";
      }
    }
  }



}
