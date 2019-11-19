import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';

import { BaseUI } from '../../component/baseui';
import { CommonService } from '../../services/common.service';

@Component({
  selector: 'app-complain',
  templateUrl: './complain.page.html',
  styleUrls: ['./complain.page.scss'],
})
export class ComplainPage extends BaseUI implements OnInit {

  public openid: any;
  public complain_type: any;
  public content: any;
  public phone: any;

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

  goStep1() {
    document.getElementById("step2").style.display = "none";
    document.getElementById("step1").style.display = "block";
  }

  goStep2() {
    if (!this.complain_type) {
      super.presentFailureToast(this.toastController, "选择投诉原因");
      return;
    }

    document.getElementById("step1").style.display = "none";
    document.getElementById("step2").style.display = "block";
  }

  submit() {
    if (!this.complain_type) {
      super.presentFailureToast(this.toastController, "请选择投诉原因");
      return;
    }

    if (!this.content || this.content.trim() == "") {
      super.presentFailureToast(this.toastController, "请填写描述信息");
      return;
    }

    if (!this.phone) {
      super.presentFailureToast(this.toastController, "请填写手机号码");
      return;
    }

    console.log(this.phone);
    

    if((""+this.phone).length!=11 || !this.common.validateMobilephoneNum(this.phone)){
      super.presentFailureToast(this.toastController, "请填写有效的手机号码");
      return;
    }

    let api = "complain";
    this.common.ajaxPost(api, {
        openid: this.openid,
        complain_type: this.complain_type,
        content: this.content,
        phone: this.phone
    }).then((response: any) => {
      //if (response && response.status.code == 1) {
        super.presentToast(this.toastController, "投诉提交成功");
        this.goBack();
      //}
    });
  }

  goBack(){
    this.navController.navigateBack('/home?openid='+this.openid);
  }

}
