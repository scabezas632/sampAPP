import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';

@Injectable()
export class DatabaseProvider {

  apiUrl = 'http://localhost:3000';

  constructor(public http: HttpClient) {
    console.log('Hello DatabaseProvider Provider');
  }
 
  getData(primer: Boolean) {
    return new Promise(resolve => {
      this.http.get(this.apiUrl+'/datos').subscribe((data:any) => {
        if (primer) {
          resolve(data.datos);
        } else{
          resolve(data.datos[data.datos.length - 1]);
        }
      }, err => {
        console.log(err);
      });
    });
  }
  
}
