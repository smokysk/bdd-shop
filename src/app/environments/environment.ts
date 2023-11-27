import {String} from "typescript-string-operations";

export const environment = {
    production: false,
    urlBase: String.format("http://{0}:{1}", "localhost", "8000"),
    urlSocket: String.format("ws://{0}:{1}", "localhost", "8000"),
};
