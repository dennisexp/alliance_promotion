import { Component, OnInit } from '@angular/core';
import { NavController, AlertController, ToastController } from '@ionic/angular';
import { BaseUI } from '../../component/baseui';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { CommonService } from '../../services/common.service';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-sales-table',
  templateUrl: './sales-table.page.html',
  styleUrls: ['./sales-table.page.scss'],
})
export class SalesTablePage extends BaseUI implements OnInit {

  public tab: string = "pending";
  public openid: any;
  public userinfo: any = {};
  public sales: any = {};

  public border = this.sanitizer.bypassSecurityTrustStyle(`border-bottom: 1px solid #ff6600;`);

  constructor(
    public common: CommonService,
    public storage: StorageService,
    public navController: NavController,
    public sanitizer: DomSanitizer,
    public alertController: AlertController,
    public toastController: ToastController,
    public activatedRoute: ActivatedRoute
  ) {
    super();
  }

  async ngOnInit() {
    this.activatedRoute.queryParams.subscribe((data: any) => {    
      this.openid = data.openid;
    });

    //this.openid = "osGnz081kpGgyULuJQicl_SwpPr4";

    this.userinfo = this.storage.get("userinfo_" + this.openid);

    // this.userinfo = {
    //   openid:this.openid,
    //   type: 2,
    //   mid: 5,
    //   salt:"8120fb4b05fa2fd2e18be671109dbecd"
    // };
    

    if (!this.userinfo || this.userinfo.type != 2 && !this.userinfo.mid) {
      super.presentFailureToast(this.toastController, "未经授权，请重试或联系客服");
      return;
    }

    let sign = this.common.sign({
      openid: this.openid,
      salt: this.userinfo.salt
    })

    let api = "merchant/sales?openid="+this.openid+"&sign="+sign;
    this.common.ajaxGet(api).then(async (response: any) => {
      if (response && response.status.code == 1) {
        this.sales = response.data;
        //console.log(this.sales);
        
      } else {
        //super.presentFailureToast(this.toastController, response.status.message);
      }
    });
  }

  /**
   * 核销或者退回福利券
   * @param usage_id 
   */
  async presentVerication(usage_id) {
    const alertCon = await this.alertController.create({
      //backdropDismiss:false,
      header: '审核福利券',
      buttons: [
        // {
        //   text: '取消',
        //   role: 'cancel',
        //   handler: () => {
        //     //console.log('Canceled');
        //   }
        // },
        {
          text: '退回给顾客',
          handler: () => {
            //console.log('退回');
            this.updateOrder(usage_id, -1);
          }
        },
        {
          text: '确认核销',
          handler: () => {
            //console.log('核销');
            this.updateOrder(usage_id, 1);
          }
        }
      ]
    });

    await alertCon.present();
  }

  /**
   * 更新福利券状态
   * @param usage_id 
   * @param status 1：核销，-1：退回
   */
  private updateOrder(usage_id, status) {
    let salt = this.userinfo.salt;
    if (!this.userinfo.openid || this.userinfo.openid.trim() == "" || !salt || salt.trim() == "") {
      super.presentFailureToast(this.toastController, "账号未经授权，请刷新页面后重试");
      return;
    }

    if (!usage_id || !status) {
      super.presentFailureToast(this.toastController, "福利券参数错误");
      return;
    }

    let sign = this.common.sign({
      openid: this.userinfo.openid,
      usage_id: usage_id,
      status: status,
      salt: salt
    })

    let post = {
      openid: this.userinfo.openid,
      usage_id: usage_id,
      status: status,
      sign:sign
    }

    let api = "merchant/sales";

    this.common.ajaxPost(api, post).then((response: any) => {
      //console.log("response: ", response);
      if (response && response['status'].code == 1) {
        //console.log("userinfo", response['data']);
        this.sales = response['data'];
        let message = (+status == 1) ? "已核销" : "已退回给顾客";
        super.presentToast(this.toastController, message);
      } else {
        super.presentFailureToast(this.toastController, response['status'].message);
      }
    });
  }


  goBack(){
    this.navController.navigateBack('/home?openid='+this.openid);
  }

}


