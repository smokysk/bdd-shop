import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ProductsComponent} from './products/products.component';
import {ROUTES} from "./products.route";
import {RouterModule} from "@angular/router";
import {MatCardModule} from "@angular/material/card";
import {MatTableModule} from "@angular/material/table";
import {MatPaginatorModule} from "@angular/material/paginator";
import {ProductServiceService} from "./product-service.service";


@NgModule({
  declarations: [
    ProductsComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(ROUTES),
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
  ],
  providers: [
    ProductServiceService
  ]
})
export class ProductsModule {
}
