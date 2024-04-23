import { Component, ElementRef, Input, ViewChild, inject } from '@angular/core';
import { FilterService } from './filter.service';
import { GetDataService } from '../people/get-data.service';
import { DataFilterService } from 'src/data-filter.service';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatChipInputEvent, MatChipEditedEvent, MatChipInput, MatChip } from '@angular/material/chips';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Observable } from 'rxjs/internal/Observable';
import { HttpClient } from '@angular/common/http';
import { MatOptionSelectionChange } from '@angular/material/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { startWith } from 'rxjs/internal/operators/startWith';
import { map } from 'rxjs/internal/operators/map';
import { ObservableInput, debounceTime, takeLast } from 'rxjs';
import { observableToBeFn } from 'rxjs/internal/testing/TestScheduler';
import { AuthService } from 'src/app/auth.service';
import { forkJoin } from 'rxjs';
import { valueOrDefault } from 'chart.js/dist/helpers/helpers.core';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.css'],
})
export class FiltersComponent {
  selectedJobTitles: string[] = []; 
  jobname: string[] = []; 
  industryFilter: string = '';
  jobFunctionFilter: string = '';
  countryFilter: any;
  userEmail:any
  includecountry:string[]=[]
  // these names should match the backend properties name
  filters: any = {
    include_country: '',  
    include_job_title: '',
    include_First_Name: '',
    include_company_name:'',
    include_company_domain:'',
    include_Employee_Size: [],
    exclude_Employee_Size: [],
    exclude_job_title :'',
    exclude_company_domain:'',
    exclude_company_name:'',
    exclude_country:'',
    include_job_function:[],
    include_job_level:[],
 
  };


includeCompanyName:string[]=[]
includeJobTitles: string[] = [];


includeCompanyDomain:string[]=[]
// properties for exclude fields for chips
excludeJobTitles: string[] = [];
excludeCountry: string[] = [];
excludeCompanyName: string[] = [];
excludeCompanyDomain:string[]=[]
  checkboxValues: { [key: string]: boolean } = {
    'Director': false,
    'Manager': false,
    'VP Level': false,
    'Vice President': false,
    'C Level': false,
    'Founder': false
  };
  service: any;
 
  
  getCheckboxKeys(): string[] {
    return Object.keys(this.checkboxValues);
  }

getSelectedJobTitlesCount(): number {
  // Implement your logic to calculate the count of selected job titles
  return this.selectedJobTitles ? this.selectedJobTitles.length : 0;
}
  
  // employeeSizeOptions: string[] = [
  //   '1-10',
  //   '11-20',
  //   '21-50',
  //   '51-100',
  //   '101-200',
  //   '51-200',
  //   '100-501',
  //   '201-500',
  //   '501-1000',
  //   '1001-5000',
  //   '5001-10000',
  //   '10001+',
  // ];
  results: any = [];
  currentPage: number = 1;

  companytitle: Set<string> = new Set<string>(); 
  resultsToShow: any;
  selectedRows: any[] = [];

  selectedEmployeeSizes: string[] = [];
  constructor(
    private apiService: GetDataService,
    private filterService: FilterService,
    private authService:AuthService,
    private fb : FormBuilder,
    private http: HttpClient
  ) {
    
    this.jobFunctionControl.valueChanges.subscribe(selectedFunctions => {
      this.selectedJobFunctions = selectedFunctions;
      this.updateFilters()
    });
    this.employeeSizeControl.valueChanges.subscribe(selectedSizes => {
      this.selectedEmployeeSizes = selectedSizes;
      this.updateFilters()
    });
    this.jobLevelControl.valueChanges.subscribe(selectedLevels => {
      this.selectedJobLevels = selectedLevels;
      this.updateFilters()
    });
  }

