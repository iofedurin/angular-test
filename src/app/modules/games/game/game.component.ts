import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { UnsubOnDestroy } from "@utils/classes";
import { GENRES, PLATFORMS } from "@utils/types";
import { GameForm, IGame } from "@modules/games/game/game.form";
import { GameService } from "@http/games";
import { ESRB_RATINGS } from "@utils/constants";
import { MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";
import { API_Player_Result } from "@http/players";
import { map, startWith, takeUntil } from "rxjs/operators";
import { FormControl } from "@angular/forms";
import { combineLatest, Observable } from "rxjs";
import moment from "moment";

export type GameDialogData = {
  game: IGame | undefined,
  playerOptions: API_Player_Result[],
}

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent extends UnsubOnDestroy implements OnInit {
  readonly gameForm: GameForm;

  public readonly initGamePlayers: API_Player_Result[] = [];
  public gamePlayers: API_Player_Result[] = [];

  public esrbRatings = ESRB_RATINGS;
  public genres = GENRES;
  public platforms = PLATFORMS;

  public availablePlayerOptions: API_Player_Result[] = [];
  public playerSearchControl = new FormControl();
  public filteredOptions: Observable<API_Player_Result[]> = new Observable();

  constructor(
    private readonly gameService: GameService,
    private readonly dialogRef: MatDialogRef<GameComponent>,
    @Inject(MAT_DIALOG_DATA) private readonly data: GameDialogData,
  ) {
    super();
    this.gameForm = new GameForm(data.game);
    // init game selection options
    const newOptions = data.game?.id ? data.playerOptions.filter(option => {
      return option.platform === data.game!.platform;
    }) : data.playerOptions;
    this.updateAvailableGameOptions(newOptions);
    // change available game options on platform/age change
    combineLatest<[string, number]>([
      this.gameForm.platform.valueChanges.pipe(startWith(data.game?.platform ?? '')),
      this.gameForm.esrbRating.valueChanges.pipe(startWith(data.game?.esrbRating ?? 0)),
    ])
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(value => {
        const [platform, esrb] = value;

        const platformAndESRBFilter = (player: API_Player_Result) => {
          return player.platform === platform && player.age >= esrb;
        }
        this.gamePlayers = this.gamePlayers.filter(platformAndESRBFilter);
        const newOptions = data.playerOptions.filter(platformAndESRBFilter);
        this.updateAvailableGameOptions(newOptions);
      })
  }

  ngOnInit(): void {
    this.loadPlayers();
  }

  private async create() {
    const game = await this.gameService.create(this.gameForm.json).toPromise();
    await this.gameService.addPlayersToGame(game.id, this.gamePlayers.map(item => item.id));
    return this.gameService.create(this.gameForm.json);
  }

  private async update() {
    const playersToDelete = this.initGamePlayers.filter(initPlayer => !this.gamePlayers.includes(initPlayer)).map(item => item.id);
    if (playersToDelete.length) {
      await this.gameService.removePlayersFromGame(this.gameForm.id!, playersToDelete).toPromise();
    }
    const playersToAdd = this.gamePlayers.filter(player => !this.initGamePlayers.includes(player)).map(item => item.id);
    if (playersToAdd.length) {
      await this.gameService.addPlayersToGame(this.gameForm.id!, playersToAdd).toPromise();
    }
    return await this.gameService.update(this.gameForm.id!, this.gameForm.json).toPromise();
  }

  private loadPlayers() {
    if (this.gameForm.id) {
      this.gameService.getGamePlayers(this.gameForm.id)
        .subscribe(resp => {
          this.gamePlayers = resp;
          this.initGamePlayers.push(...resp);
          const newOptions = this.availablePlayerOptions.filter(option => !resp.map(item => item.id).includes(option.id));
          this.updateAvailableGameOptions(newOptions);
        });
    }
  }

  private updateOptionFiltering() {
    const filterByNickname = (nickname: string): API_Player_Result[] => {
      const filterValue = nickname.toLowerCase();

      return this.availablePlayerOptions
        .filter(option => option.nickname.toLowerCase().indexOf(filterValue) === 0);
    }

    this.filteredOptions = this.playerSearchControl.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.nickname),
        map(nickname => {
          return nickname ? filterByNickname(nickname) : this.availablePlayerOptions.slice()
        })
      );
  }

  private updateAvailableGameOptions(newOptions: API_Player_Result[]) {
    this.availablePlayerOptions = newOptions;
    this.updateOptionFiltering();
  }

  // Template functions
  public async save() {
    const game = await (this.gameForm.id ? this.update() : this.create());
    this.dialogRef.close(game);
  }

  public onPlayerSelect(event: MatAutocompleteSelectedEvent) {
    const game = event.option.value as API_Player_Result;
    this.gamePlayers.push(game);
    this.playerSearchControl.setValue('');
    const newOptions = this.availablePlayerOptions.filter(option => option.id !== game.id);
    this.updateAvailableGameOptions(newOptions);
  }

  public deletePlayer(index: number, player: API_Player_Result) {
    this.gamePlayers.splice(index, 1);
    const newOptions = [...this.availablePlayerOptions, player];
    this.updateAvailableGameOptions(newOptions);
  }

  public displayFn(player: API_Player_Result) {
    return player && player.nickname ? player.nickname : '';
  }

  public notReleased() {
    return moment(this.gameForm.releaseDate.value).diff(moment()) > 0;
  }
}
