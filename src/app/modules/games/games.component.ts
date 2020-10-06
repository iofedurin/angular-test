import { Component, OnInit } from '@angular/core';
import { mergeMap, takeUntil } from "rxjs/operators";
import { FormControl } from "@angular/forms";
import { MatTableDataSource } from "@angular/material/table";
import { IGame } from "@modules/games/game/game.form";
import { API_Game_Result, GameService } from "@http/games";
import { MatDialog } from "@angular/material/dialog";
import { GameComponent, GameDialogData } from "@modules/games/game/game.component";
import { UnsubOnDestroy } from "@utils/classes";
import { filterStr } from "@utils/functions/filter-string";
import { MakeRequired } from "@utils/types/utility-types";
import { ConfirmDialogComponent } from "@modules/shared/confirm.dialog/confirm.dialog";
import { of } from "rxjs";
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from "@angular/material/core";
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from "@angular/material-moment-adapter";
import { API_Player_Result, PlayerService } from "@http/players";

type Filter = {
  name: string;
};

export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'MM/DD/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-games',
  templateUrl: './games.component.html',
  styleUrls: ['./games.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ]
})
export class GamesComponent extends UnsubOnDestroy implements OnInit {
  private filterValues: Filter = {
    name: '',
  };
  public nameFilter = new FormControl('');

  public dataSource = new MatTableDataSource<API_Game_Result>([]);
  public displayedColumns = ['id', 'name', 'genre', 'releaseDate', 'platform', 'developer', 'esrb', 'actions'];
  private playersList: API_Player_Result[] = [];

  constructor(
    private readonly dialog: MatDialog,
    private readonly gameService: GameService,
    private readonly playerService: PlayerService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.loadData();

    this.nameFilter.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe(value => {
      this.filterValues.name = value;
      this.dataSource.filter = JSON.stringify(this.filterValues);
    })
  }

  openGameDialog(game?: IGame) {
    const dialogRef = this.dialog.open<GameComponent, GameDialogData, API_Game_Result>(
      GameComponent,
      {
        data: {
          game,
          playerOptions: this.playersList,
        }
      });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(result => {
        if (!result) {
          return;
        }
        const index = this.dataSource.data.findIndex(item => item.id === result.id);
        if (index !== -1) {
          let data = this.dataSource.data;
          data.splice(index, 1, result);
          this.dataSource.data = data;
        } else {
          this.dataSource.data = [...this.dataSource.data, result];
        }
      });
  }

  public openDeleteDialog(player: MakeRequired<IGame, 'id'>) {
    const dialog = this.dialog.open(ConfirmDialogComponent, {
      data: `Confirm deleting game ${player.name}`
    })
    dialog.afterClosed()
      .pipe(
        takeUntil(this.unsubscribe$),
        mergeMap((res: boolean) => {
          if (!res) {
            return of(null)
          }
          return this.gameService.delete(player.id);
        }),
      )
      .subscribe(resp => {
        if (resp === null) {
          return;
        }
        this.dataSource.data = this.dataSource.data.filter(item => item.id !== player.id);
      });
  }

  private loadData() {
    this.gameService
      .getAll()
      .subscribe(result => {
        this.dataSource.data = result;
        this.dataSource.filterPredicate = this.createFilter();
      })
    this.playerService
      .getAll()
      .subscribe(result => {
        this.playersList = result;
      })
  }

  private createFilter(): (data: API_Game_Result, filter: string) => boolean {
    return (data: API_Game_Result, filter): boolean => {
      const searchTerms = JSON.parse(filter) as Filter;
      return filterStr(data.name, searchTerms.name);
    };
  }
}