  ngOnInit(): void {
    this.filters = {};
    this.filterService.filters$.subscribe((filters) => {
      this.filters = filters;
      this.search();
      // this.search1()
  
    });
    this.search();
    this.fetchSuggestions();
    this.fetchCountrySuggestions();
    this.fetchJobTitleSuggestions();
    this.fetchexcludeJobTitleSuggestions()
    this.fetchexcludecountrySuggestions()
    this.fetchexcludeCompanySuggestions()
 
  }

  

  // Table data
  tableData: any[] = []; // Assuming you have some data to display in the table
  filteredData: any[] = [];
 
toggleCheckbox(value: string, type: string): void {
  // Use the appropriate property based on the type
  const currentValue = type === 'Employee_Size' ? this.filters.include_Employee_Size : this.filters.include_job_level || this.filters.include_job_function;

  // Check if currentValue is defined before using it
  const values = (currentValue || '').split(',');

  if (values.includes(value)) {
    const index = values.indexOf(value);
    values.splice(index, 1);
  } else {
    values.push(value);
  }

  if (type === 'Employee_Size') {
    this.filters.include_Employee_Size = values.join(',');
  } else {
    // Assuming 'Job_Level' and 'Job_Function' have the same structure
    this.filters[type === 'Job_Level' ? 'include_job_level' : 'include_job_function'] = values.join(',');
  }

  this.applyFilter();
}

isCheckboxChecked(value: string, type: string): boolean {
  let values: string[] = [];

  if (type === 'Employee_Size') {
    values = (this.filters && this.filters.include_Employee_Size || '').split(',');
  } else if (type === 'Job_Level' || type === 'job_function') {
    const includeProperty = type === 'Job_Level' ? 'include_job_level' : 'include_job_function';
    values = (this.filters && this.filters[includeProperty] || '').split(',');
  } 

  return values.includes(value);
}

togglePanel(panelId: string): void {
  const panel = document.getElementById(panelId);
  if (panel) {
    // Consider using Angular data binding to control visibility
    panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
  }
}

addOnBlur = true;
// announcer = inject(LiveAnnouncer);
readonly separatorKeysCodes: number[] = [ENTER, COMMA];
readonly separatorKeysCodes1:number[]=[ENTER,COMMA];
readonly separatorKeysCodes2:number[]=[ENTER,COMMA];
readonly separatorKeysCodes3:number[]=[ENTER,COMMA];
readonly separatorKeysCodes4:number[]=[ENTER,COMMA];
// include job title

removeJobTitle(jobTitle: string): void {
  const index = this.includeJobTitles.indexOf(jobTitle);
  if (index !== -1) {
    this.includeJobTitles.splice(index, 1);
    this.updateFilters();
  }
}
// for exclude the job title


removeExcludeJobTitle(jobTitle: string): void {
  const index = this.excludeJobTitles.indexOf(jobTitle);
  if (index !== -1) {
    this.excludeJobTitles.splice(index, 1);
    this.updateFilters();
  }
}
// include company name
addCompanyName(value: string): void {
  // Check if the value is included in the filtered suggestions
  if (this.filteredSuggestions.includes(value)) {
    // Add the selected value to the includeCompanyName array
    if (value && !this.includeCompanyName.includes(value)) {
      this.includeCompanyName.push(value);
    }

    // Reset the input value
    if (this.inputElement && this.inputElement.nativeElement) {
      this.inputElement.nativeElement.value = '';
    }

    // Update filters
    this.updateFilters();
  }
}


 removeCompanyName(companyName: string): void {
   const index = this.includeCompanyName.indexOf(companyName);
   if (index !== -1) {
     this.includeCompanyName.splice(index, 1);
     this.updateFilters();
   }
 }
 // Exclude company Name
 
