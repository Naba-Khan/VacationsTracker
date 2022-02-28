import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { UsersModule } from './users/users.module';
import { HttpClientModule } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { LayoutModule } from '@angular/cdk/layout';
import {MatToolbarModule} from '@angular/material/toolbar';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ToastModule} from 'primeng/toast';
import {MessageService} from 'primeng/api';
import {DialogModule} from 'primeng/dialog';
import { NgxSpinnerModule } from "ngx-spinner";
import {InputSwitchModule} from 'primeng/inputswitch';
import { AppService } from './app.service';
import { FormsModule } from '@angular/forms';
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,BrowserAnimationsModule,NgxSpinnerModule,
    LayoutModule,MatToolbarModule,MatIconModule,ToastModule,DialogModule,
    UsersModule,FormsModule,
    HttpClientModule,
    AppRoutingModule,
    NoopAnimationsModule,InputSwitchModule
  ],
  providers: [MessageService,AppService],
  exports:[LayoutModule,MatToolbarModule],
  bootstrap: [AppComponent]
})
export class AppModule { }
