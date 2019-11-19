import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { CommonService } from '../../services/common.service';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-info',
  templateUrl: './info.page.html',
  styleUrls: ['./info.page.scss'],
})
export class InfoPage implements OnInit {

  @ViewChild('slide1', {static:true}) slide1;

  public openid: any;
  public merchant: any = {};
  public userinfo: any = {};

  //轮播图的属性
  public slidesOpts={
    speed:500,
    autoplay: {
      delay: 2000,
    },
    loop:true
  }

  public border = this.sanitizer.bypassSecurityTrustStyle(`border-radius: 0 0 1rem 1rem;`);

  constructor(
    public common: CommonService,
    public storage: StorageService,
    public sanitizer:DomSanitizer,
    public activatedRoute: ActivatedRoute,
    public navController: NavController,
  ) { }

  async ngOnInit() {
    this.activatedRoute.queryParams.subscribe((data: any) => {    
      this.openid = data.openid;
      this.merchant.mid = data.mid
    });

    let response = await this.common.ajaxGet("merchant/info?mid=" + this.merchant.mid);
    
    if (response && response['status'].code == 1) {
      this.merchant = response['data'];
    } 

    this.userinfo = this.storage.get("userinfo_" + this.openid);

  }

  ionViewDidEnter() {
  	document.getElementById("regulation").innerHTML = this.merchant.regulation
  }

  //手动滑动完成
  slideTouchEnd(){
      this.slide1.startAutoplay();
  }


  goBack(){
    this.navController.navigateBack('/home?openid='+this.openid);
  }

}