 removeExcludeCompanyName(companyName: string): void {
   const index = this.excludeCompanyName.indexOf(companyName);
   if (index !== -1) {
     this.excludeCompanyName.splice(index, 1);
     this.updateFilters();
   }
 }
 // include company domain
 addCompanyDomain(event: MatChipInputEvent): void {
   const value = (event.value || '').trim();
   if (value) {
     // Split the input by separator if multiple company names are entered
     const names = value.split(',');
     // Trim each name and add it to the includeCompanyName array
     names.forEach(name => {
       const trimmedName = name.trim();
       if (trimmedName && !this.includeCompanyDomain.includes(trimmedName)) {
         this.includeCompanyDomain.push(trimmedName);
       }
     });
     // Reset the input value
     if (event.input) {
       event.input.value = '';
      }
      this.updateFilters();
    }
 }
 removeCompanyDomain(companyDomain: string): void {
    const index = this.includeCompanyDomain.indexOf(companyDomain);
    if (index !== -1) {
      this.includeCompanyDomain.splice(index, 1);
      this.updateFilters();
    }
}
// exclude company domain
addExcludeCompanyDomain(event: MatChipInputEvent): void {
  const value = (event.value || '').trim();
  if (value) {
    // Split the input by separator if multiple job titles are entered
    const titles = value.split(',');
    // Trim each title and add it to the excludeJobTitles array
    titles.forEach(companyDomain => {
      const trimmedTitle = companyDomain.trim();
      if (trimmedTitle && !this.excludeCompanyDomain.includes(trimmedTitle)) {
        this.excludeCompanyDomain.push(trimmedTitle);
      }
    });
    // Reset the input value
    if (event.input) {
      event.input.value = '';
    }
    this.updateFilters();
  }
}
removeExcludeCompanyDomain(companyDomain: string): void {
  const index = this.excludeCompanyDomain.indexOf(companyDomain);
  if (index !== -1) {
    this.excludeCompanyDomain.splice(index, 1);
    this.updateFilters();
  }
}
// include country
// addCountry(event: MatChipInputEvent): void {
//   const value = (event.value || '').trim();
//   if (value) {
//     const countries = value.split(',').map(country => country.trim());
//     countries.forEach(country => {
//       if (country && !this.includecountry.includes(country)) {
//         this.includecountry.push(country);
//       }
//     });
//     if (event.input) {
//       event.input.value = '';
//     }
//     this.updateFilters(); // Update filters after adding country
//   }
// }
removeCountryChip(country: string): void {
  const index = this.includecountry.indexOf(country);
  if (index !== -1) {
    this.includecountry.splice(index, 1);
    this.updateFilters(); // Update filters after removing country
  }
}
// exclude country
// addExcludeCountry(event: MatChipInputEvent): void {
//   const value = (event.value || '').trim();
//   if (value) {
//     // Split the input by separator if multiple job titles are entered
//     const titles = value.split(',');
//     // Trim each title and add it to the excludeJobTitles array
//     titles.forEach(country => {
//       const trimmedTitle = country.trim();
//       if (trimmedTitle && !this.excludeCountry.includes(trimmedTitle)) {
//         this.excludeCountry.push(trimmedTitle);
//       }
//     });
//     // Reset the input value
//     if (event.input) {
//       event.input.value = '';
//     }
//     this.updateFilters();
//   }
// }
removeExcludeCountry(country: string): void {
  const index = this.excludeCountry.indexOf(country);
  if (index !== -1) {
    this.excludeCountry.splice(index, 1);
    this.updateFilters();
  }
}

applyFilter(): void {
  // Convert arrays to strings before updating the filters
  this.filters.include_job_title = this.includeJobTitles.join(', ');
  this.filters.include_country = this.includecountry.join(', ');
  this.filters.include_company_domain = this.includeCompanyDomain.join(', ');
  this.filters.include_company_name = this.includeCompanyName.join(', ');

  // Apply the filter on the table data
  this.filters.include_employee_size = this.selectedEmployeeSizes.join(', ');
  this.filters.include_job_function = this.selectedJobFunctions.join(', ');
  this.filters.include_job_level = this.selectedJobLevels.join(', ');

  // Update the filters in the service
  this.filterService.updateFilters(this.filters);

  // Call search after updating filters
  this.search();
}

search(): void {
const userEmail = this.authService.getUserEmail();

const filtersApplied = Object.values(this.filters).some(
 (value) => value !== null && value !== undefined && value !== ''
);


if (!filtersApplied) {
 // Clear results and selected rows when no filters are applied
 this.results = [];
 this.selectedRows = [];

 return; // Exit the function early when no filters are applied
}

}

private updateFilters(): void {
  // Update include_job_title and  in filters
  this.filters.include_job_title = this.includeJobTitles.join(', ');
  this.filters.include_country = this.includecountry.join(', ');
  this.filters.include_company_name=this.includeCompanyName.join(', ');
  this.filters.include_company_domain=this.includeCompanyDomain.join(', ');
  this.filters.exclude_job_title = this.excludeJobTitles.join(', ');
  this.filters.exclude_company_name=this.excludeCompanyName.join(', ');
  this.filters.exclude_country=this.excludeCountry.join(', ');
  this.filters.exclude_company_domain=this.excludeCompanyDomain.join(', ')
    // Update include_employee_size filter
  this.filters.include_Employee_Size = this.selectedEmployeeSizes.join(', ');
  this.filters.include_job_function=this.selectedJobFunctions.join(', ');
  this.filters.include_job_level=this.selectedJobLevels.join(', ');
  this.applyFilter(); 
  this.formatChipsData()
}
formatChipsData(): void {
  this.filters.include_job_title = this.includeJobTitles.join(', ');
  this.filters.include_country = this.includecountry.join(', ');
  this.filters.include_company_name=this.includeCompanyName.join(', ');
  this.filters.include_company_domain=this.includeCompanyDomain.join(', ');
  this.filters.exclude_job_title = this.excludeJobTitles.join(', ');
  this.filters.exclude_company_name=this.excludeCompanyName.join(', ');
  this.filters.exclude_country=this.excludeCountry.join(', ');
  this.filters.exclude_company_domain=this.excludeCompanyDomain.join(', ')
  this.filters.include_job_function=this.selectedJobFunctions.join(', ')
  this.filters.include_Employee_Size = this.selectedEmployeeSizes.join(', ');
  this.filters.include_job_level=this.selectedJobLevels.join(', ');
}

// REMOVE THE COUNT
removeAllCompanyNames(): void {
  this.includeCompanyName = []; // Clear the array
  this.updateFilters(); // Update the filters accordingly
}
removeExcludeCompanyNames():void{
  this.excludeCompanyName=[];
  this.updateFilters()
}
removeAllCompanyDomain():void{
  this.includeCompanyDomain=[]
  this.updateFilters()
}
removeExcludeCompanyDomainCount():void{
  this.excludeCompanyDomain=[]
  this.updateFilters()
}
removeincludeJobTitles():void{
  this.includeJobTitles=[]
  this.updateFilters()
}
removeExcludeJobTitles():void{
  this.excludeJobTitles=[]
  this.updateFilters()
}
removeincludeCountry():void{
  this.includecountry=[]
  this.updateFilters()
}
removeExcludecountry():void{
  this.excludeCountry=[]
  this.updateFilters()
}

getAppliedFiltersCount(): number {
  let count = 0;
  for (const key in this.filters) {
    if (this.filters.hasOwnProperty(key)) {
      // Check if the property is an array (checkboxes)
      if (Array.isArray(this.filters[key])) {
        // Check if all options are selected
        const allSelected = this.filters[key].every((isChecked: boolean) => isChecked);
        if (!allSelected) {
          // Count the number of selected checkboxes
          count += this.filters[key].filter((isChecked: boolean) => isChecked).length;
        }
      } else if (this.filters[key] !== '') {
        // Check if the property is meant for inclusion/exclusion and not empty
        if (key.startsWith('include_') || key.startsWith('exclude_')) {
          count++;
        }
      }
    }
  }
  return count;
}

removeAllselectedJobLevels(){
  this.selectedJobLevels=[]
  this.jobLevelControl.patchValue([], { emitEvent: false });
  this.updateFilters()
}
removeAllselectedJobFunctions(){
  this.selectedJobFunctions = []; // Clear the selectedJobFunctions array
  // Reset the form control value to an empty array
  this.jobFunctionControl.patchValue([], { emitEvent: false });
  this.updateFilters(); 
}
removeselectedEmployeeSizes(){
  this.selectedEmployeeSizes=[]
  this.employeeSizeControl.patchValue([], { emitEvent: false });
  
  
  this.updateFilters()
}
removeAllFilters() {
  // Clear all filter properties
  for (const key in this.filters) {
    if (this.filters.hasOwnProperty(key)) {
      if (Array.isArray(this.filters[key])) {
        // If it's an array, empty the array
        this.filters[key] = [];
      } else {
        // Otherwise, reset to empty string
        this.filters[key] = '';
      }
    }
  }

  // Clear specific filter properties if they exist
  if (this.filters.hasOwnProperty('includecountry')) {
    this.filters['includecountry'] = [];
  }
  if (this.filters.hasOwnProperty('excludeCountry')) {
    this.filters['excludeCountry'] = [];
  }
  // Clear company name filter properties
  if (this.filters.hasOwnProperty('includeCompanyName')) {
    this.filters['includeCompanyName'] = [];
  }
  if (this.filters.hasOwnProperty('excludeCompanyName')) {
    this.filters['excludeCompanyName'] = [];
  }
  // Clear company domain filter properties
  if (this.filters.hasOwnProperty('includeCompanyDomain')) {
    this.filters['includeCompanyDomain'] = [];
  }
  if (this.filters.hasOwnProperty('excludeCompanyDomain')) {
    this.filters['excludeCompanyDomain'] = [];
  }
  // Clear job title filter properties
  if (this.filters.hasOwnProperty('includeJobTitles')) {
    this.filters['includeJobTitles'] = [];
  }
  if (this.filters.hasOwnProperty('excludeJobTitles')) {
    this.filters['excludeJobTitles'] = [];
  }
  if (this.filters.hasOwnProperty('include_job_function')) {
    this.filters['include_job_function'] = [];
  }

  if (this.filters.hasOwnProperty('include_Employee_Size')) {
    this.filters['include_Employee_Size'] = [];
  }
  if (this.filters.hasOwnProperty('include_job_level')) {
    this.filters['include_job_level'] = [];
  }

  // Clear chip input fields
  this.includecountry = [];
  this.excludeCountry = [];
  this.includeCompanyName = [];
  this.excludeCompanyName = [];
  this.includeCompanyDomain = [];
  this.excludeCompanyDomain = [];
  this.includeJobTitles = [];
  this.excludeJobTitles = [];
  this.selectedJobFunctions = [];
  this.selectedJobLevels = [];
  this.selectedEmployeeSizes = [];

  // Reset form control values
  this.jobFunctionControl.setValue([], { emitEvent: false });
  this.jobLevelControl.setValue([], { emitEvent: false });
  this.employeeSizeControl.setValue([], { emitEvent: false });

  // Call the method to update filters
  this.updateFilters();
}

employeeSizeControl = new FormControl();
employeeSizeOptions: string[] = [
  '1 to 10',
  '11 to 50',
  '51-200',
  '201-500',
  '501-1000',
  '1001-5000',
  '5001-10000',
  '10001+'
  ];


// // code for dropdown chips
removeSize(size: string): void {
  const index = this.selectedEmployeeSizes.indexOf(size);
  if (index !== -1) {
    this.selectedEmployeeSizes.splice(index, 1);
    // Update the form control value
    this.employeeSizeControl.setValue(this.selectedEmployeeSizes);
    // Perform any additional operations as needed
    this.updateFilters()
  }
  
}



checked: boolean = false;
checkedd: boolean = false;
checkforjobtitle:boolean=false
checkforcountry:boolean=false
ifclick() {
  this.checked = !this.checked;
}

ifclickk(){
  this.checkedd=!this.checkedd;
}

ifclickjobtitle(){
this.checkforjobtitle=!this.checkforjobtitle
}

ifclickoncountry(){
this.checkforcountry=!this.checkforcountry
 }

jobFunctionControl = new FormControl();
jobFunctionOptions: string[] = [
  'Any', 'Business', 'Customer', 'Design', 'Education', 'Engineer', 'Finance', 
  'Founder', 'Human Resources', 'Information Technology', 
  'Law', 'Legal', 'Manufacturing', 'Marketing', 'Marketing/Finance', 
  'Medical & Health', 'Operations', 'Owner', 'Partner', 'Sales'
];
selectedJobFunctions: string[] = [];

