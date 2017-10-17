import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {BaseChartDirective} from 'ng2-charts';
import {FetchDataService} from '../services/fetch-data.service';
import { labelsToRemove, labelsToKeep } from '../chartInputConst/LABELS';

@Component({
  selector: 'app-chart-builder',
  templateUrl: './chart-builder.component.html',
  styleUrls: ['./chart-builder.component.css']
})
export class ChartBuilderComponent implements OnInit {

  @Input() dataUrl: String;
  @Input() propertyToShow: String;
  @ViewChild(BaseChartDirective) chart: BaseChartDirective;
  initialData = [];
  loaded = false;
  curDeviationMethod: any = 'median';
  curDeviationValue: Number = 0;

  // chard setting and data nesting
  public lineChartData: Array<any>;
  public lineChartLabels: Array<any>;
  public lineChartColors: Array<any>;
  public lineChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    scaledisplay: false,
    scales: {
      xAxes: [
        {
          display: false
        }
      ]
    },
    tooltips: {
      mode: 'x'
    },

  };
  public lineChartLegend = true;
  public lineChartType = 'bar';

  // data populating
  loadData() {
    this.fetchDataService.getStatsData(this.dataUrl).subscribe(data => {
      this.initialData = data;
      this.updateChart();
      this.loaded = true;

      // this.lineChartColors = this.getChartColors(this.lineChartData);
    });
  }

  // event handlers
  setDeviationValue(value) {
    this.curDeviationValue = value;
    this.updateChart();
  }
  setDeviationMethod(event) {
    this.curDeviationMethod = event.target.value;
    this.updateChart();
  }
  updateChart() {
    this.lineChartData = this.getLabelValues(this.initialData);
    this.lineChartLabels = this.getTimeStamps(this.initialData);
    // this.lineChartLabels = this.getTimeStamps(this.initialData);

    setTimeout(() => {
      this.chart.ngOnChanges({});
    });
  }

  // returns array of objects. Each object = LABEL (page name) + ARRAY of values for corresponding label

  getLabelValues(data: Array<any>) {

    // TODO avoid bullshit & optimize

    // TODO encapsulate filtering & data parsing

    // filter labels: value = string to be checked | action = keep/remove
    function filterLabels(value, action: Boolean = true) {

      // action == true >> label is removed
      // action == false >> label is kept
      const labelPattern = action ? labelsToRemove : labelsToKeep;

      // labelPattern.forEach((label, i) => value.includes(labelPattern[i]) ? !action :  action);

      for (let i = 0; i < labelPattern.length; i++) {
        if (value.includes(labelPattern[i])) { return !action; }
      }
      return action;
    }

    let labels = data.map(item => item['key']);
    labels =  Array.from(new Set(labels)).filter(page => filterLabels(page, true));


    let result = (
      labels.map(page => {
        const pageValues = data
          .filter(item => item.key === page)
          .map(item => item[`${this.propertyToShow}`] || item.val);

        if (!!this.filterByDeviation(pageValues).length) {
          return {data: pageValues, label: page};
        }
      }).filter(item => item) // WTF?!
    );
    if (result.length === 0) {
      result = [{data: [], label: ''}];
    }
    return result;
  }

  // returns an array of unique X-Axis values (time)
  getTimeStamps(data: Array<any>) {
    const timeStamps = data.map(item => new Date(item.minute).toLocaleTimeString());
    return Array.from(new Set(timeStamps));
  }

  // filtering switch-case handler
  filterByDeviation(array: Array<any>) {

    let criteria = 0;
    let indexes = [];
    function sum (arr) {
      return arr.reduce( ( p, c ) => p + c, 0 );
    }
    function getPercentDeviation (value, threshold) {
      array.forEach((item, i) => {
        if ((Math.abs(item - value) / value) * 100 >= threshold) { indexes.push(i); }
      });
    }
    function getAbsoluteDeviation (value, threshold) {
      array.forEach((item, i) => {
        if (item - value >= threshold) { indexes.push(i); }
      });
    }

    switch (this.curDeviationMethod) {
      case 'median':
        criteria = array.slice(0).sort()[Math.round(array.length / 2)];
        getPercentDeviation(criteria, this.curDeviationValue);
        break;

      case 'average':
        criteria = sum(array) / array.length;
        getPercentDeviation(criteria, this.curDeviationValue);
        break;

      case 'standard':
        const avg =  sum(array) / array.length; // average value
        const sqArr = array.map(x => (x - avg) * (x - avg)); // square deviation array
        const sigma =  Math.sqrt(sum(sqArr) / array.length) * 3; // sigma calculation
        getAbsoluteDeviation(sigma, this.curDeviationValue);
        break;

      default:
        console.log('Deviation method was not recognised');
        break;
    }
    return indexes;
  }

  resize() {
    if (this.lineChartData.length > 15) {
      return '132.2vh';
    }
  }

  constructor (private fetchDataService: FetchDataService) {}

  ngOnInit() {
    this.loadData();
  }

}
