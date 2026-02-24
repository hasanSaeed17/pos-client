import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Product } from '../../Models/productModel';
import { environment as testingEnvironment } from '../../environment/testingEnvironment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private testingBaseUrl = testingEnvironment.testingBaseUrl + '/products';

  constructor(private http: HttpClient) { }


  /* ================= ALL PRODUCTS ================= */

  getAllProducts(): Observable<Product[]> {
    return this.http.get<any>(`${this.testingBaseUrl}/allProducts`)
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  /* ================= AVAILABLE PRODUCTS ================= */

getAvailableProducts(): Observable<Product[]> {
  return this.http
    .get<any>(this.testingBaseUrl + '/availableProducts')
    .pipe(map(res => res.data));
}

  /* ================= LOW STOCK ================= */

  getLowStockProducts(): Observable<Product[]> {
    return this.http.get<any>(`${this.testingBaseUrl}/lowStock`)
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  /* ================= PRODUCT BY ID ================= */

  getProductById(id: string): Observable<Product> {
    return this.http.get<any>(`${this.testingBaseUrl}/product/${id}`)
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  /* ================= ERROR HANDLING ================= */

  private handleError(error: HttpErrorResponse) {

    let message = 'Something went wrong';

    if (error.error?.message) {
      message = error.error.message;
    }

    console.error('ProductService Error:', error);

    return throwError(() => new Error(message));
  }


}
