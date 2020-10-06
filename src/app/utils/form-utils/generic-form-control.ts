import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';

export class GenericFormControl<T> extends FormControl {
  readonly value!: T;
  readonly valueChanges!: Observable<T>;

  setValue(value: T, options?: {
    onlySelf?: boolean;
    emitEvent?: boolean;
    emitModelToViewChange?: boolean;
    emitViewToModelChange?: boolean
  }): void {
    super.setValue(value, options);
  }

  patchValue(value: T, options?: {
    onlySelf?: boolean;
    emitEvent?: boolean;
    emitModelToViewChange?: boolean;
    emitViewToModelChange?: boolean
  }): void {
    super.patchValue(value, options);
  }
}
