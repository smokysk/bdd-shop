import {Directive, InjectionToken, Injector, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {MatDialog} from "@angular/material/dialog";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {MatTableDataSource} from "@angular/material/table";
import {ActivatedRoute, ActivatedRouteSnapshot, NavigationExtras, Params, Router} from "@angular/router";
import {BaseService} from "../services/base.service";
import {HttpClient} from "@angular/common/http";
import {FormBuilder, FormGroup} from "@angular/forms";
import {interval} from "rxjs/internal/observable/interval";
import {merge, Subject} from "rxjs";
import {map, switchMap, take, takeUntil, takeWhile, tap} from "rxjs/operators";
import {Observable} from "rxjs/internal/Observable";
import {CdkDragDrop} from "@angular/cdk/drag-drop";
import {MatTabGroup} from "@angular/material/tabs";


export interface BaseOptions {
  pk?: string;
  endpoint: string;
  paramsOnInit?: {};
  retrieveOnInit?: boolean;
  retrieveIdRoute?: string;
  retrieveRoute?: string;
  searchOnInit?: boolean;
  searchRoute?: string;
  nextRoute?: string;
  nextRouteUpdate?: string;
  keepFilters?: boolean;
  noResponse?: boolean;
  pageSize?: number;
  crossTable?: boolean;
  associative?: boolean;
  associativeRoute?: string;
  advancedFilter?: boolean;
  screenName?: string;
}

export const EVENT = {
  RETRIEVE: 0,
  SAVE: 1,
  UPDATE: 2,
  DELETE: 3,
  SEARCH: 4,
  TOGGLE: 5,
  REORDER: 6,
};

const handler = (event: number, callback?: (event: number) => void) => {
  if (callback) {
    callback(event);
  }
};


@Directive()
export abstract class BaseComponentDirective<T> implements OnInit, OnDestroy {

  @ViewChild(MatTabGroup) tabGroup?: MatTabGroup;


  @ViewChild(MatPaginator, {static: true}) paginator?: MatPaginator;

  @ViewChild(MatSort, {static: true}) sort?: MatSort;


  public dialog: MatDialog;
  public router: Router;
  public activatedRoute: ActivatedRoute;
  public http: HttpClient;
  public service: BaseService<T>;
  public dataSource: MatTableDataSource<T>;
  public formBuilder: FormBuilder;
  // @ts-ignore
  public formGroup: FormGroup;

  // @ts-ignore
  public object?: any;
  // @ts-ignore
  public rawObject: any;
  public pk: string;

  public unsubscribe = new Subject();


  protected constructor(public injector: Injector,
                        public options: BaseOptions) {
    this.dialog = injector.get<MatDialog>(MatDialog);
    this.router = injector.get(Router);
    this.activatedRoute = injector.get(ActivatedRoute);
    this.http = injector.get(HttpClient);
    this.formBuilder = injector.get(FormBuilder);
    this.service = injector.get(this._serviceToken());
    this.dataSource = new MatTableDataSource<T>();
    this.pk = options.pk || "id";
  }

  public ngOnInit(callback?: () => void) {
    this.createFormGroup();

    if (this.paginator) {
      this._createPaginator();
    }

    if (this.options.keepFilters && this.formGroup) {
      this._resetFormGroupWithFilters();
    }

    if (this.options.retrieveOnInit) {
      this.retrieve(callback);
    } else {
      handler(EVENT.RETRIEVE, callback);
    }

    if (this.options.searchOnInit) {
      this.search();
    }
  }

  // @ts-ignore
  public ngOnDestroy(value: T) {
    this.unsubscribe.next(value);
    this.unsubscribe.complete();
  }

  // The method will be implemented in inner class
  public abstract createFormGroup(): void;

  // Convenience getter for easy access to form fields
  get f() {
    return this.formGroup.controls;
  }

  // Convenience getter for easy access to form fields values
  get v() {
    return this.formGroup.value;
  }

  // Convenience getter for easy access to form fields raw values
  get rv() {
    return this.formGroup.getRawValue();
  }

  // Show modal dialog to confirm action

  // Create model base service
  public createService<K>(model: new () => K, path: string): BaseService<K> {
    const TOKEN = new InjectionToken<BaseService<K>>("service_" + path, {
      providedIn: "root", factory: () => new BaseService<K>(this.http, path),
    });
    return this.injector.get(TOKEN);
  }

  // Reload page at time interval
  public reloadPage(timeInterval: number): void {
    interval(timeInterval * 1000)
      .pipe(take(1))
      .subscribe(() => window.location.reload());
  }

  // Navigate to route
  public goToPage(route: string): void {
    const extras: NavigationExtras = {queryParamsHandling: "merge"};
    this.router.navigate([route], extras).then();
  }

  // Navigate to next tab group
  public goToTab(index: number): void {
    if (this.tabGroup) {
      this.tabGroup.selectedIndex = index;
    }
  }

  // Recover route param
  public retrieveParam(name: string): Observable<number | string> {
    return this.activatedRoute.params.pipe(
      take(1),
      map((params: Params) => {
        const value = params[name];
        return value ? value : null;
      })
    );
  }

  // Return observable with model id to retrieve
  public beforeRetrieve(): Observable<number | string> {

    // by default the id will be captured by active route parameters
    return this.activatedRoute.params.pipe(
      take(1),
      map((params: Params) => {
        const id = params[this.options.retrieveIdRoute || "action"];
        return id && id !== "create" ? id : null;
      })
    );
  }

  // Retrieve object by id
  public retrieve(callback?: () => void): void {
    // Add parameters to filter retrieve
    if (this.options.paramsOnInit) {
      const parameters: any = this.options.paramsOnInit;
      Object.keys(parameters).forEach(t => this.service.addParameter(t, parameters[t]));
    }
    // Retrieve object
    this.beforeRetrieve().pipe(
      take(1),
      takeWhile(id => {
        if (!!id) {
          return true;
        }
        handler(EVENT.RETRIEVE, callback);
        return false;
      }),
      switchMap(id => {
        // @ts-ignore
        this.object[this.pk] = id;
        return this.service.getById(id, this.options.retrieveRoute);
      })
    ).subscribe(response => {
      this.rawObject = response;
      this._response(response, EVENT.RETRIEVE, callback);
    });
  }

  // Return observable with data to search

  // Search objects
  public search(callback?: (event: number) => void): void {

    // Store filters
    if (this.options.keepFilters) {
      this._keepActiveFilters();
    }

  }

  // Save or update object
  public saveOrUpdate(callback?: (event: number) => void): void {
    this._saveOrUpdate(false, false, callback);
  }

  // Save or update object and return to save mode
  public saveOrUpdatePlus(callback?: (event: number) => void, skippCreateMode?: boolean): void {
    this._saveOrUpdate(false, true, callback, skippCreateMode);
  }

  // Save or update object as multipart/form-data
  public saveOrUpdateFormData(callback?: (event: number) => void): void {
    this._saveOrUpdate(true, false, callback);
  }

  // Save or update object as multipart/form-data and return to save mode
  public saveOrUpdateFormDataPlus(callback?: (event: number) => void): void {
    this._saveOrUpdate(true, true, callback);
  }


  public associate(source: number, target: number, associated: boolean, skill: number[] = []): void {
    const data = {
      "source": source,
      "target": target,
      "associated": associated,
      "skill": skill
    };
    this.service.postFromListRoute(this.options.associativeRoute || "associate", data)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(() => {
        if (source === 0) {
          this.search();
        } else {
          this._isAllAssociated();
        }
      });
  }

  private _isAllAssociated(): void {
    const data = this.dataSource.data;
    const filter = data.filter((t: any) => t["associated"]);
    // @ts-ignore
    this.dataSource["allAssociated"] = data.length > 0 && data.length === filter.length;
  }

  // Show model history-old


  // Convenient for reorder table
  public reorder(event: CdkDragDrop<string[]>, callback?: (event: number) => void) {
    const item: any = this.dataSource.data[event.currentIndex];
    const itemMove: any = this.dataSource.data[event.previousIndex];
    this.service.clearParameter();
    this.service.patchFromDetailRoute(item[this.pk], "reorder", {"item_move": itemMove["url"]})
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(() => {
        this.search();
        handler(EVENT.REORDER, callback);
      });
  }

  // Convenient for boolean choices


  // Save or update model as FormData or Object
  private _saveOrUpdate(isFormData: boolean, isPlus: boolean, callback?: (event: number) => void, skippCreateMode?: boolean): void {

    // Get data to save or update
    let data: any;
    if (isFormData) {
      data = new FormData();
      Object.keys(this.rv).forEach(key => {
        const value = this.rv[key];
        data.append(key, value === null || value === undefined ? "" : value);
      });
    } else {
      // @ts-ignore
      Object.assign(this.object, this.rv);
      data = this.object;
    }

    // Save or update according ID
    // @ts-ignore
    if (this.object[this.pk]) {
      // @ts-ignore
      this.service.update(this.object[this.pk], data)
        .pipe(take(1))
        .subscribe(response => {
            this.rawObject = response;
            this._response(isPlus ? null : response, EVENT.UPDATE, callback, skippCreateMode);
          }
        );
    } else {
      this.service.save(data)
        .pipe(take(1))
        .subscribe(response => {
            this.rawObject = response;
            this._response(isPlus ? null : response, EVENT.SAVE, callback, skippCreateMode);
          }
        );
    }
  }

  private _response(response: any, event: number, callback?: (event: number) => void, skippCreateMode?: boolean) {
    if (this.options.noResponse || !([EVENT.RETRIEVE, EVENT.SAVE, EVENT.UPDATE].includes(event))) {
      handler(event, callback);
      return;
    }
    if (response) {
      this.object = response;
      if (this.formGroup) {
        this.formGroup.reset(this.object);
      }

      if (this.options.nextRouteUpdate) {
        if (event === EVENT.SAVE) {
          this._changeToUpdateMode();
        } else if (event === EVENT.UPDATE) {
          this.goToPage(this.options.nextRouteUpdate);
        }
      } else if (this.options.nextRoute) {
        if (event === EVENT.SAVE || event === EVENT.UPDATE) {
          this.goToPage(this.options.nextRoute);
        }
      }
    } else {
      this.object = {};
      this.createFormGroup();
      if (!skippCreateMode) {
        this._changeToCreateMode();
      }
    }
    handler(event, callback);
  }

  // Keep filters on search
  private _keepActiveFilters(): void {
    const queryParams: any = {};
    Object.keys(this.v).forEach(t => queryParams[t] = this.v[t] ? this.v[t] : "");
    // queryParams["p"] = this.paginator.pageIndex;

    const extras: NavigationExtras = {relativeTo: this.activatedRoute, queryParams: queryParams};
    this.router.navigate([], extras).then();
  }

  // Get filters from active route and reset FormGroup
  private _resetFormGroupWithFilters(): void {
    if (this.options.keepFilters && this.formGroup) {
      this.activatedRoute.queryParams
        .pipe(take(1))
        .subscribe(params => {
          Object.keys(params).forEach(t => {
            if (t === "p") {
              // @ts-ignore
              this.paginator.pageIndex = params[t];
            } else if (this.f[t]) {
              this.f[t].patchValue(params[t]);
            }
          });
        });
    }
  }


  // Get own service token
  private _serviceToken(): InjectionToken<BaseService<T>> {
    return new InjectionToken<BaseService<T>>("service_" + this.options.endpoint, {
      providedIn: "root", factory: () => new BaseService<T>(this.http, this.options.endpoint),
    });
  }

  // Create pagination and sorting event
  private _createPaginator(): void {
    if (this.paginator) {
      this.paginator.pageIndex = 0;
      this.paginator.pageSize = this.options.pageSize || 10;
      this.paginator.pageSizeOptions = [5, 10, 25, 50];
      this.paginator.showFirstLastButtons = true;

      if (this.sort) {
        // If the user changes the sort order, reset back to the first page.
        // @ts-ignore
        this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

        merge(this.sort.sortChange, this.paginator.page)
          .pipe(tap(() => this.search()))
          .subscribe();
      } else {
        this.paginator.page
          .pipe(tap(() => this.search()))
          .subscribe();
      }
    }
  }

  private _changeToCreateMode() {
    const route = this._getPathRoute(this.router.routerState.snapshot.root)
      .map((path: any) => path.replace(":action", "create"));
    this.router.navigate([route.join("/")], {queryParamsHandling: "preserve"}).then();
  }

  private _changeToUpdateMode() {
    // @ts-ignore
    const route = this._getPathRoute(this.router.routerState.snapshot.root)
      .map((path: any) => path.replace(":action", this.object[this.pk]));
    this.router.navigate([route.join("/")], {queryParamsHandling: "preserve"}).then();
  }

  // @ts-ignore
  private _getPathRoute(route: ActivatedRouteSnapshot) {
    let array = [];
    if (route.routeConfig && route.routeConfig.path !== "") {
      array.push(route.routeConfig.path);
    }
    if (route.firstChild) {
      array = array.concat(this._getPathRoute(route.firstChild));
    }
    return array;
  }

  public enableControls(...fields: string[]): void {
    fields.forEach(key => {
      this.f[key].enable();
    });
  }

  public disableControls(...fields: string[]): void {
    fields.forEach(key => {
      this.f[key].disable();
    });
  }

  public resetAndDisableControls(...fields: string[]): void {
    fields.forEach(key => {
      this.f[key].reset();
      this.f[key].setErrors(null);
      this.f[key].disable();
    });
  }


  public setValidators(validators: any[], fields: string[], disable = false, reset = true): void {
    fields.forEach(key => {
      if (reset) {
        this.f[key].reset();
      }
      if (disable) {
        this.f[key].disable();
      }
      if (!disable) {
        this.f[key].enable();
      }
      this.f[key].setErrors(null);
      this.f[key].setValidators(validators);
      if (validators.length > 0) {
        this.f[key].markAsPending();
      }
    });
  }


}
