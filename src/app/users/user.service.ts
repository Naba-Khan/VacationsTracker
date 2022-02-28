import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { UserInterface, UserLeaveInterface } from '../interface/userInterface';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }
  private jsonURl = "./assets/userData.json";
  private leaveDataURl = "./assets/userLeaveData.json"

  public getUsers(): Observable<any> {
    return this.http.get(this.jsonURl).pipe(map((response: any) => response));
  }
  public getUserLeaves(): Observable<any> {
    return this.http.get(this.leaveDataURl).pipe(map((response: any) => response));
  }
  public getGenderTypes(): Observable<any> {
    let gender: any = ["Female", "Male", "Non-binary", "Transgender", "Intersex", "Prefer not to say"];
    return of(gender);
  }

  public getMaritalStatuses(): Observable<any> {
    let maritalStatus: any = ["Single", "Married", "Widowed", "Separated", "Divorced"];
    return of(maritalStatus);
  }
  public getUserDetails(employeeCode: string): Observable<any> {
    let sessionData = sessionStorage.getItem("userData");
    if (sessionData != null) {
      let usersList: Array<UserInterface> = JSON.parse(sessionData);
      let userDetails = usersList.filter(z => z.EmployeeCode == employeeCode)[0];
      return of(userDetails);
    }
    return of(null);
  }
  public saveUserDetails(user: UserInterface): Observable<any> {
    let sessionData = sessionStorage.getItem("userData");
    let usersList: Array<UserInterface> = [];
    if (sessionData != null) {
      usersList = JSON.parse(sessionData);
    }
    usersList.push(user)
    sessionStorage.setItem("userData", JSON.stringify(usersList))
    return of(true);
  }

  public updateUserDetails(user: UserInterface): Observable<any> {
    let sessionData = sessionStorage.getItem("userData");
    if (sessionData != null) {
      let usersList: Array<UserInterface> = JSON.parse(sessionData);
      let index = usersList.findIndex(z => z.EmployeeCode == user.EmployeeCode);
      if (index > -1) {
        usersList[index] = user;
        sessionStorage.setItem("userData", JSON.stringify(usersList));
        return of(true);
      } else {
        return of(false);
      }
    }
    return of(false);
  }

  public getLeaveTypes(gender: string): Observable<any> {
    let leaveTypes: any = [{ "Name": "Annual Leave", "LeaveType": "AnnualLeave" },
    { "Name": "Sick Leave", "LeaveType": "SickLeave" },
    { "Name": "Unpaid Leave", "LeaveType": "UnpaidLeave" },
    { "Name": "Paternal Leave", "LeaveType": "PaternalLeave" },
    { "Name": "Maternity Leave", "LeaveType": "MaternityLeave" },
    ];
    if (gender == "Male") {
      let index = leaveTypes.findIndex((z: { Name: string; }) => z.Name == "Maternity Leave");
      if (index > -1)
        leaveTypes.splice(index, 1)
    } else if (gender == "Female") {
      let index = leaveTypes.findIndex((z: { Name: string; }) => z.Name == "Paternal Leave");
      if (index > -1)
        leaveTypes.splice(index, 1)
    }
    return of(leaveTypes);
  }

  public saveUserLeaveDetails(userLeave: UserLeaveInterface): Observable<any> {
    let sessionData = sessionStorage.getItem("userLeaveData");
    let usersLeaveList: Array<UserLeaveInterface> = [];
    if (sessionData != null) {
      usersLeaveList = JSON.parse(sessionData);
    }
    usersLeaveList.push(userLeave)
    sessionStorage.setItem("userLeaveData", JSON.stringify(usersLeaveList))
    return of(true);
  }

  public updateUserLeaveDetails(leaveId: number, status: string): Observable<any> {
    let sessionData = sessionStorage.getItem("userLeaveData");
    if (sessionData != null) {
      let usersLeaveList: Array<UserLeaveInterface> = JSON.parse(sessionData);
      let index = usersLeaveList.findIndex(z => z.LeaveId == leaveId);
      if (index > -1) {
        usersLeaveList[index].Status = status;
        sessionStorage.setItem("userLeaveData", JSON.stringify(usersLeaveList));
        return of(true);
      } else {
        return of(false);
      }
    }
    return of(false);
  }

  public updateUserLeaveBalanceDetails(employeeCode: string, leaveType: string, balanceDays: number): Observable<any> {

    let sessionData = sessionStorage.getItem("userData");
    if (sessionData != null) {
      let usersList = JSON.parse(sessionData);
      let userDetails = usersList.filter((z: { EmployeeCode: string; }) => z.EmployeeCode == employeeCode)[0];
      if (userDetails != null) {
        userDetails[leaveType] = balanceDays;
        sessionStorage.setItem("userData", JSON.stringify(usersList));
        return of(true);
      } else {
        return of(false);
      }
    }

    return of(false);
  }
  public deleteUserLeaves(employeeCode: string): Observable<any> {
    let sessionData = sessionStorage.getItem("userLeaveData");
    let usersLeaveList: Array<UserLeaveInterface> = [];
    if (sessionData != null) {
      usersLeaveList = JSON.parse(sessionData);
      if (usersLeaveList.length > 0) {
        let userLeaves = usersLeaveList.filter(z => z.EmployeeCode == employeeCode);
        if (userLeaves != null && userLeaves.length > 0) {
          for (let i = 0; i < userLeaves.length; i++) {
            let index = usersLeaveList.indexOf(userLeaves[i]);
            if (index > -1) {
              usersLeaveList.splice(index, 1);
            }
          }
          sessionStorage.setItem("userLeaveData", JSON.stringify(usersLeaveList));
          return of(usersLeaveList);
        }
      }
    }
    return of(usersLeaveList);
  }

  public getLeavesOfUser(employeeCode: string): Observable<any> {
    let sessionData = sessionStorage.getItem("userLeaveData");
    let usersLeaveList: Array<UserLeaveInterface> = [];
    let userLeaves: Array<UserLeaveInterface> = [];
    if (sessionData != null) {
      usersLeaveList = JSON.parse(sessionData);
      if (usersLeaveList.length > 0) {
        userLeaves = usersLeaveList.filter(z => z.EmployeeCode == employeeCode);
      }
    }
    return of(userLeaves);
  }
}
