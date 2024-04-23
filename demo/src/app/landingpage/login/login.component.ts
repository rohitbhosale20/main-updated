import { Component, EventEmitter, NgZone, OnInit, Output, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GetDataService } from 'src/app/mainpage/sidenavfolders/search/people/get-data.service';
import { AuthService } from 'src/app/auth.service';
import { SocialAuthService } from '@abacritt/angularx-social-login';
import { Subscription } from 'rxjs';

declare global {
  interface Window {
    google: any;
  }
}
declare var google :any
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  private router=inject(Router)
  ngOnInit(): void {
    this.authService.initGoogleAuth();
 

google.accounts.id.initialize({
  client_id:'722454344204-4on4luc4s799mpb77gkrhr0p3ebuq8n8.apps.googleusercontent.com',
  callback:(resp:any)=> this.handleLogin1(resp),
})

google.accounts.id.renderButton(document.getElementById("google-btnn"),{
  theme:'filled_blue',
  size:'large',
  shape:'rectangular',
  width:350
})
  }
  hide = true;
  myReactiveForm: FormGroup;

  constructor(private fb: FormBuilder,  private ngZone: NgZone,private authServices: SocialAuthService,private  apiService: GetDataService,private snackbar:MatSnackBar,private authService: AuthService) {
    this.myReactiveForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }
     

  OnSubmit() {
    const emailControl = this.myReactiveForm.get('email');
    const passwordControl = this.myReactiveForm.get('password');
  
    if (emailControl && passwordControl && emailControl.valid && passwordControl.valid) {
      this.apiService.loginUser(this.myReactiveForm.value).subscribe(
        (response: any) => {
          // console.log('Successfully handled the response:', response);
  
          localStorage.setItem('password', response.password);
  
          if (response.user && response.user.email && response.user.firstName && response.user.lastName && response.user.api_key && response.user.credit ) {
            localStorage.setItem('email', response.user.email);
            localStorage.setItem('firstName', response.user.firstName);
            localStorage.setItem('lastName', response.user.lastName);
            localStorage.setItem('api_key', response.user.api_key);
            localStorage.setItem('credit', response.user.credit);
           
            this.snackbar.open('You have logged in successfully', 'Close', {
              duration: 4000,
            });
            this.router.navigate(['home']);
          } else {
            console.error('Invalid response format:', response);
          }
        },
        (error) => {
          console.error('Error occurred during login:', error);
          if (error.status === 401) {
            this.snackbar.open('Invalid email or password. Please try again.', 'Close', {
              duration: 4000,
            });
          } else if (error.status === 404) {
            this.snackbar.open('User not found. Please register or check your credentials.', 'Close', {
              duration: 4000,
            });
          } else {
            this.snackbar.open('An error occurred. Please try again later.', 'Close', {
              duration: 4000,
            });
          }
        }
      );
    } else {
      this.myReactiveForm.markAllAsTouched();
      this.snackbar.open('Please enter a valid email and password.', 'Close', {
        duration: 4000,
      });
    }
  }


  
  private decodeToken1(token:string){
    return JSON.parse(atob(token.split(".")[1]))
  }
    handleLogin1(respon:any){
      if(respon){
  const payload=this.decodeToken1(respon.credential);
  sessionStorage.setItem("loggedInuser", JSON.stringify(payload))
  
   // Extract user data from the payload
   const userData = {
    email: payload.email,
    firstName: payload.given_name,
    lastName: payload.family_name,
    // Add other relevant fields as needed
  };
  
  // Send user data to backend for storage
  this.apiService.loginUser(userData).subscribe(
    (registrationResponse: any) => {
      console.log(registrationResponse, 'User registered successfully');
    
    },
    (error: any) => {
      console.error(error);
    
    }
  );
  this.ngZone.run(() => {
    this.router.navigate(['home/firstPage'])
  });
      }
    }

}
