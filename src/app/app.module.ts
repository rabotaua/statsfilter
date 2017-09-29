// libraries
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { ChartsModule } from 'ng2-charts/ng2-charts';

// services
import { FetchDataService } from './services/fetch-data.service';

// components
import { AppComponent } from './app.component';
import { ChartBuilderComponent } from './chart-builder/chart-builder.component';
import { HomeComponent } from './home/home.component';

@NgModule({
  declarations: [
    AppComponent,
    ChartBuilderComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    ChartsModule
  ],
  providers: [
    FetchDataService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
