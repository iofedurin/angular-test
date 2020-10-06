import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PlayersRoutingModule } from './players-routing.module';
import { PlayersComponent } from './players.component';
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatTableModule } from "@angular/material/table";

import { PlayerComponent } from "./player/player.component";
import { MatInputModule } from "@angular/material/input";
import { ReactiveFormsModule } from "@angular/forms";
import { MatDialogModule } from "@angular/material/dialog";
import { APIModule } from "@http/http.module";
import { SharedModule } from "@modules/shared/shared.module";
import { MatSelectModule } from "@angular/material/select";
import { MatAutocompleteModule } from "@angular/material/autocomplete";


@NgModule({
  declarations: [PlayersComponent, PlayerComponent],
  imports: [
    CommonModule,
    PlayersRoutingModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatInputModule,
    MatDialogModule,
    APIModule,
    SharedModule,
    MatSelectModule,
    MatAutocompleteModule,
  ]
})
export class PlayersModule { }
