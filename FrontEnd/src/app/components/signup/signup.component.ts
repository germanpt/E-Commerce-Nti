import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SignupData } from '../../models/user.model';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent {
  signupForm: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(2)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    image: new FormControl('', [this.urlValidator]),
    location: new FormControl(''),
  });

  locationForm: FormGroup = new FormGroup({
    label: new FormControl('', [Validators.required]),
    address: new FormControl('', [Validators.required]),
  });

  error = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  urlValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value || control.value === '') {
      return null;
    }
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    return urlPattern.test(control.value) ? null : { invalidUrl: true };
  }

  get name() {
    return this.signupForm.get('name');
  }

  get email() {
    return this.signupForm.get('email');
  }

  get password() {
    return this.signupForm.get('password');
  }

  get image() {
    return this.signupForm.get('image');
  }

  get label() {
    return this.locationForm.get('label');
  }

  get address() {
    return this.locationForm.get('address');
  }

  createLocation(): void {
    if (this.locationForm.invalid) {
      this.markFormGroupTouched(this.locationForm);
      return;
    }
    console.log(this.locationForm.value);
    this.signupForm.patchValue({
      location: this.locationForm.value,
    });
    this.locationForm.reset();
  }

  signup(): void {
    this.error = '';

    this.markFormGroupTouched(this.signupForm);

    if (this.signupForm.invalid) {
      this.error = 'Please fill in all required fields correctly.';
      return;
    }

    const nameParts = this.signupForm.value.name?.trim().split(/\s+/) || [];
    if (nameParts.length < 2) {
      this.error = 'Please enter your full name (first and last name).';
      return;
    }

    this.loading = true;

    const fullName = nameParts.join(' ');

    const newUser: SignupData = {
      name: fullName,
      email: this.signupForm.value.email,
      password: this.signupForm.value.password,
    };

    this.authService.signup(newUser).subscribe({
      next: (res) => {
        console.log(res);
        this.signupForm.reset();
        this.locationForm.reset();
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.log(err);
        this.error = err.message || 'Signup failed. Please try again.';
        this.loading = false;
      },
    });

    console.log(newUser);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}
