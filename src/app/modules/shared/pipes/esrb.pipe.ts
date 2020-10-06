import { Pipe, PipeTransform } from '@angular/core';
import { ESRB_RATINGS } from "@utils/constants";

@Pipe({ name: 'esrb' })
export class ESRBPipe implements PipeTransform {
  transform(value: number): string | number {
    return ESRB_RATINGS.find(item => item.minAge === value)?.name ?? value;
  }
}
