import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
//import { MatDividerModule } from '@angular/material';
//import { IconModule } from '@wizdm/elements';
import { ContentResolver, 
         AuthGuardService, 
         PageGuardService } from '../../utils';
import { DashboardComponent } from './dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    resolve: { content: ContentResolver }, 
    data: { modules: ['dashboard'] },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ PageGuardService ],
  }
];

@NgModule({
  declarations: [ DashboardComponent ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    RouterModule.forChild(routes)
  ],
  exports: [ RouterModule ]
})
export class DashboardModule { }