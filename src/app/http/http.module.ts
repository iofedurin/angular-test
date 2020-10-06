import { NgModule } from "@angular/core";
import { HttpClientModule } from "@angular/common/http";
import { PlayerService } from "./players";
import { GameService } from "@http/games";

@NgModule({
  imports: [
    HttpClientModule,
  ],
  providers: [
    PlayerService,
    GameService,
  ],
})
export class APIModule {
}