  // Method to remove a selected job function chip
  removeFunction(func: string): void {
    const index = this.selectedJobFunctions.indexOf(func);
    if (index !== -1) {
      this.selectedJobFunctions.splice(index, 1);
      // Update the form control value
      this.jobFunctionControl.setValue(this.selectedJobFunctions);
      // Perform any additional operations as needed
      this.updateFilters()
    }
    this.updateFilters()
  }

  jobLevelControl = new FormControl();
  jobLevelOptions: string[] = ['Director', 'Manager', 'VP Level', 'Vice President', 'C Level', 'Owner', 'Partner', 'Senior', 'Entry', 'Intern'];
  selectedJobLevels: string[] = [];

  addJobLevel(value: string, chipList: any) {
    if (value && value.trim()) {
      this.selectedJobLevels.push(value.trim());
      this.jobLevelControl.setValue(this.selectedJobLevels);
      chipList._elementRef.nativeElement.querySelector('input').value = '';
      this.updateFilters()
    }
   
  }

  removeJobLevel(level: string) {
    const index = this.selectedJobLevels.indexOf(level);
    if (index >= 0) {
      this.selectedJobLevels.splice(index, 1);
      this.jobLevelControl.setValue(this.selectedJobLevels);
    
    }
    this.updateFilters()
  }


