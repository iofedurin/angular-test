import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ConfirmDialogComponent } from "@modules/shared/confirm.dialog/confirm.dialog";
import { ESRBPipe } from "@modules/shared/pipes";


@NgModule({
  declarations: [ConfirmDialogComponent, ESRBPipe],
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
  ],
  exports: [ConfirmDialogComponent, ESRBPipe],
})
export class SharedModule {}
