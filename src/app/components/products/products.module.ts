import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ProductsComponent} from './products/products.component';
import {ROUTES} from "./products.route";
import {RouterModule} from "@angular/router";


@NgModule({
  declarations: [
    ProductsComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(ROUTES),
  ]
})
export class ProductsModule {
}
