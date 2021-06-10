import { ready, authorize, init } from "../smart";
import { Client } from "../Client";
import BrowserStorage from "../storage/BrowserStorage";
import { fhirclient } from "../../types";

/**
 * Browser Adapter
 */
export default class BrowserAdapter implements fhirclient.Adapter
{
    /**
     * Stores the URL instance associated with this adapter
     */
    private _url: URL | null = null;

    /**
     * Holds the Storage instance associated with this instance
     */
    private _storage: fhirclient.Storage | null = null;

    /**
     * Environment-specific options
     */
    options: fhirclient.BrowserFHIRSettings;

    /**
     * @param options Environment-specific options
     */
    constructor(options: fhirclient.BrowserFHIRSettings = {})
    {
        this.options = {
            // Replaces the browser's current URL
            // using window.history.replaceState API or by reloading.
            replaceBrowserHistory: true,

            // Do we want to send cookies while making a request to the token
            // endpoint in order to obtain new access token using existing
            // refresh token. In rare cases the auth server might require the
            // client to send cookies along with those requests. In this case
            // developers will have to change this before initializing the app
            // like so:
            // `FHIR.oauth2.settings.refreshTokenWithCredentials = "include";`
            // or
            // `FHIR.oauth2.settings.refreshTokenWithCredentials = "same-origin";`
            // Can be one of:
            // "include"     - always send cookies
            // "same-origin" - only send cookies if we are on the same domain (default)
            // "omit"        - do not send cookies
            refreshTokenWithCredentials: "same-origin",

            ...options
        };
    }

    /**
     * Given a relative path, returns an absolute url using the instance base URL
     */
    relative(path: string): string
    {
        return new URL(path, this.getUrl().href).href;
    }

    /**
     * In browsers we need to be able to (dynamically) check if fhir.js is
     * included in the page. If it is, it should have created a "fhir" variable
     * in the global scope.
     */
    get fhir()
    {
        // @ts-ignore
        return typeof fhir === "function" ? fhir : null;
    }

    /**
     * Given the current environment, this method must return the current url
     * as URL instance
     */
    getUrl(): URL
    {
        if (!this._url) {
            this._url = new URL(location + "");
        }
        return this._url;
    }

    /**
     * Given the current environment, this method must redirect to the given
     * path
     */
    redirect(to: string): void
    {
        location.href = to;
    }

    /**
     * Returns a BrowserStorage object which is just a wrapper around
     * sessionStorage
     */
    getStorage(): BrowserStorage
    {
        if (!this._storage) {
            this._storage = new BrowserStorage();
        }
        return this._storage;
    }

    /**
     * Returns a reference to the AbortController constructor. In browsers,
     * AbortController will always be available as global (native or polyfilled)
     */
    getAbortController()
    {
        return AbortController;
    }

    // /**
    //  * Creates and returns adapter-aware SMART api. Not that while the shape of
    //  * the returned object is well known, the arguments to this function are not.
    //  * Those who override this method are free to require any environment-specific
    //  * arguments. For example in node we will need a request, a response and
    //  * optionally a storage or storage factory function.
    //  */
    // getSmartApi(): fhirclient.SMART
    // {
    //     return {
    //         ready    : (...args: any[]) => ready(this, ...args),
    //         authorize: options => authorize(this, options),
    //         init     : options => init(this, options),
    //         client   : (state: string | fhirclient.SMARTState) => {
    //             if (typeof state === "string") {
    //                 state = { serverUrl: state }
    //             }
    //             const client = new Client(state, {
    //                 refreshWithCredentials: this.options.refreshTokenWithCredentials
    //             })
    //             return client
    //         },
    //         options  : this.options
    //     };
    // }
}