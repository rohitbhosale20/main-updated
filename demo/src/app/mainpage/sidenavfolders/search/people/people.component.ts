import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GetDataService } from './get-data.service';
import { ChangeDetectionStrategy } from '@angular/core';
import * as XLSX from 'xlsx';

import saveAs from 'file-saver';
import * as FileSaver from 'file-saver';
import { FilterService } from '../filters/filter.service';

@Component({
  selector: 'app-people',
  templateUrl: './people.component.html',
  styleUrls: ['./people.component.css'],
  
})
export class PeopleComponent {
  filters: any = {};
  results: any = [];
  currentPage: number = 1;
  Useremail:any
  constructor(private apiService: GetDataService, private filterService: FilterService) {}

  ngOnInit(): void {
    this.filterService.filters$.subscribe((filters) => {
      this.filters = filters;
      this.search();
    });

    this.search();
  }

  search(): void {
    this.apiService.searchRecords(this.filters, this.currentPage).subscribe((data) => {
      this.results = data;
    });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.results.total_pages) {
      this.currentPage = page;
      this.search();
    }
  }

  
}