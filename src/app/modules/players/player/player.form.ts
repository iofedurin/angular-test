import {
  AbstractControlOptions,
  AsyncValidatorFn,
  FormControl,
  FormGroup,
  ValidatorFn, Validators
} from "@angular/forms";
import { PLATFORM } from "@utils/types";
import { API_Player_Payload } from "@http/players";

export interface IPlayer {
  id?: number;
  nickname: string;
  age: number;
  phone: string;
  email: string;
  platform: PLATFORM;
}

const nicknameRegEx = /^\w+$/;
const phoneNumberRegEx = /^(\+7|7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/;

export const nicknameValidators: ValidatorFn[] = [Validators.pattern(nicknameRegEx), Validators.required];
export const phoneValidators: ValidatorFn[] = [Validators.pattern(phoneNumberRegEx), Validators.required];
export const emailValidators: ValidatorFn[] = [Validators.email, Validators.required];

export class PlayerForm extends FormGroup {
  readonly id: number | null;

  constructor(
    player?: IPlayer,
    validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null,
    asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null
  ) {
    const controls: { [P in keyof Omit<IPlayer, 'id'>]: FormControl } = {
      nickname: new FormControl(player?.nickname, nicknameValidators),
      age: new FormControl(player?.age ?? 0, [Validators.pattern(/^\d+$/), Validators.min(0), Validators.max(99), Validators.required]),
      phone: new FormControl(player?.phone ?? null, phoneValidators),
      email: new FormControl(player?.email ?? null, emailValidators),
      platform: new FormControl(player?.platform ?? null, Validators.required),
    };
    super(controls, validatorOrOpts, asyncValidator);

    this.id = player?.id ?? null;
  }

  get nickname() {
    return this.get('nickname') as FormControl;
  }

  get age() {
    return this.get('age') as FormControl;
  }

  get phone() {
    return this.get('phone') as FormControl;
  }

  get email() {
    return this.get('email') as FormControl;
  }

  get platform() {
    return this.get('platform') as FormControl;
  }

  get games() {
    return this.get('games') as FormControl;
  }

  get json(): Omit<API_Player_Payload, 'id'> {
    return {
      nickname: this.nickname.value,
      age: this.age.value,
      phone: this.phone.value,
      email: this.email.value,
      platform: this.platform.value,
    }
  }
}
