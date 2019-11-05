import { Component } from '@angular/core';


import { CommonService } from '../services/common.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(public common: CommonService,) { }
  
  ngOnInit() {

    //公众号验证，获得code，进而获得openid
    let url = "https://open.weixin.qq.com/connect/oauth2/authorize?"
      + "appid=" + this.common.config.weixin_mp_app_id
      + "&redirect_uri=" + encodeURIComponent(this.common.config.app_domain + "/home")
      + "&response_type=code"
      + "&scope=snsapi_userinfo"
      + "&state=STATE"
      + "#wechat_redirect";
        
    console.log(url);
    window.open(url);
    
  }

}
