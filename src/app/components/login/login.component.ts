import {Component} from '@angular/core';
import {User} from "../../models/account/user";
import {AuthService} from "../../services/auth.service";
import {FormGroup} from "@angular/forms";
import {Router} from "@angular/router";
import {take} from "rxjs";

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss'
})
export class LoginComponent {

    public formGroup?: FormGroup;
    public url?: string;

    constructor(public authService: AuthService,
                public router: Router) {
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
                },
                () => {
                    // @ts-ignore
                    this.f.password.reset();
                });
    }
}
