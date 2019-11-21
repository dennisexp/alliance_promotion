import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from './common.service';

@Injectable({
    providedIn: 'root'
})
export class UserDaoService {

    constructor(
        public http: HttpClient,
        public common: CommonService
    ) { }

  /**
   * 获得客户信息
   */
  async getUserInfo(openid, salt) {

    if (!openid || !salt) {
      return {status: 0, message:"账号未经授权，请返回主页面后重试"};
    }

    let sign = this.common.sign({
      openid: openid,
      salt: salt
    });

    let api = "user/info?openid=" + openid + "&sign=" + sign;
    
    let response = await this.common.ajaxGet(api);
    //console.log("response: ", response);
    if (response && response['status'].code == 1) {
      //console.log("userinfo", response['data']);
        return { status: 1, message: "OK", data: response['data'] };
    } else {
      return { status: 0, message: response['status'].message };
    }
  }

  /**
   * 获得客户优惠券信息
   */
  async getCoupons(openid, salt) {

    if (!openid || !salt) {
      return {status: 0, message:"账号未经授权，请返回主页面后重试"};
    }

    let sign = this.common.sign({
      openid: openid,
      salt: salt
    });

    let api = "user/coupons?openid=" + openid + "&sign=" + sign;
    
    let response = await this.common.ajaxGet(api);
    //console.log("response: ", response);
    if (response && response['status'].code == 1) {
      //console.log("userinfo", response['data']);
        return { status: 1, message: "OK", data: response['data'] };
    } else {
      return { status: 0, message: response['status'].message };
    }
  }


}