import { Component, OnInit } from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { NavController, ActionSheetController, ToastController } from '@ionic/angular';

import { BaseUI } from '../../component/baseui';
import { CommonService } from '../../services/common.service';
import { StorageService } from '../../services/storage.service';

declare const window: any;

@Component({
  selector: 'app-share',
  templateUrl: './share.page.html',
  styleUrls: ['./share.page.scss'],
})
export class SharePage extends BaseUI implements OnInit {

  public openid: any;
  public userinfo: any = {};
  public invitation_code="0";

  constructor(
    public common: CommonService,
    public storage: StorageService,
    public navController: NavController,
    public toastController: ToastController,
    public activatedRoute: ActivatedRoute
  ) {
    super();
  }

  ngOnInit() {
    let invitation_code = "";
    this.activatedRoute.queryParams.subscribe((data: any) => {    
      this.openid = data.openid;
      invitation_code = data.invitation_code;
    });

    this.userinfo = this.storage.get("userinfo_" + this.openid);
    this.invitation_code = (this.userinfo && this.userinfo.invitation_code) ? this.userinfo.invitation_code : invitation_code;
    //console.log("this.invitation_code",this.invitation_code);

    this.reload();
  }

  async ionViewDidEnter() {
    let response = await this.common.ajaxGet("weixin/js_config?url="+encodeURIComponent(window.location.href.split('#')[0]));
    
    if (!response || response['status'].code == 0) {
      //没有获取到配置，报错
      super.presentFailureToast(this.toastController, response['status'].message);
    }

    let config = response['data'];

    //let link = this.common.config.app_domain+'home?invitation_code=' + this.invitation_code;      
    let link = this.common.config.app_domain+'share?invitation_code=' + this.invitation_code; 
    let imgUrl = this.common.config.app_domain+'assets/img/free.jpg';

    window.wx.config(config);

    window.wx.ready(function () {
      // config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把相关接口放在ready函数中调用来确保正确执行。对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。
      window.wx.updateAppMessageShareData({
        title: '一合优品免单狂欢节', // 分享标题
        desc: '济南市区40+商户，价值3万多元的免单大礼包，等您来抢啦。', // 分享描述
        link: link, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
        imgUrl: imgUrl,  // 分享图标
        success: function () {
          // 设置成功
          //alert("ok")
          //super.presentFailureToast(this.toastController, "无法获得微信用户的信息，请重试");
        }
      });

      window.wx.updateTimelineShareData({
        title: '一合优品免单狂欢节', // 分享标题
        link: link, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
        imgUrl: imgUrl, // 分享图标
        success: function () {
          // 设置成功
          //alert("okkk")
        }
      });

      window.wx.error(function (res) {
        // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
        //alert("error")
      });

    });
    
  }

  reload(){

  	if(window.location.href.indexOf("#reloaded")==-1){
        window.location=this.common.config.app_domain+'share?openid='+this.openid+'&invitation_code='+this.invitation_code+"#reloaded";
        //window.location.reload();
    }

  }



  goBack(){
    this.navController.navigateBack('/home?openid='+this.openid);
  }

}

