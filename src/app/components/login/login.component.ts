import {Component, OnInit} from '@angular/core';
import {User} from "../../models/account/user";
import {AuthService} from "../../services/auth.service";
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from "@angular/router";
import {take} from "rxjs";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {

  public formGroup: FormGroup;
  public url?: string;

  public ngOnInit() {
  }

  constructor(public authService: AuthService,
              private formBuilder: FormBuilder,
              public router: Router) {
    this.formGroup = this.formBuilder.group({
      username: ['', [Validators.required, Validators.maxLength(64)]],
      password: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(64)]]
    });
  }

  private get f() {
    return this.formGroup?.controls;
  }

  private get v() {
    return this.formGroup?.value;
  }

  public login(): void {
    const user = new User();
    user.username = this.v.username;
    user.password = this.v.password;
    this.authService.login(user)
      .pipe(take(1))
      .subscribe(() => {
          this.router.navigate(['products/home', this.v.module.id]);
        },
        () => {
          // @ts-ignore
          this.f.password.reset();
        });
  }


  public setModuleLocalStorage() {
    localStorage.setItem("module", this.v.module.id);
    this.authService.addPrefs("theme", this.v.module.theme);
  }

  public setLastModule(value: any) {
    if (value.id.toString() === localStorage.getItem("module")) {
      return value;
    }
  }
}
