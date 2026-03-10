import { Validators } from '@angular/forms';

export const ProfileValidators = {
  username: [
    Validators.required,
    Validators.minLength(3),
    Validators.maxLength(30),
    Validators.pattern(/^[a-zA-Z0-9_-]+$/),
  ],

  name: [Validators.required, Validators.maxLength(50), Validators.pattern(/^[a-zA-ZÀ-ÿ\s'-]+$/)],

  phone: [Validators.required, Validators.pattern(/^\d{3}-\d{3}-\d{4}$/)],

  email: [
    Validators.required,
    Validators.email,
    Validators.maxLength(254),
    Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
  ],
};
