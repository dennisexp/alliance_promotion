import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-sales-table',
  templateUrl: './sales-table.page.html',
  styleUrls: ['./sales-table.page.scss'],
})
export class SalesTablePage implements OnInit {

  constructor(public navController: NavController) { }

  ngOnInit() {
  }


  goBack(){
    this.navController.navigateBack('/home');
  }

}


