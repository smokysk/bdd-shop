import {NgModule} from '@angular/core';
import {BrowserModule, provideClientHydration} from '@angular/platform-browser';
import {MatCardModule} from '@angular/material/card';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {LoginComponent} from './components/login/login.component';
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {AuthService} from "./services/auth.service";
import {HttpClientModule} from "@angular/common/http";
import {AppVariables} from "./app.variables";
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {ReactiveFormsModule} from "@angular/forms";
import {ProductsComponent} from "./components/products/products/products.component";
import {AppGuard} from "./app.guard";

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    HttpClientModule,
    NoopAnimationsModule,
    ReactiveFormsModule
  ],
  providers: [
    provideClientHydration(),
    AuthService,
    AppVariables,
    AppGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
