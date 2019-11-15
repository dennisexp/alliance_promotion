import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, PopoverController, AlertController, ToastController } from '@ionic/angular';

import { CustomerServiceComponent } from '../component/customer-service/customer-service.component';
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

  public userinfo: any = {
    openid: "osGnz081kpGgyULuJQicl_SwpPr4",
  };

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

  private _endTime: Date = new Date('2019/12/15 23:59:59');
  //private _endTime: Date = new Date('2019-11-09 21:26:15');
  private _startTime: Date = new Date('2019/11/16 00:00:00');
  //private _startTime: Date = new Date('2019-11-09 21:26:00');
  
  constructor(
    public common: CommonService,
    public storage: StorageService,
    public userDao: UserDaoService,
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
    
    this.activatedRoute.queryParams.subscribe((data: any) => {
      //console.log("data: ", data);
      // let d = moment(new Date()).format();
      // console.log("date", d);
      if (data && data.code) {
        code = data.code;
      }
    });

    code = "021sIgA41MC5pT1p1Nz415SvA41sIgAg";
    return;

    //公众号验证，获得code，进而获得openid
    //如果code为空，则获取code
    if (!code || code.trim() == "") {
      let api = "weixin/authorizeURL?redirect_uri=" + encodeURIComponent(this.common.config.app_domain + "/home");
      this.common.ajaxGet(api).then((response:any)=>{
        console.log("response",response);
        if (response && response.status.code==1) {
          //window.open(response.data);
          console.log('打开url',response.data);
        } else {
          alert("无法获得微信的验证url，请重试。");
        }
      })
      //如果code已经获取，那么获取openid以及用户的信息等
    } else {
      let api = "weixin/userinfo?code=" + code;
      this.common.ajaxGet(api).then((response:any)=>{
        console.log("response: ",response);
        if (response && response.status.code == 1) {
          this.userinfo = response.data[0];//获得用户信息
          this.storage.set("salt_" + this.userinfo.openid, this.userinfo.salt);
          this.userinfo.salt = "";//删除敏感数据
          console.log("userinfo",this.userinfo);
        } else {
          super.presentFailureToast(this.toastController, "无法获得微信用户的信息，请重试");
        }
      })
      
    }
    
  }

  ionViewDidEnter() {
    this.processTime();
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
   * 头上
   */
  complain() {
    this.navController.navigateForward('/complain?openid='+this.userinfo.openid);
  }

  withdraw() {
    this.navController.navigateForward('/withdraw?openid='+this.userinfo.openid);
  }

  share() {
    this.navController.navigateForward('/share?openid='+this.userinfo.openid);
  }

  sales() {
    this.navController.navigateForward('/sales-table?openid='+this.userinfo.openid);
  }

  coupon() {
    this.navController.navigateForward('/coupon-list?openid='+this.userinfo.openid);
  }

  application() {
    this.navController.navigateForward('/application?openid='+this.userinfo.openid);
  }

  buy() {
    
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
   * 联系客服
   * @param ev 
   */
  async presentPopover(ev: any) {
    const popover = await this.popoverController.create({
      component: CustomerServiceComponent,
      event: ev,
      translucent: true
    });
    return await popover.present();
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
    //let salt = this.storage.get("salt_" + this.userinfo.openid);
    let salt = "5203344";
    if (!salt) {
      super.presentFailureToast(this.toastController, "账号未经授权，请刷新页面后重试");
      return;
    }
    
    //await this.refreshUser(10); 

    let old_name = this.userinfo.name ? this.userinfo.name : "";
    let old_mobilephone = this.userinfo.name ? this.userinfo.mobilephone : "";

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
          value: old_name,
          placeholder: '请输入真实姓名'
        },
        {
          name: 'mobilephone',
          type: 'number',
          value: old_mobilephone,
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

            if (mobilephone.length != 11 || !this.common.validateMobilephoneNum(mobilephone)) {
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
                super.presentFailureToast(this.toastController, "支付失败");
              }
            }).catch(error => {
              //console.log("1");
              //console.log("状态异常，支付失败");
              //console.log(error);
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

    //let salt = this.storage.get("salt_" + this.userinfo.openid);
    let salt = "5203344";
    if (!salt) {
      super.presentFailureToast(this.toastController, "账号未经授权，请刷新页面后重试");
      return;
    }

    //await this.refreshUser(10); 

    let old_name = this.userinfo.name ? this.userinfo.name : "";
    let old_mobilephone = this.userinfo.name ? this.userinfo.mobilephone : "";

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
          value: old_name,
          placeholder: '请输入真实姓名'
        },
        {
          name: 'mobilephone',
          type: 'number',
          value: old_mobilephone,
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
            //console.log(data);
            let name = data.name.trim();
            let mobilephone = data.mobilephone; 
            let code = data.code.trim();

            this.userinfo.name = name;
            this.userinfo.mobilephone = mobilephone;

            if (name.length < 2) {
              super.presentFailureToast(this.toastController, "请输入您的姓名");
              return false;
            }

            if (mobilephone.length != 11 || !this.common.validateMobilephoneNum(mobilephone)) {
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
                                    
            //充服务器端调取并拼装订单信息//公众号支付
            this.common.ajaxPost("user/activation", post).then(async (response: any) => {
              if (response && response['status'].code == 1) {
                this.userinfo = response['data'];
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
    //let salt = this.storage.get("salt_" + this.userinfo.openid);
    let salt = "5203344";
    if (!this.userinfo.openid || this.userinfo.openid.trim() == "" || !salt || salt.trim() == "") {
      super.presentFailureToast(this.toastController, "账号未经授权，请刷新页面后重试");
      return;
    }

    setTimeout(async () => {
      let result = await this.userDao.getUserInfo(this.userinfo.openid, salt);
      if (result.status == 1) {
        //console.log("refreshUser OK");        
        this.userinfo = result.data;
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

    //let salt = this.storage.get("salt_" + this.userinfo.openid);
    let salt = "5203344";
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
      } else {
        super.presentFailureToast(this.toastController, response.status.message);
      }
    });

  }



}