  @ViewChild('input') inputElement!: ElementRef;
  @ViewChild('input1') inputElement1!: ElementRef;
  @ViewChild('input2') inputElement2!: ElementRef;
  @ViewChild('input3') inputElement3!: ElementRef;
  @ViewChild('input4') inputElement4!: ElementRef;
  @ViewChild('input5') inputElement5!: ElementRef;
  panelOpenState: boolean = false;

  companyNameSuggestions: string[] = [];
  filteredSuggestions: string[] = [];
 
  filterSuggestions(query: string): void {
    // Filter the suggestions based on the search query
    this.filteredSuggestions = this.companyNameSuggestions
      .filter(suggestion =>
        suggestion.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 10); 
  }
 
  

  fetchSuggestions(): void {
    const url = 'https://api.vectordb.app/v1/auto/company/?';

    this.http.get<string[]>(url).subscribe(
      (response: string[]) => {
        // Assign the fetched suggestions to the companyNameSuggestions array
       
        
        this.companyNameSuggestions = response;
   
      },
      (error) => {
        console.error('Error fetching suggestions:', error);
      }
    );
  }
  addCompanyNameFromAuto(event: MatAutocompleteSelectedEvent): void {
    const value = event.option.viewValue;
    
    // Add the selected value to the list of selected items (chips)
    this.addCompanyName(value);
    
    // Reset the input value if the input element is available
    if (this.inputElement && this.inputElement.nativeElement) {
      this.inputElement.nativeElement.value = '';
    }
    
    // Here you can do whatever you want with the selected value
    
  }
  
  
// exclude company name
excludecompanySuggestions: string[] = [];
filteredexcludecompanySuggestions: string[]=[]
fetchexcludeCompanySuggestions(): void {
 const url = 'https://api.vectordb.app/v1/auto/company/?';

 this.http.get<string[]>(url).subscribe(
   (response: string[]) => {
     // Assign the fetched suggestions to the countrySuggestions array
    

     this.excludecompanySuggestions = response;
   },
   (error) => {
     console.error('Error fetching country suggestions:', error);
   }
 );
}


addExcludeCompanyName(value: string): void {

const names = value.split(',');

// Trim each name and add it to the includeCompanyName array
names.forEach(name => {
 const trimmedName = name.trim();
 if (trimmedName && !this.excludeCompanyName.includes(trimmedName)) {
   this.excludeCompanyName.push(trimmedName);
 }
});

// Reset the input value
if (this.inputElement1 && this.inputElement1.nativeElement) {
 this.inputElement1.nativeElement.value = '';
}

this.updateFilters();
}


addexcludeCompanyNameFromAuto(event: MatAutocompleteSelectedEvent): void {
const value = event.option.viewValue;

// Add the selected value to the list of selected items (chips)
this.addExcludeCompanyName(value);

// Reset the input value if the input element is available
if (this.inputElement1 && this.inputElement1.nativeElement) {
 this.inputElement1.nativeElement.value = '';
}

// Here you can do whatever you want with the selected value

}


filterexcludeCompanySuggestions(query: string): void {
this.filteredexcludecompanySuggestions = this.excludecompanySuggestions
 .filter(country => country.toLowerCase().includes(query.toLowerCase()))
 .slice(0, 10);
}












// suggestion for country
   countrySuggestions: string[] = [];
   filteredCountrySuggestions: string[]=[]
   fetchCountrySuggestions(): void {
    const url = 'https://api.vectordb.app/v1/auto/country/?';
  
    this.http.get<string[]>(url).subscribe(
      (response: string[]) => {
        // Assign the fetched suggestions to the countrySuggestions array
  
        this.countrySuggestions = response;
 
      },
      (error) => {
        console.error('Error fetching country suggestions:', error);
      }
    );
  }

