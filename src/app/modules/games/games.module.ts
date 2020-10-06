import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GamesRoutingModule } from './games-routing.module';
import { GamesComponent } from './games.component';
import { GameComponent } from "@modules/games/game/game.component";
import { MatDialogModule } from "@angular/material/dialog";
import { MatSelectModule } from "@angular/material/select";
import { MatInputModule } from "@angular/material/input";
import { ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { APIModule } from "@http/http.module";
import { MatTableModule } from "@angular/material/table";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatMomentDateModule } from "@angular/material-moment-adapter";
import { SharedModule } from "@modules/shared/shared.module";
import { MatAutocompleteModule } from "@angular/material/autocomplete";


@NgModule({
  declarations: [GamesComponent, GameComponent],
  imports: [
    CommonModule,
    GamesRoutingModule,
    MatDialogModule,
    MatSelectModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    APIModule,
    MatTableModule,
    MatDatepickerModule,
    MatMomentDateModule,
    SharedModule,
    MatAutocompleteModule,
  ]
})
export class GamesModule { }
