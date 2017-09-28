import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class FetchDataService {

  constructor(private http: Http) { }
  getKeyPages() {
    return this.http.get(`http://js.rabota.com.ua/nlb/sqlserver_general_statistics.json?v=` + Date.now())
      .map(response => response.json());
  }
}