  addCountry(value: string): void {
  
    const names = value.split(',');
    
    // Trim each name and add it to the includeCompanyName array
    names.forEach(name => {
      const trimmedName = name.trim();
      if (trimmedName && !this.includecountry.includes(trimmedName)) {
        this.includecountry.push(trimmedName);
      }
    });
    
    // Reset the input value
    if (this.inputElement2 && this.inputElement2.nativeElement) {
      this.inputElement2.nativeElement.value = '';
    }
    
    this.updateFilters();
  }

  addCountryNameFromAuto(event: MatAutocompleteSelectedEvent): void {
    const value = event.option.viewValue;
    
    // Add the selected value to the list of selected items (chips)
    this.addCountry(value);
    
    // Reset the input value if the input element is available
    if (this.inputElement2 && this.inputElement2.nativeElement) {
      this.inputElement2.nativeElement.value = '';
    }
    
    // Here you can do whatever you want with the selected value
    
  }

  
  filterCountrySuggestions(query: string): void {
    this.filteredCountrySuggestions = this.countrySuggestions
      .filter(country => country.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 10);
  }
  




// job title suggestions

  jobTitleSuggestions: string[] = [];
  filteredJobTitleSuggestions: string[] = [];
  fetchJobTitleSuggestions(): void {
    const url = 'https://api.vectordb.app/v1/auto/job/?';
  
    this.http.get<string[]>(url).subscribe(
      (response: string[]) => {
        this.jobTitleSuggestions = response;
      },
      (error) => {
        console.error('Error fetching job title suggestions:', error);
      }
    );
  }
  filterJobTitleSuggestions(query: string): void {
    this.filteredJobTitleSuggestions = this.jobTitleSuggestions
      .filter(jobTitle => jobTitle.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 10);
  }
    



