export interface UserInterface {
    EmployeeCode: string;
    FirstName: string;
    LastName: string;
    DateOfJoining: string;
    DateOfBirth: string;
    Gender: string;
    MaritalStatus: string;
    Role: string;
    MobileNumber: string;
    Status: string;
    AnnualLeave: number;
    SickLeave: number;
    UnpaidLeave: number;
    PaternalLeave: number;
    MaternityLeave: number;
}

export class User {
    EmployeeCode: string;
    FirstName: string;
    LastName: string;
    DateOfJoining: string;
    DateOfBirth: string;
    Gender: string;
    MaritalStatus: string;
    Role: string;
    MobileNumber: string;
    Status: string;
    AnnualLeave: number;
    SickLeave: number;
    UnpaidLeave: number;
    PaternalLeave: number;
    MaternityLeave: number;
    constructor(EmployeeCode: string, FirstName: string, LastName: string,
        DateOfJoining: string, DateOfBirth: string, Gender: string, MaritalStatus: string,
        Role: string, MobileNumber: string, Status: string, AnnualLeave?: number, SickLeave?: number,
        UnpaidLeave?: number, PaternalLeave?: number, MaternityLeave?: number,) {
        this.EmployeeCode = EmployeeCode;
        this.FirstName = FirstName;
        this.LastName = LastName;
        this.DateOfBirth = DateOfBirth;
        this.DateOfJoining = DateOfJoining;
        this.Gender = Gender;
        this.MaritalStatus = MaritalStatus;
        this.Role = Role;
        this.MobileNumber = MobileNumber;
        this.Status = Status;
        this.AnnualLeave = AnnualLeave == undefined ? 30 : AnnualLeave;
        this.SickLeave = SickLeave== undefined ? 15 : SickLeave;
        this.UnpaidLeave = UnpaidLeave== undefined ? 0 : UnpaidLeave;
        this.PaternalLeave = PaternalLeave== undefined ? 5 : PaternalLeave;
        this.MaternityLeave = MaternityLeave== undefined ? 45 : MaternityLeave;

    }
}

export interface UserLeaveInterface {
    LeaveId:number;
    EmployeeCode: string;
    FirstName: string;
    LastName: string;
    Status: string;
    StartDate:string;
    EndDate:string;
    NumberOfDays:number;
    LeaveType:string;
}
export class UserLeave{
    LeaveId:number;
    EmployeeCode: string;
    FirstName: string;
    LastName: string;
    Status: string;
    StartDate:string;
    EndDate:string;
    NumberOfDays:number;
    LeaveType:string;
    constructor(LeaveId:number,EmployeeCode: string,FirstName: string,LastName: string,StartDate:string,EndDate:string,
        NumberOfDays:number,LeaveType:string,Status: string){
            this.LeaveId=LeaveId;
            this.EmployeeCode=EmployeeCode;
            this.FirstName=FirstName;
            this.LastName=LastName;
            this.StartDate=StartDate;
            this.EndDate=EndDate;
            this.NumberOfDays=NumberOfDays;
            this.LeaveType=LeaveType;
            this.Status=Status
        }
}
export class LeaveChartData{
    Month:number;
    NumberOfDays:number;
    NameOfMonth:string;
    BarColor:string;
    constructor(month:number,numberOfDays:number,nameOfMonth:string,barColor:string){
        this.Month=month;
        this.NumberOfDays= numberOfDays;
        this.NameOfMonth= nameOfMonth;
        this.BarColor=barColor;
    }
}