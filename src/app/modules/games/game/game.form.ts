import {
  AbstractControlOptions,
  AsyncValidatorFn,
  FormControl,
  FormGroup,
  ValidatorFn, Validators
} from "@angular/forms";
import { GENRE, PLATFORM } from "@utils/types";
import { API_Game_Payload } from "@http/games";

export interface IGame {
  id?: number;
  name: string;
  genre: GENRE;
  releaseDate: Date;
  platform: PLATFORM;
  developer: string;
  esrbRating: number;
}


export class GameForm extends FormGroup {
  readonly id: number | null;

  constructor(
    game?: IGame,
    validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null,
    asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null
  ) {
    const controls: { [P in keyof Omit<IGame, 'id'>]: FormControl } = {
      name: new FormControl(game?.name, Validators.required),
      genre: new FormControl(game?.genre ?? null, Validators.required),
      releaseDate: new FormControl(game?.releaseDate ?? null, Validators.required),
      platform: new FormControl(game?.platform ?? null, Validators.required),
      developer: new FormControl(game?.developer ?? null, Validators.required),
      esrbRating: new FormControl(game?.esrbRating ?? null, Validators.required),
    };
    super(controls, validatorOrOpts, asyncValidator);

    this.id = game?.id ?? null;
  }

  get name() {
    return this.get('name') as FormControl;
  }

  get genre() {
    return this.get('genre') as FormControl;
  }

  get releaseDate() {
    return this.get('releaseDate') as FormControl;
  }

  get platform() {
    return this.get('platform') as FormControl;
  }

  get developer() {
    return this.get('developer') as FormControl;
  }

  get esrbRating() {
    return this.get('esrbRating') as FormControl;
  }

  get json(): Omit<API_Game_Payload, 'id'> {
    return {
      name: this.name.value,
      genre: this.genre.value,
      releaseDate: this.releaseDate.value,
      platform: this.platform.value,
      developer: this.developer.value,
      esrbRating: this.esrbRating.value,
    }
  }
}
