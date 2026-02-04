import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class PasswordValidators {
  static minLength(length: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      return control.value.length >= length
        ? null
        : { minLength: { requiredLength: length, actualLength: control.value.length } };
    };
  }

  static hasUpperCase(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      return /[A-Z]/.test(control.value) ? null : { hasUpperCase: true };
    };
  }

  static hasLowerCase(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      return /[a-z]/.test(control.value) ? null : { hasLowerCase: true };
    };
  }

  static hasSpecialCharacter(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      return /[^a-zA-Z0-9]/.test(control.value) ? null : { hasSpecialCharacter: true };
    };
  }

  static matchesField(fieldName: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.parent) {
        return null;
      }
      const matchingControl = control.parent.get(fieldName);
      if (!matchingControl) {
        return null;
      }
      return control.value === matchingControl.value ? null : { mismatch: true };
    };
  }
}
