import { Injectable } from "@angular/core";
import urljoin from "url-join";
import { environment } from "@env";
import { HttpClient } from "@angular/common/http";
import { forkJoin, Observable, of } from "rxjs";
import { API_Game_Payload, API_Game_Result } from "@http/games/game.types";
import { mergeMap } from "rxjs/operators";
import { PlayersToGamesMTM } from "@http/types";
import { API_Player_Result } from "@http/players";

type JSONServerManyToManyWithPlayerExpand = PlayersToGamesMTM & {
  player: API_Player_Result,
}

@Injectable()
export class GameService {
  private readonly urlPath = urljoin(environment.apiHost, 'games');
  private readonly manyToManyUrlPath = urljoin(environment.apiHost, 'manyToMany');

  constructor(private readonly httpClient: HttpClient) {
  }

  getAll(): Observable<API_Game_Result[]> {
    return this.httpClient.get<API_Game_Result[]>(this.urlPath);
  }

  getGamePlayers(id: number): Observable<API_Player_Result[]> {
    return this.httpClient.get<JSONServerManyToManyWithPlayerExpand[]>(
      urljoin(this.manyToManyUrlPath, '?_expand=player', `&gameId=${id}`)
    )
      .pipe(
        mergeMap(item => {
          return of(item.map(manyToMany => manyToMany.player))
        })
      );
  }

  addPlayersToGame(gameId: number, playerIds: number[]) {
    const payloads: Pick<JSONServerManyToManyWithPlayerExpand, 'playerId' | 'gameId'>[] = playerIds.map(playerId => {
      return {
        playerId,
        gameId,
      }
    })
    return forkJoin(...payloads.map(payload => {
      return this.httpClient.post<PlayersToGamesMTM>(this.manyToManyUrlPath, payload);
    }));
  }

  removePlayersFromGame(gameId: number, playerIds: number[]) {
    const observables = playerIds.map(playerId => {
      return this.httpClient.get<PlayersToGamesMTM[]>(urljoin(this.manyToManyUrlPath, `?playerId=${playerId}`, `?gameId=${gameId}`))
        .pipe(
          mergeMap(resp => {
            const itemToDelete = resp[0];
            if (!itemToDelete) {
              return of();
            }
            return this.httpClient.delete(urljoin(this.manyToManyUrlPath, String(itemToDelete.id)));
          })
        )
    })
    return forkJoin(observables);
  }

  create(payload: API_Game_Payload): Observable<API_Game_Result> {
    return this.httpClient.post<API_Game_Result>(this.urlPath, payload);
  }

  update(id: number, payload: API_Game_Payload): Observable<API_Game_Result> {
    return this.httpClient.put<API_Game_Result>(urljoin(this.urlPath, String(id)), payload)
  }

  delete(id: number) {
    return this.httpClient.delete(urljoin(this.urlPath, String(id)));
  }
}
