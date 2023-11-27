import {Routes} from "@angular/router";
import {AppGuard} from "../../app.guard";
import {ProductsComponent} from "./products/products.component";


export const ROUTES: Routes = [
  {path: "home", component: ProductsComponent, canActivate: [AppGuard], canDeactivate: [AppGuard]},
];
