import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import {
  emailValidators,
  IPlayer,
  nicknameValidators,
  phoneValidators,
  PlayerForm
} from "@modules/players/player/player.form";
import { PlayerService } from "@http/players";
import { UnsubOnDestroy } from "@utils/classes";
import { AbstractControl, FormControl, ValidatorFn } from "@angular/forms";
import { PLATFORMS } from "@utils/types";
import { combineLatest, Observable } from "rxjs";
import { API_Game_Result } from "@http/games";
import { map, startWith, takeUntil } from "rxjs/operators";
import { MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";

export type PlayerDialogData = {
  player: IPlayer | undefined,
  dynamicValidators: {
    nicknameValidator: (value: IPlayer['nickname']) => boolean,
    phoneValidator: (value: IPlayer['phone']) => boolean,
    emailValidator: (value: IPlayer['email']) => boolean,
  },
  gameOptions: API_Game_Result[]
}

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent extends UnsubOnDestroy implements OnInit {
  public readonly playerForm: PlayerForm;
  // we need this to detect later which games have been deleted
  public readonly initPlayerGames: API_Game_Result[] = [];
  public playerGames: API_Game_Result[] = [];

  public availableGameOptions: API_Game_Result[] = [];
  public gameSearchControl = new FormControl();
  public filteredOptions: Observable<API_Game_Result[]> = new Observable();

  public platforms = PLATFORMS;

  constructor(
    private readonly playerService: PlayerService,
    private readonly dialogRef: MatDialogRef<PlayerComponent>,
    @Inject(MAT_DIALOG_DATA) private readonly data: PlayerDialogData,
  ) {
    super();
    this.playerForm = new PlayerForm(data.player);
    // init game selection options
    if (data.player?.id) {
      this.availableGameOptions = data.gameOptions.filter(option => {
        return option.platform === data.player!.platform;
      })
    } else {
      this.availableGameOptions = data.gameOptions;
    }
    // change available game options on platform/age change
    combineLatest<[string, number]>([
      this.playerForm.platform.valueChanges.pipe(startWith(data.player?.platform ?? '')),
      this.playerForm.age.valueChanges.pipe(startWith(data.player?.age ?? 0)),
    ])
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(value => {
        const [platform, age] = value;

        const platformAndAgeFilter = (game: API_Game_Result) => {
          return game.platform === platform && game.esrbRating <= age;
        }
        this.playerGames = this.playerGames.filter(platformAndAgeFilter);
        const newOptions = this.data.gameOptions.filter(platformAndAgeFilter);
        this.updateAvailableGameOptions(newOptions);
      })
  }

  ngOnInit(): void {
    this.applyDynamicValidators();
    this.loadGames();
  }

  private async create() {
    const player = await this.playerService.create(this.playerForm.json).toPromise();
    await this.playerService.addGamesToPlayer(player.id, this.playerGames.map(item => item.id));
    return player;
  }

  private async update() {
    const gamesToDelete = this.initPlayerGames.filter(initGame => !this.playerGames.includes(initGame)).map(item => item.id);
    if (gamesToDelete.length) {
      await this.playerService.removeGamesFromPlayer(this.playerForm.id!, gamesToDelete).toPromise();
    }
    const gamesToAdd = this.playerGames.filter(game => !this.initPlayerGames.includes(game)).map(item => item.id);
    if (gamesToAdd.length) {
      await this.playerService.addGamesToPlayer(this.playerForm.id!, gamesToAdd).toPromise();
    }
    return await this.playerService.update(this.playerForm.id!, this.playerForm.json).toPromise();
  }

  private applyDynamicValidators() {
    const validators = this.data.dynamicValidators;

    const validateNickname: ValidatorFn = (control: AbstractControl) => {
      const isValid = validators.nicknameValidator(control.value);
      return isValid ? null : {
        duplicate: {
          value: control.value,
        },
      }
    }
    this.playerForm.nickname.setValidators([validateNickname, ...nicknameValidators])

    const validatePhone: ValidatorFn = (control: AbstractControl) => {
      const isValid = validators.phoneValidator(control.value);
      return isValid ? null : {
        duplicate: {
          value: control.value,
        },
      }
    }
    this.playerForm.phone.setValidators([validatePhone, ...phoneValidators])

    const validateEmail: ValidatorFn = (control: AbstractControl) => {
      const isValid = validators.emailValidator(control.value);
      return isValid ? null : {
        duplicate: {
          value: control.value,
        },
      }
    }
    this.playerForm.email.setValidators([validateEmail, ...emailValidators])
  }

  private loadGames() {
    if (this.playerForm.id) {
      this.playerService.getPlayerGames(this.playerForm.id)
        .subscribe(resp => {
          this.playerGames = resp;
          this.initPlayerGames.push(...resp);
          const newOptions = this.availableGameOptions.filter(option => !resp.map(item => item.id).includes(option.id));
          this.updateAvailableGameOptions(newOptions);
        });
    }
  }

  private updateOptionFiltering() {
    const filterByName = (name: string): API_Game_Result[] => {
      const filterValue = name.toLowerCase();

      return this.availableGameOptions
        .filter(option => option.name.toLowerCase().indexOf(filterValue) === 0);
    }

    this.filteredOptions = this.gameSearchControl.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.name),
        map(name => name ? filterByName(name) : this.availableGameOptions.slice())
      );
  }

  private updateAvailableGameOptions(newOptions: API_Game_Result[]) {
    this.availableGameOptions = newOptions;
    this.updateOptionFiltering();
  }

  // Template functions
  public async save() {
    const player = await (this.playerForm.id ? this.update() : this.create());
    this.dialogRef.close(player);
  }

  public onGameSelect(event: MatAutocompleteSelectedEvent) {
    const game = event.option.value as API_Game_Result;
    this.playerGames.push(game);
    this.gameSearchControl.setValue('');
    const newOptions = this.availableGameOptions.filter(option => option.id !== game.id);
    this.updateAvailableGameOptions(newOptions);
  }

  public deleteGame(index: number, game: API_Game_Result) {
    this.playerGames.splice(index, 1);
    const newOptions = [...this.availableGameOptions, game];
    this.updateAvailableGameOptions(newOptions);
  }

  public displayFn(game: API_Game_Result) {
    return game && game.name ? game.name : '';
  }
}
