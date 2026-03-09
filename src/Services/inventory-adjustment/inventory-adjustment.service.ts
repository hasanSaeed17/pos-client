import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { environment as testingEnvironment } from '../../environment/testingEnvironment';

@Injectable({
  providedIn: 'root'
})
export class InventoryAdjustmentService {


  private testingBaseUrl = testingEnvironment.testingBaseUrl + '/inventory-adjustments';

  constructor(private http: HttpClient) { }


  
  createAdjustment(payload: any) {

    return this.http.post(this.testingBaseUrl, payload)
      .pipe(catchError(this.handleError));

  }

  getAdjustments() {

    return this.http.get(this.testingBaseUrl)
      .pipe(catchError(this.handleError));

  }

  private handleError(error: HttpErrorResponse) {

    let message = 'Unexpected error occurred';

    if (error.error?.message) {
      message = error.error.message;
    }

    return throwError(() => message);

  }




}
