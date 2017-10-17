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
    setTimeout(() => {
      this.chart.ngOnChanges({});
    });
  }

  // returns array of objects - {data: Array<number>, label: string}

  getLabelValues(initData: Array<any>) {

    let data = initData;

    data = data.filter(item => this.filterByLabels(item.key, true))

    const parsedData = this.parseData(data)
    let resultREF = Object
      .keys(parsedData)
      .map( label => {
        if (!!this.filterByDeviation(parsedData[label]).length) {
          return {data: parsedData[label], label: label};
        }
      })
      .filter(i => i);

    if (resultREF.length === 0) {
      resultREF = [{data: [], label: ''}];
    }
    return resultREF;
  }

  parseData(data: Array<any> ) {
    return data
      .reduce((acc, item) => {
        return Object.assign(acc, {
          [item.key]: acc.hasOwnProperty(item.key) && acc[item.key] ?
            acc[item.key].concat(item[`${this.propertyToShow}`] || item.val) :
            Array.of(item[`${this.propertyToShow}`] || item.val)});
      }, {});
  }

  // returns an array of unique X-Axis values (time)
  getTimeStamps(data: Array<any>) {
    const timeStamps = data.map(item => new Date(item.minute).toTimeString().slice(0, 5));
    return Array.from(new Set(timeStamps));
  }

  // filtering switch-case handler. returns array of indexes of given array passed successfully
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

  // filter handler for labels strings | action = keep/remove
  filterByLabels(value, action: Boolean = true) {

    // action == true >> label is removed
    // action == false >> label is kept
    const labelPattern = action ? labelsToRemove : labelsToKeep;

    // labelPattern.forEach((label, i) => value.includes(labelPattern[i]) ? !action :  action);

    for (let i = 0; i < labelPattern.length; i++) {
      if (value.includes(labelPattern[i])) { return !action; }
    }
    return action;
  }

  resize() {
    if (this.lineChartData.length > 15) {
      return '129.3vh';
    }
  }

  constructor (private fetchDataService: FetchDataService) {}

  ngOnInit() {
    this.loadData();
  }

}
