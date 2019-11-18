import { Component, OnInit } from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { NavController, ActionSheetController, ToastController } from '@ionic/angular';

import { BaseUI } from '../../component/baseui';
import { CommonService } from '../../services/common.service';

declare const window: any;

@Component({
  selector: 'app-share',
  templateUrl: './share.page.html',
  styleUrls: ['./share.page.scss'],
})
export class SharePage extends BaseUI implements OnInit {

  public openid: any;
  public invitation_code: any;

  constructor(
    public common: CommonService,
    public navController: NavController,
    public toastController: ToastController,
    public activatedRoute: ActivatedRoute
  ) {
    super();
  }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe((data: any) => {    
    	this.openid=data.openid;
    });
  }

  async ionViewDidEnter() {
    console.log("url", encodeURIComponent(window.location.href.split('#')[0]));
    let response = await this.common.ajaxGet("weixin/js_config?url="+encodeURIComponent(window.location.href.split('#')[0]));
    
    if (!response || response['status'].code == 0) {
      //没有获取到配置，报错
      super.presentFailureToast(this.toastController, response['status'].message);
      return;
    } 

    let config = response['data'];

    console.log("config",config);
    window.wx.config({
      debug: config.debug, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
      appId: config.appId, // 必填，公众号的唯一标识
      timestamp: config.timestamp, // 必填，生成签名的时间戳
      nonceStr: config.nonceStr, // 必填，生成签名的随机串
      signature: config.signature,// 必填，签名
      jsApiList: config.jsApiList // 必填，需要使用的JS接口列表
    });//通过config接口注入权限验证配置
console.log("window.wx",window.wx);
    window.wx.ready(function () {
      // config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把相关接口放在ready函数中调用来确保正确执行。对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。
      
      window.wx.onMenuShareTimeline({
        title: '标题', // 分享标题
        desc: '描述', // 分享描述
        link: 'http://www.yihemall.cn', // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
        imgUrl: 'assets/img/contact.jpg', // 分享图标
        success: function () {
          // 设置成功
          alert("ok")
        }
      });

      window.wx.error(function (res) {
        // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
        alert("error")
      });

    });
    
  }

  reload(){

  	if(window.location.href.indexOf("#reloaded")==-1){
        window.location.href=this.common.config.app_domain+'share?openid='+this.openid+'&invitation_code='+this.invitation_code+"#reloaded";
        window.location.reload();
    }

  }



  goBack(){
    this.navController.navigateBack('/home?openid='+this.openid);
  }

}

