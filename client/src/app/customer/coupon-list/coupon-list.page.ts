import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, AlertController, ToastController } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';

import { BaseUI } from '../../component/baseui';
import { CommonService } from '../../services/common.service';
import { StorageService } from '../../services/storage.service';
import { UserDaoService } from '../../services/user.dao.services';

@Component({
  selector: 'app-coupon-list',
  templateUrl: './coupon-list.page.html',
  styleUrls: ['./coupon-list.page.scss'],
})
export class CouponListPage extends BaseUI implements OnInit {

  public tab: string = "available";
  public openid: string = "";
  public userinfo: any;
  public availableCouponList: any = [];
  public usedCouponList: any = [];

  public bgCss = [
    this.sanitizer.bypassSecurityTrustStyle(`url(http://app.yihemall.cn/assets/img/merchant00.png) 0% 0% / 100% 100%`),
    this.sanitizer.bypassSecurityTrustStyle(`url(http://app.yihemall.cn/assets/img/merchant10.png) 0% 0% / 100% 100%`),
    this.sanitizer.bypassSecurityTrustStyle(`url(http://app.yihemall.cn/assets/img/merchant20.png) 0% 0% / 100% 100%`),
  ];

  public border = this.sanitizer.bypassSecurityTrustStyle(`border-radius: 0 0 1rem 1rem;`);

  constructor(
    public common: CommonService,
    public navController: NavController,
    public toastController: ToastController,
    public alertController: AlertController,
    public activatedRoute: ActivatedRoute,
    public storage: StorageService,
    public sanitizer: DomSanitizer,
    public userDao: UserDaoService
  ) {
    super();
  }

  async ngOnInit() {
    this.activatedRoute.queryParams.subscribe((data: any) => {    
    	this.openid=data.openid;
    });

    this.userinfo = this.storage.get("userinfo_" + this.openid);

    let result = await this.userDao.getCoupons(this.userinfo.openid, this.userinfo.salt);
    if (result.status == 1) {
      this.availableCouponList = result.data.availableCouponList;
      this.usedCouponList = result.data.usedCouponList;
    } else {
      super.presentFailureToast(this.toastController, result.message);
    }

    console.log("availableCouponList", this.availableCouponList);
    console.log("usedCouponList",this.usedCouponList);
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
   * 使用指定商户下的福利券
   * @param mid 
   * @param coupon_id 
   * @param coupon_label
   */
  async presentUse(mid, coupon_id, coupon_label) {
    console.log("goto use", mid, coupon_id, coupon_label)
    let salt = this.userinfo.salt;
    if (!this.userinfo.openid || this.userinfo.openid.trim() == "" || !salt || salt.trim() == "") {
      super.presentFailureToast(this.toastController, "账号未经授权，请刷新页面后重试");
      return;
    }

    const alertCon = await this.alertController.create({
      backdropDismiss:false,
      header: '使用福利券',
      inputs: [
        {
          name: 'amount',
          type: 'number',
          placeholder: '请输入本次实际买单的金额'
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
          text: '确定',
          handler: async (data) => {
            let amount = data.amount;
            if(amount=="" || amount<0){
              super.presentFailureToast(this.toastController, "请输入实际买单金额，如免单，则输入0");
              return false;
            }

            let sign = this.common.sign({
              openid: this.userinfo.openid,
              mid: mid,
              coupon_id: coupon_id,
              coupon_label: coupon_label,
              amount: amount,
              salt: salt
            })

            //console.log("sign",sign);
            
            let post = {
              openid: this.userinfo.openid,
              amount: amount,
              mid: mid,
              coupon_id: coupon_id,
              coupon_label: coupon_label,
              sign:sign
            }

            let api = "user/usage";

            let response = await this.common.ajaxPost(api, post);
            //console.log("response: ", response);
            if (response && response['status'].code == 1) {
              //console.log("userinfo", response['data']);
              super.presentToast(this.toastController, "福利券已经发送给商家");
              this.availableCouponList = response['data'].availableCouponList;
              this.usedCouponList = response['data'].usedCouponList;
            } else {
              super.presentFailureToast(this.toastController, response['status'].message);
              return false;
            }
          }
        }
      ]
    });

    await alertCon.present();
  }



  goBack(){
    this.navController.navigateBack('/home?openid='+this.openid);
  }

}
