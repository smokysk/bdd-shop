import {Component, OnInit, Injector} from '@angular/core';
import {BaseComponentDirective} from "../../base-component.directive";
import {Product} from "../../../models/account/product";
import {AuthService} from "../../../services/auth.service";
import {URLS} from "../../../app.urls";
import {takeUntil} from "rxjs/operators";

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent extends BaseComponentDirective<Product> implements OnInit {

  // @ts-ignore
  public injector: Injector;
  public listProducts: Product[] = [];

  constructor(
    injector: Injector,
    public authService: AuthService) {
    super(injector, {pk: "id", endpoint: URLS.PRODUCTS, searchOnInit: true});
    this.injector = injector;
  }

  override ngOnInit(callback?: () => void) {
    this.search();
  }

  createFormGroup(): void {
  }

  // @ts-ignore
  public displayedColumns = ["id", "name"];


  public override search(): void {
    console.log("entrou aqui");
    this.service.clearParameter();
    this.service.getFromListRoute("all_products")
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(response => {
        console.log(response)
      });
  }


}
