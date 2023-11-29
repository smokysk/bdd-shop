import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {Product} from "../../models/account/product";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {AuthService} from "../../services/auth.service";

@Injectable({
  providedIn: 'root'
})
export class ProductServiceService {

  private baseUrl = 'http://localhost:8000/v1/api/product'

  constructor(private http: HttpClient,
              private authService: AuthService) {
  }

  getAllProducts(): Observable<Product[]> {
    const token = this.authService.token;
    const headers = new HttpHeaders({
      Authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzAxMzk2NDgzLCJqdGkiOiI2MDA5NjUwY2RhNDM0ZjVlOGQ5NmFiNzdiOGFlMTc1OSIsInVzZXJfaWQiOjJ9.Ug9owxSNv3k0WasDuS8XT1w23CAMDONUzvmiodHS8nM',
    });
    return this.http.get<Product[]>(this.baseUrl, {headers});
  }

  getProductById(productId: number): Observable<Product> {
    const url = `${this.baseUrl}/${productId}`;
    return this.http.get<Product>(url);
  }

  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.baseUrl, product);
  }

  deleteProduct(productId: number): Observable<any> {
    const url = `${this.baseUrl}/${productId}`;
    return this.http.delete(url);
  }
}
