import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from "./layout/layout.component";


const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: '/players',
      },
      {
        path: 'players',
        loadChildren: () => import('@modules/players/players.module').then(m => m.PlayersModule),
      },
      {
        path: 'games',
        loadChildren: () => import('@modules/games/games.module').then(m => m.GamesModule),
      }
    ],
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
