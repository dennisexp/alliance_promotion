import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

//首先安装md5模块  cnpm install ts-md5 --save
import {Md5} from "ts-md5/dist/md5";

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  public config: any = {
    
    app_domain:"http://app.yihemall.cn/",
    server_domain: "http://jnserver.yihemall.cn/",
    //server_domain: 'http://localhost:8801/',
    //server_domain: 'http://192.168.2.138:8801/',
    img_domain: "http://products.yihemall.cn/",

    //weixin_mp_app_id: "wxde4393c66d04cfd0",

    withdraw_threshold: 30,
    price:193,
  }

  constructor(public http: HttpClient) { }


  ajaxGet(url:String) {

    var api = this.config.server_domain + url;
    //console.log("url: "+api);
    return new Promise((resove, reject) => {
      this.http.get(api).subscribe((response) => {
        resove(response);
      }, (error) => {
        reject(error);
      })
    })
  }

  ajaxPost(url:String, json:Object) {
    var api = this.config.server_domain + url;
    return new Promise((resove, reject) => {
      this.http.post(api, json).subscribe((response) => {
        resove(response);
      }, (error) => {
        reject(error);
      })
    })
  }

  sign(json){
    var tempArr=[];
    for(let attr in json){
      tempArr.push(attr);
    }

    tempArr=tempArr.sort();

    var tempStr='';

    for(let j=0;j<tempArr.length;j++){
      tempStr+=tempArr[j]+json[tempArr[j]]
    }

    console.log(tempStr);
    return Md5.hashStr(tempStr);
  }


  /**
   * 加密密码
   * @param  {[type]} data [description]
   * @return {[type]}      [description]
   */
  hashPwd(data){
    return Md5.hashStr(data);
  }

  /**
   * 固话验证
   * @param phone 
   */
  validateTelephoneNum(phone){
    let regExp = /^((0[1-9][0-9][1-9]{6,8})|(0[1-9][0-9]{2}[1-9]{6,8})|([1-9][0-9]{5,7}))$/;

    if(!regExp.test(phone)){
      //super.presentFailureToast(this.toastController, "固话错");
      return false;
    }
    return true;
  }

  /**
   * 手机号码验证
   * @param phone 
   */
  validateMobilephoneNum(phone){
    let regExp = /^1[0-9]{10}$/;
    if(!regExp.test(phone)){
      //super.presentFailureToast(this.toastController, "手机错");
      return false;
    }
    return true;
  }
}
