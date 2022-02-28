import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { User, UserLeave, UserLeaveInterface } from 'src/app/interface/userInterface';
import { UserService } from '../user.service';

@Component({
  selector: 'app-leave-application',
  templateUrl: './leave-application.component.html',
  styleUrls: ['./leave-application.component.css']
})
export class LeaveApplicationComponent implements OnInit {
  leaveTypes: any = [];
  employeeCode: any;
  user!: User;
  userLeave!: UserLeave;
  leaveApplicationForm!: FormGroup;
  leaveBalance = 0;
  startDate: any;
  endDate: any;
  vacationDates: Array<Date> = [];
  userAppliedLeaves: Array<UserLeaveInterface> = [];
  constructor(private userService: UserService, private router: Router, private route: ActivatedRoute, private messageService: MessageService, private fb: FormBuilder) {
    this.formValidation();
  }

  formValidation() {
    this.leaveApplicationForm = this.fb.group({
      leaveType: ['', [Validators.required]],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required]
    });
  }
  ngOnInit(): void {
    this.employeeCode = this.route.snapshot.params['employeeCode'];
    if (this.employeeCode != null && this.employeeCode != undefined) {
      this.userService.getUserDetails(this.employeeCode).subscribe(response => {
        if (response != null) {
          this.user = response;
          let date = new Date();
          date.setHours(0, 0, 0, 0);
          if (date.getDay() == 0) {
            date.setDate(date.getDate() + 1);
          } else if (date.getDay() == 6) {
            date.setDate(date.getDate() + 2);
          }
          this.startDate = new Date(date.getTime());
          this.endDate = new Date(date.getTime());
          let leaveId = Math.floor(Math.random() * 9000000);
          this.userLeave = new UserLeave(leaveId, this.user.EmployeeCode, this.user.FirstName, this.user.LastName, "", "", 0, "", "");
          this.userService.getLeaveTypes(this.user.Gender).subscribe(res => {
            this.leaveTypes = res;
            this.leaveApplicationForm.disable();
            this.leaveApplicationForm.controls["leaveType"].enable();
          });
          this.userService.getLeavesOfUser(this.employeeCode).subscribe(response => {
            this.vacationDates = [];
            if (response != null && response.length > 0) {
              response.forEach((data: UserLeave) => {
                this.vacationDates = this.vacationDates.concat(this.GetLeaveAppliedDates(new Date(data.StartDate), new Date(data.EndDate)));
              })
            }
          })

        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'An error occured while fetching the user details.' });
          this.leaveApplicationForm.disable();
        }
      })
    }
  }
  GetLeaveAppliedDates(startDate: Date, endDate: Date): Date[] {
    let includedDates = [];
    const curDate = new Date(startDate.getTime());
    while (curDate <= endDate) {
      includedDates.push(new Date(curDate.getTime()));
      curDate.setDate(curDate.getDate() + 1);
    }
    return includedDates;
  }
  LeaveTypeSelected() {
    let date = new Date();
    date.setHours(0, 0, 0, 0);
    if (date.getDay() == 0) {
      date.setDate(date.getDate() + 1);
    } else if (date.getDay() == 6) {
      date.setDate(date.getDate() + 2);
    }
    this.startDate = new Date(date.getTime());
    this.endDate = new Date(date.getTime());
    this.userLeave.NumberOfDays = 0;

    if (this.userLeave.LeaveType == "") {
      this.leaveApplicationForm.disable();
      this.leaveApplicationForm.controls["leaveType"].enable();
    }
    else {
      this.leaveApplicationForm.enable();
      switch (this.userLeave.LeaveType) {
        case "AnnualLeave":
          this.leaveBalance = this.user.AnnualLeave;
          break;
        case "SickLeave":
          this.leaveBalance = this.user.SickLeave;
          break;
        case "UnpaidLeave":
          this.leaveBalance = this.user.UnpaidLeave;
          break;
        case "PaternalLeave":
          this.leaveBalance = this.user.PaternalLeave;
          break;
        case "MaternityLeave":
          this.leaveBalance = this.user.MaternityLeave;
          break;
      }
    }
  }
  Save() {
    this.leaveApplicationForm.markAllAsTouched();
    if (this.leaveApplicationForm.invalid) {
      return;
    } else {
      if (this.startDate > this.endDate) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'From date and time cannot be greater than to date and time.' });
        return;
      } else if (this.userLeave.LeaveType != "UnpaidLeave" && this.userLeave.NumberOfDays > this.leaveBalance) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'The number of vacation days are exceeding the balance days.' });
        return;
      } else {
        let selectedDuration = this.GetLeaveAppliedDates(this.startDate, this.endDate);
        let conflictsInDuration = false;
        for (let i = 0; i < selectedDuration.length; i++) {
          if (!conflictsInDuration)
            for (let j = 0; j < this.vacationDates.length; j++) {
              if (selectedDuration[i].getTime() == this.vacationDates[j].getTime()) {
                conflictsInDuration = true;
                break;
              }
            }
          else
            break;
        }

        if (conflictsInDuration) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'The selected duration of leaves conflicts with other applied leaves.' });
          return;
        } else {
          this.userLeave.StartDate = this.startDate.toISOString();
          this.userLeave.EndDate = this.endDate.toISOString();
          this.userService.saveUserLeaveDetails(this.userLeave).subscribe(response => {
            if (response) {
              let remainingDays = this.leaveBalance - this.userLeave.NumberOfDays;
              if (this.userLeave.LeaveType == "UnpaidLeave") {
                remainingDays = this.leaveBalance + this.userLeave.NumberOfDays
              }
              this.userService.updateUserLeaveBalanceDetails(this.employeeCode, this.userLeave.LeaveType, remainingDays).subscribe(response => {
                setTimeout(() => {
                  this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Leave applied successfully' });
                }, 1);
                this.router.navigate(['/'])
              })
            }
          });
        }
      }
    }
  }
  DateSelected(): void {
    if (this.userLeave.LeaveType != "") {
      if (this.startDate > this.endDate) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'From date and time cannot be greater than to date and time.' });
        return;
      } else {
        this.userLeave.NumberOfDays = this.getBusinessDatesCount(this.startDate, this.endDate);
      }
    }
  }
  getBusinessDatesCount(startDate: Date, endDate: Date): number {
    let count = 0;
    const curDate = new Date(startDate.getTime());
    while (curDate <= endDate) {
      const dayOfWeek = curDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) count++;
      curDate.setDate(curDate.getDate() + 1);
    }
    return count;
  }
  Reset(): void {
    let date = new Date();
    date.setHours(0, 0, 0, 0);
    if (date.getDay() == 0) {
      date.setDate(date.getDate() + 1);
    } else if (date.getDay() == 6) {
      date.setDate(date.getDate() + 2);
    }
    this.startDate = new Date(date.getTime());
    this.endDate = new Date(date.getTime());
    let leaveId = Math.floor(Math.random() * 9000000);
    this.userLeave = new UserLeave(leaveId, this.user.EmployeeCode, this.user.FirstName, this.user.LastName, "", "", 0, "", "");
    this.leaveApplicationForm.disable();
    this.leaveApplicationForm.controls["leaveType"].enable();
    this.leaveApplicationForm.markAsPristine();
    this.leaveApplicationForm.markAsUntouched();
  }

  Cancel(): void {
    this.router.navigate(['/'])
  }

}
