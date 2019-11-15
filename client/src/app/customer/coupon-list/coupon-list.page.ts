import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-coupon-list',
  templateUrl: './coupon-list.page.html',
  styleUrls: ['./coupon-list.page.scss'],
})
export class CouponListPage implements OnInit {

  constructor(public navController: NavController) { }

  ngOnInit() {
  }


  goBack(){
    this.navController.navigateBack('/home');
  }

}
