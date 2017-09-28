import {Component, OnInit, ViewChild} from '@angular/core';
import {FetchDataService} from './services/fetch-data.service';
import {BaseChartDirective} from 'ng2-charts';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})


export class AppComponent implements OnInit {
  @ViewChild(BaseChartDirective) chart: BaseChartDirective;

  initialData = [];
  loaded = false;
  curDeviationMethod: any = 'average';
  curDeviationValue: Number = 10;

  // nesting data for a chart
  public lineChartData: Array<any>;
  public lineChartLabels: Array<any>;
  public lineChartColors: Array<any>;
  public lineChartOptions: any = {responsive: true};
  public lineChartLegend = true;
  public lineChartType = 'bar';

  // data populating
  loadData() {
    this.fetchDataService.getKeyPages().subscribe(data => {
      this.initialData = data;
      this.lineChartData = this.getLabelValues(data);
      this.lineChartLabels = this.getTimeStamps(data);
      this.loaded = true;

      // console.log('DATA', new Date(data[0].minute));
      // console.log('Array', this.getLabelValues(this.initialData).length );
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

    // this.lineChartColors = this.getChartColors(this.lineChartData);
    setTimeout(() => {
      this.chart.ngOnChanges({});
    });
  }

  // returns array of objects. Each object = LABEL (page name) + ARRAY of values for corresponding label
  // filtered with current deviation method & value
  getLabelValues(data: Array<any>) {

    // TODO avoid bullshit & optimize

    // TODO encapsulate filtering & data parsing

    // skipped label names with string pattern
    function stringFilter(value) {
      const prohibitedLabels = [
        'dummy default name %@',
        'Disk',
        'Output Cache',
        'Health Ping',
        'Request Execution',
        'Requests Queued',
        'Request Bytes',
        'Processor Queue',
        'Active Threads',
        'Head Requests',
        'Delete Request',
        'Error',
        'indices',
        '_all'
      ];
      for (let i = 0; i < prohibitedLabels.length; i++) {
        if (value.includes(prohibitedLabels[i])) { return false; }
      }
      return true;
    }

    let labels = data.map(item => item['key']);
    labels =  Array.from(new Set(labels)).filter(page => stringFilter(page));

    let result = (
      labels.map(page => {
        const pageValues = data.filter(item => item.key === page).map(item => item.val);
        if (!!this.filterByDeviation(pageValues).length) {
          return {data: pageValues, label: page};
        }
      }).filter(item => item) // WTF?!
    );
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

    switch (this.curDeviationMethod) {
      case 'median':
        criteria = array.slice(0).sort()[Math.round(array.length / 2)];
        break;

      case 'average':
        criteria = array.reduce( ( p, c ) => p + c, 0 ) / array.length;
        break;

      default:
        console.log('Deviation method was not recognised');
        break;
    }
    array.forEach((item, i) => {
      if ((Math.abs(item - criteria) / criteria) * 100 >= this.curDeviationValue) { indexes.push(i); }
    });

    return indexes;
  }


  constructor (private fetchDataService: FetchDataService) {}
  ngOnInit() {
    this.loadData();
  }
}
