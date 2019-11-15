import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController,AlertController,ToastController } from '@ionic/angular';

import { CommonService } from '../../services/common.service';
import { StorageService } from '../../services/storage.service';
import { UserDaoService } from '../../services/user.dao.services';
import { BaseUI } from '../../component/baseui';

@Component({
  selector: 'app-withdraw',
  templateUrl: './withdraw.page.html',
  styleUrls: ['./withdraw.page.scss'],
})
export class WithdrawPage extends BaseUI implements OnInit {

  public withdrawMoney;
  public userinfo: any = {
    openid: "",
    balance: {
      bonus: 0,
      withdrawing: 0,
      withdrawals: 0
    },
    account: { //提现的账户信息
      account_type: '支付宝账户',
      account_number: "",
      account_name: ""
    },
  };

  constructor(
    public common: CommonService,
    public storage: StorageService,
    public userDao: UserDaoService,
    public activatedRoute: ActivatedRoute,
    public navController: NavController,
    public alertController: AlertController,
    public toastController: ToastController,
  ) {
    super();
  }

  async ngOnInit() {
    this.activatedRoute.queryParams.subscribe((data: any) => {    
    	this.userinfo.openid=data.openid;
    });

    //let salt = this.storage.get("salt_" + this.userinfo.openid);
    let salt = "5203344";
    let result = await this.userDao.getUserInfo(this.userinfo.openid, salt);
    if (result.status == 1) {
      this.userinfo = result.data;
    } else {
      super.presentFailureToast(this.toastController, result.message);
    }

    //console.log("userinfo",this.userinfo);
  }

    /**
   * 支付宝账号
   */
  async presentAlertAlipay() {
    let old_account_name="";
    let old_number="";
    if (this.userinfo.account) {
      old_account_name = this.userinfo.account.account_name;
      old_number = this.userinfo.account.account_number;
    }

    const alertCon = await this.alertController.create({
      backdropDismiss:false,
      header: '修改提现账户信息',
      message: '支付宝账户',
      inputs: [
        {
          name: 'account_name',
          type: 'text',
          value: old_account_name,
          placeholder: '请输入支付宝户名'
        },
        {
          name: 'number',
          type: 'text',
          value: old_number,
          placeholder: '请输入支付宝账号'
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
          text: '保存',
          handler: async (data) => {
            let account_name = (data.account_name).trim();
            let account_number = (data.number).trim();
            if(account_name=="" || account_number==""){
              super.presentFailureToast(this.toastController, "请输入完整的户名和账号");
              return false;
            }

            let res = await this.modifyAlipay(account_name, account_number);
            if (res.status == 1) {
              super.presentToast(this.toastController, res.message);
              this.userinfo = res.data;
            } else {
              super.presentFailureToast(this.toastController, res.message);
              return false;
            }

          }
        }
      ]
    });

    await alertCon.present();
  }

  /**
   * 提现对话框
   */
  async withdraw() {

    if(this.withdrawMoney < this.common.config.withdraw_threshold){
      super.presentFailureToast(this.toastController, "提现金额不得低于"+this.common.config.withdraw_threshold+"元");
      return;
    }

    if(this.withdrawMoney > this.userinfo.balance.bonus){
      super.presentFailureToast(this.toastController, "不得超过可提现的金额");
      return;
    }

    if (!this.userinfo.account.account_name || !this.userinfo.account.account_number) {
      super.presentFailureToast(this.toastController, "提现账户信息不完整，请先填写完整再提现");
      return;
    }

    //let salt = this.storage.get("salt_" + this.userinfo.openid);
    let salt = "5203344";
    if (!this.userinfo.openid || this.userinfo.openid.trim() == "" || !salt || salt.trim() == "") {
      super.presentFailureToast(this.toastController, "账号未经授权，请返回主页面后重试");
      return;
    }

    let sign = this.common.sign({
      openid: this.userinfo.openid,
      amount: this.withdrawMoney,
      salt: salt
    })

    let post = {
      openid: this.userinfo.openid,
      amount: this.withdrawMoney,
      sign: sign
    }

    let api = "user/withdraw";
    this.common.ajaxPost(api, post).then(async (response: any) => {
      if (response && response.status.code == 1) {
        super.presentToast(this.toastController, "已申请提现，24小时内到账");
        this.userinfo = response.data;
        this.withdrawMoney='';
      } else {
        super.presentFailureToast(this.toastController, response.status.message);
      }
    });

  }

  

  /**
   * 修改支付宝账号信息，提现入账的信息
   * @param account_name 
   * @param account_number 
   */
  async modifyAlipay(account_name, account_number) {
    if (!account_name || !account_number || account_name.trim() == "" || account_number.trim() == "") {
      return {status: 0, message:"请输入账户信息"};
    }

    //let salt = this.storage.get("salt_" + this.userinfo.openid);
    let salt = "5203344";
    if (!this.userinfo.openid || this.userinfo.openid.trim()=="" || !salt || salt.trim() == "") {
      return {status: 0, message:"账号未经授权，请返回主页面后重试"};
    }

    let sign = this.common.sign({
      openid: this.userinfo.openid,
      account_name: account_name.trim(),
      account_number: account_number.trim(),
      salt: salt
    })

    //console.log("sign",sign);
    
    let post = {
      openid: this.userinfo.openid,
      account_name: account_name.trim(),
      account_number: account_number.trim(),
      sign:sign
    }

    let api = "user/alipay_info";

    let response = await this.common.ajaxPost(api, post);
    //console.log("response: ", response);
    if (response && response['status'].code == 1) {
      //console.log("userinfo", response['data']);
      return { status: 1, message: "提现账户信息修改成功", data: response['data'] };
    } else {
      return { status: 0, message: response['status'].message };
    }
    
  }


  goBack(){
    this.navController.navigateBack('/home?openid='+this.userinfo.openid);
  }

}
