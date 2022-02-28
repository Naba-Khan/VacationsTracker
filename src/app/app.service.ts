import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class AppService {

  constructor() { }

  message = new Subject<boolean>();

  sendMessage(value: boolean): void {
    this.message.next(value);
  }
}
