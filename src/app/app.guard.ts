import {ActivatedRouteSnapshot, CanActivate, CanDeactivate, CanLoad, Route, Router, RouterStateSnapshot} from "@angular/router";
import {Injectable} from "@angular/core";
import {AppVariables} from "./app.variables";
import {AuthService} from "./services/auth.service";

@Injectable()
export class AppGuard implements CanActivate, CanLoad, CanDeactivate<{}> {

    constructor(public variables: AppVariables,
                public authService: AuthService,
                public router: Router) {
    }

    canLoad(route: Route) {
        return this.checkAuthentication();
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this.checkAuthentication(state);
    }

    canDeactivate(component: any, currentRoute: ActivatedRouteSnapshot, currentState: RouterStateSnapshot, nextState?: RouterStateSnapshot) {
        return this.checkRoute(nextState);
    }

    private checkAuthentication(state?: RouterStateSnapshot): boolean {
        if (this.authService.isLoggedIn()) {
            return true;
        }

        // not logged in so redirect to login page with the current url
        this.authService.logout(false, true, {queryParams: {u: state ? state.url : "/"}});
        return false;
    }

    private checkRoute(nextState?: RouterStateSnapshot): boolean {
        // if (nextState) {
        //     if (nextState.url.includes("/course-user") ||
        //         nextState.url.includes("/curriculum") ||
        //         nextState.url.includes("/schooling")) {
        //         return true;
        //     }
        //     if (this.variables.routes) {
        //         const _nextRoute = AppGuard.formatRoute(nextState.url);
        //         const routes = this.variables.routes.filter(route => {
        //             const _route = AppGuard.formatRoute(route);
        //             return _nextRoute.includes(_route);
        //         });
        //         return routes.length > 0 || _nextRoute.includes("login/");
        //     }
        // }
        return true;
    }

    private static formatRoute(route: string) {
        return route.endsWith("/") ? route : route.concat("/");
    }
}
