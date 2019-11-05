import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  public config: any = {

    //domain: 'http://localhost:8800/',
    app_domain:"http://app.yihemall.cn/",
    server_domain: "http://jnserver.yihemall.cn/",
    img_domain: "http://products.yihemall.cn/",

    weixin_mp_app_id: "wxde4393c66d04cfd0",
  }

  constructor(public http: HttpClient) { }
}