  addJobTitle(value: string): void {
  
    const names = value.split(',');
    
    // Trim each name and add it to the includeCompanyName array
    names.forEach(name => {
      const trimmedName = name.trim();
      if (trimmedName && !this.includeJobTitles.includes(trimmedName)) {
        this.includeJobTitles.push(trimmedName);
      }
    });
    
    // Reset the input value
    if (this.inputElement4 && this.inputElement4.nativeElement) {
      this.inputElement4.nativeElement.value = '';
    }
    
    this.updateFilters();
  }
  addJobtitleNameFromAuto(event: MatAutocompleteSelectedEvent): void {
    const value = event.option.viewValue;
    
    // Add the selected value to the list of selected items (chips)
    this.addJobTitle(value);

    // Reset the input value if the input element is available
    if (this.inputElement4 && this.inputElement4.nativeElement) {
      this.inputElement4.nativeElement.value = '';
    }
    
    // Here you can do whatever you want with the selected value
    
  }




  excludejobTitleSuggestions: string[] = [];
  filteredexlcudeJobTitleSuggestions: string[] = [];
  addExcludeJobTitle(value: string): void {
  
    const names = value.split(',');
    
    // Trim each name and add it to the includeCompanyName array
    names.forEach(name => {
      const trimmedName = name.trim();
      if (trimmedName && !this.excludeJobTitles.includes(trimmedName)) {
        this.excludeJobTitles.push(trimmedName);
      }
    });
    
    // Reset the input value
    if (this.inputElement5 && this.inputElement5.nativeElement) {
      this.inputElement5.nativeElement.value = '';
    }
    
    this.updateFilters();
  }
  addExcludeJobtitleNameFromAuto(event: MatAutocompleteSelectedEvent): void {
    const value = event.option.viewValue;
    
   
    this.addExcludeJobTitle(value)
    // Reset the input value if the input element is available
    if (this.inputElement5 && this.inputElement5.nativeElement) {
      this.inputElement5.nativeElement.value = '';
    }
    
    // Here you can do whatever you want with the selected value
    
  }

