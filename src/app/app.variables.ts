import {Injectable} from "@angular/core";
import {User} from "./models/account/user";

@Injectable()
export class AppVariables {
    user?: User;
    routes?: string[];
}
