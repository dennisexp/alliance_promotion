import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)},
  { path: 'coupon-list', loadChildren: './customer/coupon-list/coupon-list.module#CouponListPageModule' },
  { path: 'sales-table', loadChildren: './merchant/sales-table/sales-table.module#SalesTablePageModule' },
  { path: 'share', loadChildren: './customer/share/share.module#SharePageModule' },
  { path: 'application', loadChildren: './merchant/application/application.module#ApplicationPageModule' },
  { path: 'withdraw', loadChildren: './customer/withdraw/withdraw.module#WithdrawPageModule' },
  { path: 'complain', loadChildren: './customer/complain/complain.module#ComplainPageModule' },
  { path: 'info', loadChildren: './merchant/info/info.module#InfoPageModule' },
  { path: 'customer-service', loadChildren: './customer/customer-service/customer-service.module#CustomerServicePageModule' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
