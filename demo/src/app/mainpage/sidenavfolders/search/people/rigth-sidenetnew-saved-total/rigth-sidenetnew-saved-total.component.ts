import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GetDataService } from '../get-data.service';
import { FilterService } from '../../filters/filter.service';
import { D } from '@angular/cdk/keycodes';
import { GuideComponent } from 'src/app/guide/guide.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-rigth-sidenetnew-saved-total',
  templateUrl: './rigth-sidenetnew-saved-total.component.html',
  styleUrls: ['./rigth-sidenetnew-saved-total.component.css'],
})
export class RigthSidenetnewSavedTotalComponent {
  filters: any = {};
  results: any = {};
  currentPage: number = 1;
  selectedRows: any[] = [];
  totalRecordsBeforeSearch: number = 0;
  totalRecordsAfterSearch: number = 0;
  count: any;
  loading: any;
  loadder: any;
  savedData: any;
  savedRecordsCount: any;
  private intervalidI!: number;
  Useremail: any;
  new_new: any;
  itemsPerPage: number = 50;
  displayedData!: any[] ;
  constructor(
    private router: Router,
    private apiService: GetDataService,
    private filterService: FilterService,
    private dialog:MatDialog
  ) {}

  ngOnInit(): void {
    this.fetchSavedData(this.currentPage);
    const userEmail = localStorage.getItem('email');
    // const userEmail = localStorage.getItem('email');
if (userEmail) {
  this.apiService.saveDataToUserAccount(userEmail, this.selectedRows).subscribe(
    (response) => {
      
      this.savedRecordsCount = response.saved_records_count;
      this.selectedRows = [];
    },
    (error) => {
      console.error('Error saving data:', error);
    }
  );
} 

  
    this.filterService.filters$.subscribe((filters) => {
      this.filters = filters;
      this.fetchCountsBeforeSearch()
      this.search();
      // this.fetchTotalCountBeforeFiltering();
    });






  }
  total_records=0;
  fetchSavedData(page: number): void {
    this.apiService.getSavedDataForUser(page).subscribe({
      next: (response: any) => {
        
        if (response && response.saved_data) {
          this.savedData = response.saved_data;
          this.total_records = response.saved_data.total_records; 
          this.savedRecordsCount = +response.pagination_saved.total_records;
          
          this.getDataForCurrentPage(); 
        } else {
          console.warn('Unexpected server response. No saved_data property found.');
        }
      },
      
      error: (error) => {
        console.error('Error fetching saved data:', error);
      },
      complete: () => {
        
      }
    });
  }


  isPeopleRoute(): boolean {
    const segments: string[] = this.router.url.split('/');
    return segments.includes('right');
  }
  
  fetchCountsBeforeSearch(): void {
    this.apiService.getCounts().subscribe((countData) => {
      this.totalRecordsBeforeSearch = countData.total_count;
      this.new_new = countData.net_new_count;
      console.log('count from VDB API - ', this.new_new);
      
 
      
      
    });
  }

  search(): void {
    this.loading = false;
    const filtersApplied = Object.values(this.filters).some(
      (value) => value !== null && value !== undefined && value !== ''
    );
  
    this.loadder = filtersApplied;
  
    if (!filtersApplied) {
      this.results = [];
      this.selectedRows = [];
      return; 
    }
  
    this.apiService.searchRecords({}, 1).subscribe((data) => {
      this.new_new = data.net_new_count;
    });
  
    this.apiService.searchRecords(this.filters, this.currentPage).subscribe((data) => {
      this.results = data;
      this.totalRecordsBeforeSearch = data.total_count;
      this.new_new = data.net_new_count;
      console.log('count from VDB API search - ', this.new_new);
      
    });
  }
  

   openGuideDialog(){
    let dialogRef= this.dialog.open(GuideComponent,{
      data :{ },
        height: '1000px',
        width: '350px',
        position: { right: '0px', top: '90px',bottom:'0px' }
      });

  }


  getDataForCurrentPage(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.savedData.length);
    this.displayedData = this.savedData.slice(startIndex, endIndex);
    
    
  }

}
