import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {LoginComponent} from "./components/login/login.component";
import {AppGuard} from "./app.guard";

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {path: "login", component: LoginComponent},
  {path: "products", loadChildren: () => import("./components/products/products.module").then(p => p.ProductsModule), canLoad: [AppGuard]},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

}
