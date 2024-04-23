import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NotificationComponent } from 'src/app/notification/notification.component';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  
})
export class HomeComponent {
password: any;
userEmail: any;
userFirstName: any;
userLastName:any
dialogRef: any;
showLabels: boolean = false;
isSidenavOpened: boolean = true;
filters: any = { include_First_Name: '', include_Employee_Size: [], exclude_Employee_Size: [] };
searchInput:any

constructor(public dialog: MatDialog,private router:Router){

}







  ngOnInit(): void {


    
      // Retrieve user details from local storage
      this.userFirstName = localStorage.getItem('firstName');
      this.password = localStorage.getItem('password');
      this.userEmail = localStorage.getItem('email');
      this.userLastName=localStorage.getItem('lastName')
  }
  isNavbarCollapsed = true;

  toggleNavbar() {
    this.isNavbarCollapsed = !this.isNavbarCollapsed;
  }

  openUserDialog() {
    this.dialogRef = this.dialog.open(NotificationComponent,
      {
       
        height: '1050px',
        width: '450px',
        position: { right: '0px', top: '90px',bottom:'0px' }
      });

  
  }

  buttontoggle(){
    this.showLabels=false
  }

  logout() {
    // Clear user-related data from local storage
    localStorage.removeItem('email');
    localStorage.removeItem('firstName');
    localStorage.removeItem('lastName');

    // Navigate to the login page
    this.router.navigate(['login']);
  }

  performSearch() {
    // Gather filter values
    const filters = {
      include_First_Name: this.filters.include_First_Name,
      include_last_name: this.filters.include_last_name,
      // Add other filter properties
      searchInput: this.searchInput,
    };
  
    // Perform the search using the filters
    // Implement your search logic here
    console.log('Performing search with filters:', filters);
  }
  
   openNav(): void {
    const sidebar = document.getElementById("mySidebar");
    const main = document.getElementById("main");
    if (sidebar && main) {
      sidebar.style.width = "150px";
      sidebar.style.marginLeft='50px'
      main.style.marginLeft = "100px";
    }
  }
  
   closeNav(): void {
    const sidebar = document.getElementById("mySidebar");
    const main = document.getElementById("main");
    if (sidebar && main) {
      sidebar.style.width = "0";
      main.style.marginLeft = "0";
    }
  }
  
 
}
