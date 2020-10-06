import urljoin from 'url-join';

import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { API_Player_Payload, API_Player_Result } from './player.types';
import { environment } from "@env";
import { forkJoin, Observable, of } from "rxjs";
import { API_Game_Result } from "@http/games";
import { mergeMap } from "rxjs/operators";
import { PlayersToGamesMTM } from "@http/types";

type JSONServerManyToManyWithGameExpand = PlayersToGamesMTM & {
  game: API_Game_Result,
}

@Injectable()
export class PlayerService {
  private readonly urlPath = urljoin(environment.apiHost, 'players');
  private readonly manyToManyUrlPath = urljoin(environment.apiHost, 'manyToMany');

  constructor(private readonly httpClient: HttpClient) {
  }

  getAll(): Observable<API_Player_Result[]> {
    return this.httpClient.get<API_Player_Result[]>(this.urlPath);
  }

  getPlayerGames(id: number): Observable<API_Game_Result[]> {
    return this.httpClient.get<JSONServerManyToManyWithGameExpand[]>(
      urljoin(this.manyToManyUrlPath, '?_expand=game', `&playerId=${id}`)
    )
      .pipe(
        mergeMap(item => {
          return of(item.map(manyToMany => manyToMany.game))
        })
      );
  }

  addGamesToPlayer(playerId: number, gameIds: number[]) {
    const payloads: Pick<JSONServerManyToManyWithGameExpand, 'playerId' | 'gameId'>[] = gameIds.map(gameId => {
      return {
        playerId,
        gameId,
      }
    })
    return forkJoin(...payloads.map(payload => {
      return this.httpClient.post<PlayersToGamesMTM>(this.manyToManyUrlPath, payload);
    }));
  }

  removeGamesFromPlayer(playerId: number, gameIds: number[]) {
    const observables = gameIds.map(gameId => {
      return this.httpClient.get<PlayersToGamesMTM[]>(urljoin(this.manyToManyUrlPath, `?gameId=${gameId}`, `?playerId=${playerId}`))
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

  create(payload: API_Player_Payload): Observable<API_Player_Result> {
    return this.httpClient.post<API_Player_Result>(this.urlPath, payload);
  }

  update(id: number, payload: API_Player_Payload): Observable<API_Player_Result> {
    return this.httpClient.put<API_Player_Result>(urljoin(this.urlPath, String(id)), payload)
  }

  delete(id: number) {
    return this.httpClient.delete(urljoin(this.urlPath, String(id)));
  }
}
