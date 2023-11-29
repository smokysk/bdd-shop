import {Component, OnInit, Injector} from '@angular/core';
import {Product} from "../../../models/account/product";
import {ProductServiceService} from "../product-service.service";


@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent implements OnInit {

  products: Product[] = [];

  constructor(private productService: ProductServiceService) {
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getAllProducts().subscribe((products: Product[]) => {
      this.products = products;
    });
  }


}
