import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  private filtersSubject = new BehaviorSubject<any>({ include_job_title: [] });
  filters$ = this.filtersSubject.asObservable();

  updateFilters(filters: any): void {
    // Merge the new filters with the existing ones
    const mergedFilters = { ...this.filtersSubject.value, ...filters };
    this.filtersSubject.next(mergedFilters);
  }
  

  getCurrentFilters(): any {
    return this.filtersSubject.value;
  }

}