import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { environment as testingEnvironment } from '../../environment/testingEnvironment';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {

  private testingBaseUrl = testingEnvironment.testingBaseUrl + '/inventory';

  constructor(private http: HttpClient) { }

  getInventory(
    page: number,
    limit: number,
    search: string,
    sortField: string,
    sortOrder: string
  ) {

    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('search', search || '')
      .set('sortField', sortField)
      .set('sortOrder', sortOrder);

    return this.http.get<any>(this.testingBaseUrl, { params }).pipe(
      catchError((error) => {
        console.error('Inventory API error', error);

        if (error.status === 0) {
          return throwError(() => new Error('Network error. Check connection.'));
        }

        return throwError(() =>
          new Error(error.error?.message || 'Failed to load inventory')
        );
      })
    );
  }  


}
