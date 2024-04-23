import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {catchError, map, skipWhile, tap} from 'rxjs/operators'


import { Observable } from 'rxjs/internal/Observable';
import { AuthService } from 'src/app/auth.service';
import { BehaviorSubject, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GetDataService   {
  private currentPageSubject: BehaviorSubject<number>;
  public currentPage$: Observable<number>;


  private base_url = 'https://api.vectordb.app/v1/'
  private api_Url = 'https://app.datagateway.in/API/'; 




  
 


  getlastBounce(email: string): Observable<any> {
    const api_key = this.authService.getapi_key();
    const countUrl = `${this.base_url}auth/credit/?api=${api_key}&email_address=${email}`;
    return this.http.get<any>(countUrl);
  }

  headers = new HttpHeaders().set('Content-Type','application/json').set('Accept','application/json')
  httpOptions={
    headers:this.headers
    }
  constructor(private http: HttpClient,private authService:AuthService) {
   this.currentPageSubject = new BehaviorSubject<number>(1);
  this.currentPage$ = this.currentPageSubject.asObservable();
  }
 
 
  getCurrentPage(): number {
    return this.currentPageSubject.value;
  }

  setCurrentPage(page: number): void {
    this.currentPageSubject.next(page);
  }

  searchRecords(filters: any, page: number = 1): Observable<any> {
    const api_key = this.authService.getapi_key();
  
    if (Object.keys(filters).length > 0) {
      // Remove 'api' key from filters
      const { api, ...filteredParams } = filters;
      
      const params = new HttpParams({
        fromObject: { ...filteredParams, page: page.toString() }
      });
  
      // Append '/?api=' to the base URL
      const searchUrl = `${this.base_url}search/people/?api=${api_key}`;
  
      return this.http.get<any>(searchUrl, { params });
    } else {
      return of(null);
    }
  }
  
  
  
googleSignin(googleWrapper: any) {
  googleWrapper.click();
}

saveDataToUserAccount(email: string, selectedRows: any[]): Observable<any> {
  const api_key = this.authService.getapi_key();
  const selectedIds = selectedRows.map(row => row.Prospect_Link);
  const selectedIdsString = selectedIds.join('&selectedRowIds[]=');

  // const url = `${this.saveDataApiUrl}?dynamic_table=${email}&selectedRowIds[]=${selectedIdsString}`;
  const countUrl = `${this.base_url}search/people/savedata/?api=${api_key}&selectedRowIds[]=${selectedIdsString}`;

  return this.http.post(countUrl, null);
}

  
  exportToCSV(filters: any, selectedRows: any[]): Observable<any> {
    const api_key = this.authService.getapi_key();
    const selectedIds = selectedRows.map(row => row.Prospect_Link);
  
    const params = new HttpParams({
      fromObject: { ...filters, export: 'csv', selectedIds: JSON.stringify(selectedIds), api: api_key }
    });
  
    const exportCsvUrl = `${this.base_url}search/people?${params.toString()}`;
    return this.http.get(exportCsvUrl, { responseType: 'text' });
  }



  getSavedData(email: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.base_url}search/people?user_email=${email}`);
  }
  
 
  getSavedDataForUser(page: number = 1): Observable<any> {
    const api_key = this.authService.getapi_key();

    if (!api_key) {
      console.error('User email not found.');
      return of(null);
    }

    const params = new HttpParams({
      fromObject: { api: api_key, page: page.toString() }
    });

    return this.http.get<any>(this.base_url + 'search/people/saved/?', { params });
  }


  registerUser(user: any): Observable<any> {
    return this.http.post(this.api_Url + 'signup_process.php', JSON.stringify(user), {
      headers: new HttpHeaders().set('Content-Type', 'application/json'),
      responseType: 'text'
    })
    .pipe(
      catchError((error) => {
        
        if (error.status === 404) {
          console.error('User not found.', error);
        } else if (error.status === 409) {
          console.error('Conflict: Email already exists. Please use a different email address.', error);
        } else {
          console.error('Error registering user:', error);
        }
        return throwError(error); 
      })
    );
  }
  
  loginUser(user: any): Observable<any> {
    return this.http.post(this.base_url + 'auth/login/', user, { responseType: 'json' })
      .pipe(
        tap((response: any) => {
          this.authService.setToken(response.token);
          localStorage.setItem('user_id', response.id);
          localStorage.setItem('email', response.email);
          // localStorage.setItem('api_key', response.api_key);
        })
      );
  }

  resetPassword(data: any): Observable<any> {
    return this.http.post(this.base_url + 'auth/resetPassword/', data, { responseType: 'json' });
  }

  getAllDetailsForUser(prospectLink: string): Observable<any> {
    return this.http.get(`${this.base_url + 'search/people/getUserDetails/'}?Prospect_Link=${prospectLink}`);
  }


  getData(): Observable<string[]> {
    return this.http.get('https://api.vectordb.app/v1/search/people/count/?')
      .pipe(
        map((response: any) => {
          return Object.keys(response).map(key => response[key]['name']);
        })
      );
  }

  private apiUrlnode = 'http://localhost:3000'; // Update the API URL

  signup(email: string) {
    return this.http.post<any>(`${this.apiUrlnode}/email/signup`, { email }); // Corrected URL
  }

  confirmEmail(token: string) {
    return this.http.get<any>(`${this.apiUrlnode}/email/get?token=${token}`); // Fixed interpolation
  }
  getCounts(): Observable<any> {
    const api_key = this.authService.getapi_key();
    const countUrl = `${this.base_url}search/people/count/?api=${api_key}`;
    return this.http.get<any>(countUrl);
  }

  getTimestampData(page: number = 1): Observable<any> {
    const api_key = this.authService.getapi_key();

    if (!api_key) {
      console.error('User email not found.');
      return of(null);
    }

    const params = new HttpParams({
      fromObject: { api: api_key, page: page.toString() }
    });

    const url = `${this.base_url}enrichment/userGraph/`; 

    return this.http.get<any>(url, { params });
  }

  getTopCountriesData(): Observable<any[]> {
    const url = `${this.base_url}enrichment/country/`;  
    return this.http.get<any[]>(url);
  }

  getTopJobTitlesData(): Observable<any[]> {
    const url = `${this.base_url}enrichment/jobT/`;  
    return this.http.get<any[]>(url);
  }
}


