import { Component, OnInit } from '@angular/core';
import { LeaveChartData, User, UserLeave, UserLeaveInterface } from 'src/app/interface/userInterface';
import { UserService } from '../user.service';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import * as d3 from "d3";
import * as d3Scale from 'd3-scale';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';
import { NgxSpinnerService } from "ngx-spinner";
import { AppService } from 'src/app/app.service';
@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit {
  usersList: Array<User> = [];
  displayUsersList: Array<User> = [];
  usersLeavesList: Array<UserLeave> = [];
  leaveChartData: Array<LeaveChartData> = [];
  width: number = 0;
  height: number = 0;
  margin = { top: 20, right: 20, bottom: 30, left: 40 };
  x: any;
  y: any;
  svg: any;
  g: any;
  displayModal: boolean = false;
  user: User = new User("", "", "", "", "", "", "", "", "", "");
  showInactive: boolean = false;
  isAdmin: boolean = false;
  constructor(private userService: UserService, private router: Router, private appService: AppService,
    private confirmationService: ConfirmationService, private messageService: MessageService, private spinner: NgxSpinnerService) {
    this.width = 900 - this.margin.left - this.margin.right;
    this.height = 500 - this.margin.top - this.margin.bottom;
  }
  ngOnInit(): void {
    this.spinner.show();
    this.GetUserDetails();
    this.GetUserLeaveDetails();
    this.appService.message.subscribe(response => {
      this.isAdmin = response;
    })
  }
  GetUserDetails(): void {
    let sessionData = sessionStorage.getItem("userData");

    if (sessionData != null) {
      this.usersList = JSON.parse(sessionData);
      this.usersList.sort((a, b) => (a.FirstName.toLowerCase() > b.FirstName.toLowerCase()) ? 1 : ((b.FirstName.toLowerCase() > a.FirstName.toLowerCase()) ? -1 : 0))
      this.displayUsersList = this.usersList.filter(z => z.Status == "Active");
    }
    else {
      this.userService.getUsers().subscribe(response => {
        this.usersList = response;
        this.usersList.sort((a, b) => (a.FirstName.toLowerCase() > b.FirstName.toLowerCase()) ? 1 : ((b.FirstName.toLowerCase() > a.FirstName.toLowerCase()) ? -1 : 0))
        sessionStorage.setItem("userData", JSON.stringify(this.usersList));
        this.displayUsersList = this.usersList.filter(z => z.Status == "Active");
      });
    }
  }

  GetUserLeaveDetails(): void {
    let leavesSessionData = sessionStorage.getItem("userLeaveData");
    if (leavesSessionData != null) {
      this.usersLeavesList = JSON.parse(leavesSessionData);
      this.usersLeavesList.sort((a: UserLeave, b: UserLeave) => {
        return new Date(a.StartDate).getTime() - new Date(b.StartDate).getTime();
      });
      this.PrepareChartData();
    } else {
      this.userService.getUserLeaves().subscribe(response => {
        this.usersLeavesList = response;
        this.usersLeavesList.sort((a: UserLeave, b: UserLeave) => {
          return new Date(a.StartDate).getTime() - new Date(b.StartDate).getTime();
        });
        sessionStorage.setItem("userLeaveData", JSON.stringify(this.usersLeavesList));
        this.PrepareChartData();
      })
    }
  }

  PrepareChartData(): void {
    d3.select("svg").remove();
    this.leaveChartData = [];
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const colors = ["#FFF000", "#66FF00", "#08E8DE", "#FF007F", "#FD3A4A",
      "#DB91EF", "#A7F432", "#87FF2A", "#E936A7", "#9C51B6", "#1560BD", "#FF878D"]
    for (let i = 0; i < 12; i++) {
      this.leaveChartData.push(new LeaveChartData(i, 0, monthNames[i], colors[i]));
    }
    if (this.usersLeavesList.length > 0) {
      let approvedLeaves = this.usersLeavesList.filter(z=>z.Status != 'Reject');
      approvedLeaves.forEach(data => {
        let startDate = new Date(data.StartDate);
        let endDate = new Date(data.EndDate);
        if (startDate.getMonth() != endDate.getMonth()) {
          let startMonthCount = 0;
          let endMonthCount = 0;
          const curDate = new Date(startDate.getTime());
          while (curDate <= endDate) {
            const dayOfWeek = curDate.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
              if (curDate.getMonth() == startDate.getMonth())
                startMonthCount++;
              else
                endMonthCount++;
            };
            curDate.setDate(curDate.getDate() + 1);
          }
          let month = startDate.getMonth();
          this.leaveChartData[month].NumberOfDays += startMonthCount;
          month = endDate.getMonth();
          this.leaveChartData[month].NumberOfDays += endMonthCount;
        }
        else {
          let month = startDate.getMonth();
          this.leaveChartData[month].NumberOfDays += data.NumberOfDays;
        }

      });
    }

    this.initSvg();
    this.initAxis();
    this.drawAxis();
    this.drawBars();
    setTimeout(() => {
      /** spinner ends after 2 seconds */
      this.spinner.hide();
    }, 800);
  }
  initSvg() {
    this.svg = d3.select('#barChart')
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', '0 0 900 530');
    this.g = this.svg.append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')
      .style('font', '14px');
  }

  initAxis() {
    this.x = d3Scale.scaleBand().rangeRound([0, this.width]).padding(0.1);
    this.y = d3Scale.scaleLinear().rangeRound([this.height, 0]);
    this.x.domain(this.leaveChartData.map((d) => d.NameOfMonth));
    let maxNum = d3Array.max(this.leaveChartData, (d) => d.NumberOfDays);
    let num = maxNum != undefined && maxNum > 30 ? maxNum : 30;
    this.y.domain([0, num]);
  }

  drawAxis() {
    this.g.append('g')
      .attr('class', 'axis-x')
      .attr('transform', 'translate(0,' + this.height + ')')
      .attr('font-size', '14')
      .call(d3Axis.axisBottom(this.x));
    this.g.append('g')
      .attr('class', 'axis axis--y')
      .call(d3Axis.axisLeft(this.y))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '0.71em')
      .attr('text-anchor', 'end')
      .text('Number of Days');
  }

  drawBars() {
    this.g.selectAll('.bar')
      .data(this.leaveChartData)
      .enter().append('rect')
      .attr('x', (d: any) => this.x(d.NameOfMonth))
      .attr('y', (d: any) => this.y(d.NumberOfDays))
      .attr('width', this.x.bandwidth())
      .attr('fill', (d: any) => d.BarColor)
      .attr('height', (d: any) => this.height - this.y(d.NumberOfDays))
      .text((d: any) => d.NumberOfDays);

    this.g
      .selectAll(".text")
      .data(this.leaveChartData)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("x", (d: any) => this.x(d.NameOfMonth))
      .attr("y", (d: any) => this.y(d.NumberOfDays))
      .attr("dx", "1em")
      .text((d: any) => d.NumberOfDays);


  }
  AddNewUser(): void {
    this.router.navigate(['/addUser'])
  }

  DeleteUser(employeeCode: string): void {
    this.confirmationService.confirm({
      message: 'Are you sure that you want to delete this user?',
      accept: () => {
        this.spinner.show();
        this.userService.deleteUserLeaves(employeeCode).subscribe(response => {
          let user = this.usersList.findIndex(z => z.EmployeeCode == employeeCode)
          this.usersList.splice(user, 1);
          this.usersLeavesList = response;
          sessionStorage.setItem("userLeaveData", JSON.stringify(this.usersLeavesList));
          this.PrepareChartData();
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'User deleted successfully!' })
          sessionStorage.setItem("userData", JSON.stringify(this.usersList));
        })
      }
    });
  }
  ApplyLeave(employeeCode: string): void {
    this.router.navigate(['applyLeave/' + employeeCode])
  }

  ViewUser(employeeCode: string): void {
    this.userService.getUserDetails(employeeCode).subscribe(response => {
      this.user = response;
      this.displayModal = true;

    })
  }
  showInactiveUsers() {
    let sessionData = sessionStorage.getItem("userData");
    if (sessionData != null) {
      this.displayUsersList = JSON.parse(sessionData);
      this.displayUsersList.sort((a, b) => (a.FirstName.toLowerCase() > b.FirstName.toLowerCase()) ? 1 : ((b.FirstName.toLowerCase() > a.FirstName.toLowerCase()) ? -1 : 0));
      if (!this.showInactive) {
        this.displayUsersList = this.displayUsersList.filter(z => z.Status == "Active");
      }
    }
  }

  UpdateLeaveStatus(employeecode: string, leaveId: number, status: string) {
    this.spinner.show();
    this.userService.updateUserLeaveDetails(leaveId, status).subscribe(response => {
      if (response) {
        if (status == "Reject") {
          let user = this.usersList.filter(z => z.EmployeeCode == employeecode)[0];
          let userLeave = this.usersLeavesList.filter(z => z.LeaveId == leaveId)[0];
          if (user != null) {
            let leaveBalance = 0
            switch (userLeave.LeaveType) {
              case "AnnualLeave": {
                leaveBalance = user[userLeave.LeaveType] + userLeave.NumberOfDays;
                break;
              }
              case "SickLeave": {
                leaveBalance = user[userLeave.LeaveType] + userLeave.NumberOfDays;
                break;
              }
              case "UnpaidLeave": {
                leaveBalance = user[userLeave.LeaveType] - userLeave.NumberOfDays;
                break;
              }
              case "PaternalLeave": {
                leaveBalance = user[userLeave.LeaveType] + userLeave.NumberOfDays;
                break;
              }
              case "MaternityLeave": {
                leaveBalance = user[userLeave.LeaveType] + userLeave.NumberOfDays;
                break;
              }
            }
            this.userService.updateUserLeaveBalanceDetails(employeecode, userLeave.LeaveType, leaveBalance).subscribe(response => {
              if (response) {
                this.GetUserDetails();
                this.GetUserLeaveDetails();
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Leave status updated successfully!' })
      
              } else {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'An error occured while updating the details.' });
              }
            })
          }
        }
        else {
          this.GetUserDetails();
          this.GetUserLeaveDetails();
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Leave status updated successfully!' })
        }
      } else {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'An error occured while updating the details.' });
      }
    })
  }
}
