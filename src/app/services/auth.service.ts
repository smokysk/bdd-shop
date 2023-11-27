import { Injectable, PLATFORM_ID, Inject } from "@angular/core";
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from "@angular/common/http";
import { shareReplay, tap } from "rxjs/operators";
import { User } from '../models/account/user';
import { NavigationExtras, Router } from "@angular/router";
import { URLS } from "../app.urls";
import { environment } from "../environments/environment";
import { AppVariables } from "../app.variables";
import { String } from "typescript-string-operations";
// @ts-ignore
import jwtDecode from 'jwt-decode';

interface AuthPayload {
    user_id: number;
    username: string;
    user: User;
    exp: number;
    orig_iat: number;
}

export interface AuthUser {
    token: string;
    site: string;
    user: User;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private storage: Storage | null;

    private readonly urlBase: string;
    private readonly urlUser: string;
    private urlToken: string;

    constructor(
        public variables: AppVariables,
        public http: HttpClient,
        public router: Router,
        @Inject(PLATFORM_ID) private platformId: any,
    ) {
        this.storage = isPlatformBrowser(this.platformId) ? localStorage : null;
        this.urlBase = environment.urlBase;
        this.urlUser = String.format("{0}{1}", this.urlBase, URLS.USER);
        this.urlToken = String.format("{0}{1}", this.urlBase, URLS.TOKEN);
    }

    get user(): User {
        if (!this.variables.user) {
            const token = this.storage?.getItem("token");
            // @ts-ignore
            const payload = <AuthPayload>jwtDecode(token);
            const user = payload.user;
            // @ts-ignore
            user.url = this.urlBase.concat(user.url);
            // @ts-ignore
            user.avatar = this.storage.getItem("avatar");
            this.variables.user = user;
        }
        return this.variables.user;
    }

    get token(): string {
        // @ts-ignore
        return this.storage.getItem("token");
    }

    get module(): string {
        return this.getPrefs("module");
    }

    get theme(): string {
        return this.getPrefs("theme");
    }

    get site(): string {
        return this.getPrefs("site");
    }

    get avatar(): string {
        // @ts-ignore
        return this.storage.getItem("avatar");
    }

    public login(user: User) {
        return this.http.post(this.urlToken, user)
            .pipe(
                tap(response => this.setToken(response)),
                shareReplay(),
            );
    }

    public logout(reload?: boolean, redirect?: boolean, extras?: NavigationExtras): void {
        this.storage?.removeItem("token");
        this.storage?.removeItem("avatar");
        if (reload) {
            location.reload();
        }
        if (redirect) {
            this.router.navigate(["login"], extras).then();
        }
    }

    public isSuperUser(): boolean {
        if (this.user) {
            return <boolean>this.user.is_superuser;
        }
        return false;
    }

    public isLoggedIn() {
        return !!this.storage?.getItem("token");
    }

    public isLoggedOut() {
        return !this.isLoggedIn();
    }


    private setToken(authResponse: any) {
        if (authResponse) {
            this.storage?.setItem("token", authResponse.token.access);
        }
    }

    public setAvatar(avatar: any) {
        this.storage?.setItem("avatar", avatar);
    }

    public removeAvatar() {
        this.storage?.removeItem("avatar");
    }

    // public changeImage(user: User, data: any): Observable<User> {
    //     const headers = new HttpHeaders({
    //         "Authorization": "Bearer ".concat(this.storage.getItem("token"))
    //     });
    //
    //     const url = String.Format("{0}{1}/", this.urlUser, user.id);
    //
    //     const formData = new FormData();
    //     Object.keys(data).forEach(key => {
    //         const value = data[key];
    //         formData.append(key, value === null || value === undefined ? "" : value);
    //     });
    //
    //     return this.http.patch<User>(url, formData, {"headers": headers});
    // }

    public addPrefs(key: any, value: any): void {
        const pref = this.storage?.getItem("preferences");
        let preferences: any = {};
        if (pref) {
            preferences = JSON.parse(pref);
        }
        preferences[key] = value;
        this.storage?.setItem("preferences", JSON.stringify(preferences));
    }

    // @ts-ignore
    public getPrefs(key: any, defaultValue: string = null): any {
        const pref = this.storage?.getItem("preferences");
        let preferences: any = {};
        if (pref) {
            preferences = JSON.parse(pref);
            return preferences.hasOwnProperty(key) ? preferences[key] : defaultValue;
        }
        return defaultValue;
    }

}
