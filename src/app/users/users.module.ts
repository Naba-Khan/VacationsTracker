import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { UsersRoutingModule } from './users-routing.module';
import { UserService } from './user.service';
import { LayoutModule } from '@angular/cdk/layout';
import {MatToolbarModule} from '@angular/material/toolbar';
import {TableModule} from 'primeng/table';
import {CardModule} from 'primeng/card';
import { AddEditUserComponent } from './add-edit-user/add-edit-user.component';
import {CalendarModule} from 'primeng/calendar';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {ConfirmationService} from 'primeng/api';
import { LeaveApplicationComponent } from './leave-application/leave-application.component';
import { DialogModule } from 'primeng/dialog';
import {InputSwitchModule} from 'primeng/inputswitch';
import { AppService } from '../app.service';

@NgModule({
  declarations: [
    UserDashboardComponent,
    AddEditUserComponent,
    LeaveApplicationComponent
  ],
  imports: [
    CommonModule,UsersRoutingModule,TableModule,CardModule,LayoutModule,CalendarModule,
    MatToolbarModule,FormsModule,ReactiveFormsModule,ConfirmDialogModule,DialogModule,InputSwitchModule
  ],
  providers:[UserService,ConfirmationService,AppService],
  exports:[UserDashboardComponent]
})
export class UsersModule { }
