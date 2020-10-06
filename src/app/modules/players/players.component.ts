import { Component, OnInit } from '@angular/core';
import { MatDialog } from "@angular/material/dialog";
import { PlayerComponent, PlayerDialogData } from "@modules/players/player/player.component";
import { IPlayer } from "@modules/players/player/player.form";
import { API_Player_Result, PlayerService } from "@http/players";
import { MatTableDataSource } from "@angular/material/table";
import { ConfirmDialogComponent } from "@modules/shared/confirm.dialog/confirm.dialog";
import { MakeRequired } from "@utils/types/utility-types";
import { mergeMap, takeUntil } from "rxjs/operators";
import { UnsubOnDestroy } from "@utils/classes";
import { of } from "rxjs";
import { FormControl } from "@angular/forms";
import { filterStr } from "@utils/functions/filter-string";
import { API_Game_Result, GameService } from "@http/games";
import moment from "moment";


type Filter = {
  nickname: string;
};

@Component({
  selector: 'app-players',
  templateUrl: './players.component.html',
  styleUrls: ['./players.component.scss']
})
export class PlayersComponent extends UnsubOnDestroy implements OnInit {
  private filterValues: Filter = {
    nickname: '',
  };
  public nicknameFilter = new FormControl('');

  public dataSource = new MatTableDataSource<API_Player_Result>([]);
  public displayedColumns = ['id', 'nickname', 'age', 'phone', 'email', 'platform', 'actions'];
  private gamesList: API_Game_Result[] = [];

  constructor(
    private readonly dialog: MatDialog,
    private readonly playerService: PlayerService,
    private readonly gameService: GameService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.loadData();

    this.nicknameFilter.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe(value => {
      this.filterValues.nickname = value;
      this.dataSource.filter = JSON.stringify(this.filterValues);
    })
  }

  public openPlayersDialog(player?: IPlayer) {
    const dataWithoutPlayer = player ? this.dataSource.data.filter(item => item.id !== player.id) : this.dataSource.data;

    const dialogRef = this.dialog
      .open<PlayerComponent, PlayerDialogData>(PlayerComponent, {
        data: {
          player,
          dynamicValidators: {
            nicknameValidator: (nick => {
              // console.log(nick, dataWithoutPlayer.map(item => item.nickname));
              return !dataWithoutPlayer.some(item => item.nickname === nick);
            }),
            phoneValidator: (phone => {
              return !dataWithoutPlayer.some(item => item.phone === phone);
            }),
            emailValidator: (email => {
              return !dataWithoutPlayer.some(item => item.email === email);
            }),
          },
          gameOptions: this.gamesList.filter(game => {
            return moment(game.releaseDate).diff(moment()) < 0;
          }),
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

  public openDeleteDialog(player: MakeRequired<IPlayer, 'id'>) {
    const dialog = this.dialog.open(ConfirmDialogComponent, {
      data: `Confirm deleting player ${player.nickname}`
    })
    dialog.afterClosed()
      .pipe(
        takeUntil(this.unsubscribe$),
        mergeMap((res: boolean) => {
          if (!res) {
            return of(null)
          }
          return this.playerService.delete(player.id);
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
    this.playerService
      .getAll()
      .subscribe(result => {
        this.dataSource.data = result;
        this.dataSource.filterPredicate = this.createFilter();
      })
    this.gameService
      .getAll()
      .subscribe(result => {
        this.gamesList = result;
      })
  }

  private createFilter(): (data: API_Player_Result, filter: string) => boolean {
    return (data: API_Player_Result, filter): boolean => {
      const searchTerms = JSON.parse(filter) as Filter;
      return filterStr(data.nickname, searchTerms.nickname);
    };
  }
}
