import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { BackArrowComponent } from '../../shared/ui/back-arrow/back-arrow.component';
import { LogoComponent } from '../../shared/ui/logo/logo.component';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { Router, RouterLink } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-sign-up',
  imports: [
    BackArrowComponent,
    LogoComponent,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatError,
    RouterLink,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css',
})
export class SignUpComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  protected readonly signUpForm = this.fb.group(
    {
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    },
    { validators: this.passwordMatchValidator },
  );

  protected onSignUp(): void {
    if (this.signUpForm.valid) {
      console.log(this.signUpForm.value);
      this.router.navigate(['/home']);
    }
  }

  private passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }
}
