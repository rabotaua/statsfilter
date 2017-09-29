import { Component, OnInit } from '@angular/core';
import { mainUrls } from '../chartInputConst/URLS';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  topPagesUrl = mainUrls;
  propertiesToShow = ['time', 'hits'];
  constructor() { }

  ngOnInit() {

  }

}