  fetchexcludeJobTitleSuggestions(): void {
    const url = 'https://api.vectordb.app/v1/auto/job/?';
  
    this.http.get<string[]>(url).subscribe(
      (response: string[]) => {
        this.excludejobTitleSuggestions = response;
      },
      (error) => {
        console.error('Error fetching job title suggestions:', error);
      }
    );
  }
  filterexcludeJobTitleSuggestions(query: string): void {
    this.filteredexlcudeJobTitleSuggestions = this.excludejobTitleSuggestions
      .filter(jobTitle => jobTitle.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 10);
  }











// excludecountry suggesion


excludecountrySuggestions: string[] = [];
filteredexlcudecountrySuggestions: string[] = [];
addExcludecountry(value: string): void {

  const names = value.split(',');
  
  // Trim each name and add it to the includeCompanyName array
  names.forEach(name => {
    const trimmedName = name.trim();
    if (trimmedName && !this.excludeJobTitles.includes(trimmedName)) {
      this.excludeCountry.push(trimmedName);
    }
  });
  
  // Reset the input value
  if (this.inputElement3 && this.inputElement3.nativeElement) {
    this.inputElement3.nativeElement.value = '';
  }
  
  this.updateFilters();
}
addExcludecountryNameFromAuto(event: MatAutocompleteSelectedEvent): void {
  const value = event.option.viewValue;
  this.addExcludecountry(value)
  // Reset the input value if the input element is available
  if (this.inputElement3 && this.inputElement3.nativeElement) {
    this.inputElement3.nativeElement.value = '';
  }
  
  // Here you can do whatever you want with the selected value

}

fetchexcludecountrySuggestions(): void {
  const url = 'https://api.vectordb.app/v1/auto/country/?';

  this.http.get<string[]>(url).subscribe(
    (response: string[]) => {
      this.excludecountrySuggestions = response;
    },
    (error) => {
      console.error('Error fetching job title suggestions:', error);
    }
  );
}
filterexcludecountrySuggestions(query: string): void {
  this.filteredexlcudecountrySuggestions = this.excludecountrySuggestions
    .filter(jobTitle => jobTitle.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 10);
}







  }


