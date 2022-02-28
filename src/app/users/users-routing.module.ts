import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AddEditUserComponent } from './add-edit-user/add-edit-user.component';
import { LeaveApplicationComponent } from './leave-application/leave-application.component';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';

const routes: Routes = [
  {   path: '',   component: UserDashboardComponent   },
  {   path: 'addUser',   component: AddEditUserComponent   },
  {   path: 'editUser/:employeeCode',   component: AddEditUserComponent   },
  {   path: 'applyLeave/:employeeCode',   component: LeaveApplicationComponent   }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class UsersRoutingModule { }
