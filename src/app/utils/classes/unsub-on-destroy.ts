import { OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

export class UnsubOnDestroy implements OnDestroy {
  protected unsubscribe$ = new Subject();

  public ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
