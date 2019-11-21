import { Component, OnInit } from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';

import { BaseUI } from '../../component/baseui';
import { CommonService } from '../../services/common.service';

@Component({
  selector: 'app-coupon-list',
  templateUrl: './coupon-list.page.html',
  styleUrls: ['./coupon-list.page.scss'],
})
export class CouponListPage extends BaseUI implements OnInit {

  public tab: string = "available";
  public openid: string = "";
  public availableCouponList: any = [];
  public usedCouponList: any = [];

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

  


  goBack(){
    this.navController.navigateBack('/home?openid='+this.openid);
  }

}
