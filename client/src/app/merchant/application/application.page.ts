import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, ActionSheetController, ToastController } from '@ionic/angular';

import { BaseUI } from '../../component/baseui';
import { CommonService } from '../../services/common.service';

@Component({
  selector: 'app-application',
  templateUrl: './application.page.html',
  styleUrls: ['./application.page.scss'],
})
export class ApplicationPage extends BaseUI implements OnInit {

  public merchant: any = {
    openid: '',
    name: '',
    mobilephone: '',
    catalog: '',
    business_name: '',
    address: '',
	};

  constructor(
    public common: CommonService,
    public navController: NavController,
    public actionSheetController: ActionSheetController,
    public toastController: ToastController,
    public activatedRoute: ActivatedRoute
  ) {
    super();
  }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe((data: any) => {    
    	this.merchant.openid=data.openid;
    });
  }

  /**
   * 递交申请信息
   */
  async apply() {
    //console.log("merchant",this.merchant);
    if (!this.merchant.name || this.merchant.name.trim() == "" || !this.merchant.mobilephone
      || !this.merchant.catalog || !this.merchant.business_name || this.merchant.business_name.trim() == ""
      || !this.merchant.address || this.merchant.address.trim() == "") {
      super.presentFailureToast(this.toastController, "请输入完整的申请信息");
      return;
    }

    if((""+this.merchant.mobilephone).length!=11 || !this.common.validateMobilephoneNum(+this.merchant.mobilephone)){
      super.presentFailureToast(this.toastController, "请输入有效的手机号码");
      return;
    }
    
    let api = "application";
    this.common.ajaxPost(api, this.merchant).then((response: any) => {
      if (response && response.status.code == 1) {
        super.presentToast(this.toastController, "申请提交成功");
        this.goBack();
      } else {
        super.presentFailureToast(this.toastController, "申请提交失败，请重试");
      }
    });

  }

  /**
   * 行业类别
   */
  public catalog = ['餐饮美食',"教育培训",'美容美发美体/健美健身/影楼',"休闲娱乐/酒吧KTV","珠宝首饰","汽车服务","装饰建材","其他"];
  async showCatalog() {
    let buttons = [];
    this.catalog.forEach(element => {
      buttons.push({
        text: element,
        handler: () => {
          this.merchant.catalog = element;
        }
      });
    });

    buttons.push({
      text: '取消',
      role: 'cancel',
      handler: () => {
        //console.log('Cancel clicked');
      }
    });

    const actionSheet = await this.actionSheetController.create({
      backdropDismiss: false,
      //header: '请选择行业类别',
      buttons: buttons
    });
    await actionSheet.present();
  }


  goBack(){
    this.navController.navigateBack('/home?openid='+this.merchant.openid);
  }

}

