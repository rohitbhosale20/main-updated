import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { GetDataService } from '../get-data.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserDetailsComponent } from '../total/user-details/user-details.component';
import saveAs from 'file-saver';

interface SavedDataResponse {
  total_records: string;
  saved_records: any[];
  total_records_before_search: string;
  saved_records_count: string;
  difference: string;
}

@Component({
  selector: 'app-saved',
  templateUrl: './saved.component.html',
  styleUrls: ['./saved.component.css']
})
export class SavedComponent {
  savedData: any[] = [];
  savedRecordsCount: number = 0;
  selectedRows: any[] = [];
  selectAllChecked: boolean = false;
  filters: any = {};
  results: any = [];
  currentPage: number = 1;
  loading = true;
  count: any;
  total_records = 0;
  isLoading: boolean = true;
  progressValue: number = 0;
  itemsPerPage: number = 50;
  totalPages: number = 0;
  paginationTotal: any = {};
  recordsPerPage: number = 10;
  displayedData: any[] | undefined;

  constructor(private getDataService: GetDataService, private dialog: MatDialog, private snackbar: MatSnackBar) {}

  ngOnInit() {
    this.currentPage = 1;
    this.fetchSavedData(this.currentPage);
  }

  calculatePaginationDetails(currentPage: number, totalItems: number): any {
    const totalPages = Math.ceil(totalItems / this.itemsPerPage);

    return {
      current_page_saved: currentPage,
      total_pages_saved: totalPages,
      records_per_page_saved: this.itemsPerPage,
    };
  }

  fetchSavedData(page: number): void {
    this.getDataService.getSavedDataForUser(page).subscribe({
      next: (response: any) => {
        console.log('Received data from the server:', response);
        if (response && response.saved_data) {
          this.savedData = response.saved_data;
          this.total_records = response.saved_data.total_records;
          this.savedRecordsCount = +response.total_records;
          console.log('Received data from the server:', this.savedRecordsCount);
          this.getDataForCurrentPage();
          this.paginationTotal = this.calculatePaginationDetails(this.currentPage, response.total_records);
          // Ensure totalPages is calculated correctly
          this.totalPages = this.paginationTotal ? this.paginationTotal.total_pages_saved : 0;
        } else {
          console.warn('Unexpected server response. No saved_data property found.');
        }
      },
      error: (error) => {
        console.error('Error fetching saved data:', error);
      },
      complete: () => {
        console.log('Request completed. Saved data:', this.savedData);
      }
    });
  }
  
  

  goToPage(page: number): void {
    const totalPages = Math.ceil(this.savedRecordsCount / this.itemsPerPage);

    if (page >= 1 && page <= totalPages) {
      this.currentPage = page;
      this.fetchSavedData(this.currentPage);
    }
  }

  toggleRowSelection(row: any): void {
    const index = this.selectedRows.findIndex((selectedRow) => selectedRow.Prospect_Link === row.Prospect_Link);
    if (index === -1) {
      this.selectedRows.push(row);
    } else {
      this.selectedRows.splice(index, 1);
    }
  }

  isRowSelected(row: any): boolean {
    return this.selectedRows.some((selectedRow) => selectedRow.Prospect_Link === row.Prospect_Link);
  }

  selectAllRows(): void {
    this.selectAllChecked = !this.selectAllChecked;

    if (this.selectAllChecked) {
      this.selectedRows = [...this.results];
    } else {
      this.selectedRows = [];
    }
  }

  saveDataToUserAccount(): void {
    console.log(this.savedData, 'savedata');
    const userEmail = localStorage.getItem('email');
    if (userEmail) {
      this.getDataService.saveDataToUserAccount(userEmail, this.selectedRows).subscribe(
        (response) => {
          console.log('Data saved successfully:', response);
          this.selectedRows = [];
        },
        (error) => {
          console.error('Error saving data:', error);
        }
      );
    } else {
      console.error('User email not found.');
    }
  }

  exportToCSV(): void {
    const userEmail = localStorage.getItem('email');
    if (userEmail) {
      const filters = this.filters;
      const selectedRows = this.selectedRows;

      const params = {
        ...filters,
        export: 'csv',
        selectedIds: JSON.stringify(selectedRows.map((row) => row.Prospect_Link)),
        dynamic_table: userEmail,
      };

      this.getDataService.exportToCSV(filters, selectedRows).subscribe(
        (data) => {
          const blob = new Blob([data], { type: 'text/csv;charset=utf-8' });
          saveAs(blob, 'exported_data.csv');
          this.snackbar.open('data is exported', 'Close', {
            duration: 4000,
            verticalPosition: 'top',
            panelClass: ['custom-snackbar', 'snackbar-success'],
          });
        },
        (error) => {
          console.error('Error exporting data:', error);
        }
      );
    } else {
      console.error('User email not found.');
    }
  }

  getDataForCurrentPage(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.savedData.length);
    this.displayedData = this.savedData.slice(startIndex, endIndex);
    console.log(this.displayedData.length, 'displayedData');
    console.log(this.displayedData, 'this is the displayedData');
  }

  search(): void {
    this.loading = true;
    const filtersApplied = Object.values(this.filters).some(
      (value) => value !== null && value !== undefined && value !== ''
    );
    console.log('Filters:', this.filters);

    if (!filtersApplied) {
      this.results = [];
      this.selectedRows = [];
      return;
    }

    this.getDataService.searchRecords(this.filters, this.currentPage).subscribe(
      (data: any) => {
        this.results = data.total_data;
        this.loading = false;
        this.count = data.total_count;
        this.isLoading = false;
        this.totalPages = data.pagination_saved.total_pages_saved;
        this.paginationTotal = this.calculatePaginationDetails(this.currentPage, data.total_count);
      },
      (error) => {
        console.error('Error fetching data:', error);
        this.loading = false;
      }
    );
  }

  openUserDialog(editData: any) {
    let dialogRef = this.dialog.open(UserDetailsComponent, {
      data: { editData },
      height: '507px',
      width: '450px',
      position: { right: '0px', top: '337px', bottom: '0px' }
    });
  }

  valitity: any;
  clicked: any;
  isEmailValid: any;
  showSelected: boolean = false;
  validationChecked: boolean = false;
  showButton: boolean = true;

  validateEmail(email: string, item: any): void {
    this.isLoading = true;
    this.getDataService.getlastBounce(email).subscribe(
      (data) => {
        console.log(data.result, 'data of rebounce');
        this.isEmailValid = data.result;
        item.isValidEmail = data.result;
        item.clicked = true;

        // Store the verification status in localStorage
        localStorage.setItem(
          'emailVerification_' + email,
          JSON.stringify({ isValidEmail: data.result, clicked: true })
        );
        this.valitity = localStorage.getItem('isValidEmail');
        this.clicked = localStorage.getItem('clicked');
      },
      (error) => {
        console.error('Error validating email:', error);
        this.snackbar.open('Error occurred while validating email', 'Close', {
          duration: 4000,
          verticalPosition: 'top',
          panelClass: ['custom-snackbar', 'snackbar-error'],
        });
      }
    );
  }

  // Method to retrieve the stored validation status for an email from localStorage
  getStoredValidationStatus(email: string): string | null {
    const storedData = localStorage.getItem('emailVerification_' + email);
    if (storedData) {
      const { isValidEmail } = JSON.parse(storedData);
      return isValidEmail;
    }
    return null;
  }
}
