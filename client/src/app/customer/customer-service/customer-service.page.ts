import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-customer-service',
  templateUrl: './customer-service.page.html',
  styleUrls: ['./customer-service.page.scss'],
})
export class CustomerServicePage implements OnInit {

  public openid: any;

  constructor(
    public navController: NavController,
    public activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe((data: any) => {    
    	this.openid=data.openid;
    });
  }

  goBack(){
    this.navController.navigateBack('/home?openid='+this.openid);
  }

}
