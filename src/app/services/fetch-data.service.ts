import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class FetchDataService {

  constructor(private http: Http) { }
  getStatsData(url) {
    return this.http
      .get('http://js.rabota.com.ua/nlb/' + url + '.json?v=' + Date.now())
      .map(response => response.json());
  }
}
