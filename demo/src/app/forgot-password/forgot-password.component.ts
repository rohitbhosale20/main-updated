import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GetDataService } from '../mainpage/sidenavfolders/search/people/get-data.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  forgotPasswordForm!: FormGroup ;

  constructor(
    private formBuilder: FormBuilder,
    private forgotPasswordService: GetDataService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  resetPassword() {
    if (this.forgotPasswordForm.invalid) {
      return;
    }

    const email = this.forgotPasswordForm.value.email;
    this.forgotPasswordService.resetPassword(email).subscribe(
      () => {
        this.snackBar.open('Password reset email sent successfully.', 'Close', {
          duration: 5000,
        });
        // Optionally, you can redirect the user to a login page or a confirmation page.
      },
      (error:any) => {
        console.error('Error occurred during password reset:', error);
        let errorMessage = 'An error occurred. Please try again later.';
        if (error.status === 404) {
          errorMessage = 'User not found. Please check your email address.';
        }
        this.snackBar.open(errorMessage, 'Close', {
          duration: 5000,
        });
      }
    );
  }
}
