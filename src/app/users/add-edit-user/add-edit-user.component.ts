import { Component, OnInit } from '@angular/core';
import { User, UserInterface } from 'src/app/interface/userInterface';
import { FormGroup, FormsModule, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { UserService } from '../user.service';
@Component({
  selector: 'app-add-user',
  templateUrl: './add-edit-user.component.html',
  styleUrls: ['./add-edit-user.component.css']
})
export class AddEditUserComponent implements OnInit {
  user!: User;
  addUserForm!: FormGroup;
  employeeCode: string = "";
  Gender: any = [];
  MaritalStatus: any = [];
  isUpdate: boolean = false;
  usersList: Array<UserInterface> = [];
  dateOfJoining: any;
  dateOfBirth: any;
  maxDate = new Date();
  constructor(private fb: FormBuilder, private router: Router, private route: ActivatedRoute, private messageService: MessageService, private userService: UserService) {
    this.formValidation();
    this.user = new User("", "", "", "", "", "", "", "", "", "Active")
  }

  formValidation() {
    this.addUserForm = this.fb.group({
      employeeCode: ['', [Validators.required, Validators.pattern("([A-Za-z0-9]){4,50}")]],
      firstName: ['', [Validators.required, Validators.pattern("[A-Za-z]{1,50}")]],
      lastName: ['', [Validators.required, Validators.pattern("[A-Za-z]{1,50}")]],
      mobileNumber: ['', [Validators.required, Validators.pattern("^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\\s\\./0-9]*$")]],
      DateOfBirth: ['', Validators.required],
      DateOfJoining: ['', Validators.required],
      Role: ['', Validators.required],
      Gender: ['', Validators.required],
      MaritalStatus: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    let sessionData = sessionStorage.getItem("userData");
    if (sessionData != null) {
      this.usersList = JSON.parse(sessionData);
    }

    this.employeeCode = this.route.snapshot.params['employeeCode'];
    if (this.employeeCode != null && this.employeeCode != undefined) {

      this.userService.getUserDetails(this.employeeCode).subscribe(response => {
        if (response != null) {
          this.user = response;
          this.addUserForm.controls['employeeCode'].disable();
          this.dateOfBirth = new Date(this.user.DateOfBirth);
          this.dateOfJoining = new Date(this.user.DateOfJoining);
          this.isUpdate = true;
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'An error occured while fetching the user details.' });
          this.addUserForm.disable();
        }
      })
    }
    this.userService.getGenderTypes().subscribe(response => {
      this.Gender = response;
    });
    this.userService.getMaritalStatuses().subscribe(response => {
      this.MaritalStatus = response;
    });
  }
  Save(): void {
    this.addUserForm.markAllAsTouched();
    if (this.addUserForm.invalid) {
      return;
    }
    if (!this.ValidateForm()) {
      return;
    }
    this.user.DateOfBirth = this.dateOfBirth.toISOString();
    this.user.DateOfJoining = this.dateOfJoining.toISOString();
    if (this.isUpdate) {
      this.userService.updateUserDetails(this.user).subscribe(response => {
        if (response) {
          setTimeout(() => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'User details updated successfully' });
          }, 1);
          this.Reset();
          this.router.navigate(['/'])
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'An error occured while updating the user details.' });
        }
      })
    }
    else {
      this.userService.saveUserDetails(this.user).subscribe(response => {
        if (response) {
          setTimeout(() => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'User details added successfully' });
          }, 1)
          this.Reset();
          this.router.navigate(['/'])
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'An error occured while adding the user details.' });
        }
      })
    }
  }
  ValidateForm(): boolean {
    if (!this.isUpdate) {
      let userExists = this.usersList.filter(z => z.EmployeeCode == this.user.EmployeeCode);
      if (userExists != null && userExists.length > 0) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'User with employee code already exists.' });
        return false;
      }
    }
    if (this.dateOfBirth > this.dateOfJoining) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please select valid date of birth.' });
      return false;
    }
    if (this.dateOfBirth.getTime() == this.dateOfJoining.getTime()) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please select valid date of birth and date of joining.' });
      return false;
    }
    return true;
  }
  Reset(): void {

    this.addUserForm.markAsPristine();
    this.addUserForm.markAsUntouched();
    if (this.isUpdate) {
      this.user = this.usersList.filter(z => z.EmployeeCode == this.employeeCode)[0];
      this.dateOfBirth = new Date(this.user.DateOfBirth);
      this.dateOfJoining = new Date(this.user.DateOfJoining);
    }
    else {
      this.user = new User("", "", "", "", "", "", "", "", "", "Active");
      this.dateOfBirth = "";
      this.dateOfJoining = "";
    }
  }

  Cancel(): void {
    this.router.navigate(['/'])
  }

}
