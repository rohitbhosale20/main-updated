import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as ApexCharts from 'apexcharts';
import { GetDataService } from './search/people/get-data.service';
import { ApexOptions } from 'apexcharts';
import { Chart, ChartComponent } from 'chart.js';


export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  stroke: ApexStroke;
  title: ApexTitleSubtitle;
};
@Component({
  selector: 'app-firstpage',
  templateUrl: './firstpage.component.html',
  styleUrls: ['./firstpage.component.css']
})
export class FirstpageComponent  implements OnInit{
  activityDuration: number = 7;
  chart!: ApexCharts;
  public chartOptions: Partial<ApexOptions> = {};
  public timestampData: any;
 
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  ngOnInit(): void {
    // this.renderChart();
    this.fetchTimestampData();
    this.fetchData();
    this.createChart();
  }

  // renderChart(): void {
  //   // Simulated data for demonstration purposes
  //   const dataForDuration = this.getDataForDuration(this.activityDuration);

  //   const options = {
  //     series: dataForDuration,
  //     chart: {
  //       height: 200,
  //       type: 'line',
  //       id: 'userActivityChart'
  //     },
  //     toolbar: {
  //       show: false // Set toolbar option to false to hide the toolbar
  //     }
  //     // Other chart options...
  //   };

  //   this.chart = new ApexCharts(document.querySelector('#chart'), options);
  //   this.chart.render();
  // }

  // changeActivityDuration(duration: number): void {
  //   this.activityDuration = duration;

  //   // Update the series data based on the selected duration
  //   const dataForDuration = this.getDataForDuration(duration);
  //   this.chart.updateSeries(dataForDuration);
  // }

  // getDataForDuration(duration: number): any[] {
  //   // Simulated data for demonstration purposes
  //   const startDate = this.calculateStartDate(duration);
  //   const endDate = new Date(); 

  //   const data: any[] = [];

  //   // Assuming user IDs and their activity counts for demonstration
  //   const userIds = ['User1'];
  //   userIds.forEach(userId => {
  //     const seriesData = [];

  //     // Generate data for the specified duration
  //     for (let date = startDate; date <= endDate; date.setDate(date.getDate() + 1)) {
  //       const y = Math.floor(Math.random() * 100); // Random activity count for demonstration
  //       seriesData.push({ x: date.toISOString().split('T')[0], y });
  //     }

  //     data.push({ name: userId, type: 'line', data: seriesData }); // Use 'line' type for the series
  //   });

  //   return data;
  // }

  // calculateStartDate(duration: number): Date {
  //   const currentDate = new Date();
  //   const startDate = new Date(currentDate);
  //   startDate.setDate(startDate.getDate() - duration + 1); // Subtract duration days and add 1 day
  //   return startDate;
  // }



  chartSeries: any[] = [];
  constructor(private getDataService: GetDataService) { }

  fetchTimestampData(): void {
    this.getDataService.getTimestampData().subscribe(
      (data: any) => {
        this.timestampData = data;
        console.log(this.timestampData,'timestampdata in fecthtimestampData');
        this.chartOptions = {
          series: [
            {
              name: 'Timestamp Data',
              data: this.timestampData.map((item :any)=> item.date),
            }
          ],
          chart: {
            type: 'line',
            height: 350
          },
          xaxis: {
            categories: this.timestampData.map((item :any) => item.time),
          }
        };
      },
      (error: any) => {
        console.error('Error fetching timestamp data:', error);
      }
    );
  }

  fetchData() {
    this.getDataService.getTimestampData().subscribe(
      (data: any[]) => {
        this.timestampData = data;
        this.renderlineChart();
      },
      (error) => {
        console.error('Error fetching timestamp data:', error);
      }
    );
  }
  
  renderlineChart() {
    const labels = this.timestampData.map((item: any) => item.count);
    const series = this.timestampData.map((item: any) => item.date);
    const options = {
      series: [{
        name: 'Time',
        data: labels,
        labels: {
          formatter: function(value: string) {
            return value + ' hr';
          }
        }
      }],
      chart: {
        type: 'line',
        width: 900,
        height: 400,
        zoom: {
          enabled: false
        },
        fontFamily: 'Arial, sans-serif',
        background: ''
      },
      title: {
        text: "Saved Count",
        align: "left"
      },
      animationEnabled: true,
      xaxis: {
        categories: series
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.9,
          stops: [0, 100]
        }
      },
      colors: ['#f5f6fa'],
      style: {
        fontSize: '14px',
        fontWeight: 'bold'
      },
      legend: {
        position: 'right',
        fontSize: '22px'
      },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: 330, // Adjust width for smaller screens
            height: 300 // Adjust height for smaller screens
          },
          legend: {
            position: 'right'
          }
        }
      },    {
        breakpoint: 480,
        options: {
          chart: {
            width: 500,
            height: 300
          }
        }
      },
      {
        breakpoint: 648,
        options: {
          chart: {
            width: 400,
            height: 300
          }
        }
      },
      {
        breakpoint: 967,
        options: {
          chart: {
            width: 500,
            height: 400
          }
        }
      },
      {
        breakpoint: 1077,
        options: {
          chart: {
            width: 800,
            height: 450
          }
        }
      },
      {
        breakpoint: 540,
        options: {
          chart: {
            width: 200,
            height: 300
          }
        }
      },
      {
        breakpoint: 468,
        options: {
          chart: {
            width: 190,
            height: 300
          }
        }
      },
  ],
      tooltip: {
        enabled: true,
        style: {
          fontSize: '16px'
        },
        x: {
          show: true
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: "straight"
      },
      markers: {
        size: 0
      }
    };
    const chart = new ApexCharts(document.querySelector("#chart2"), options);
    chart.render(); 
  }

  

  createChart() {
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) {
      console.error('Failed to get 2D context for canvas');
      return;
    }
  
    const gradientStroke = ctx.createLinearGradient(500, 0, 100, 0);
    gradientStroke.addColorStop(0, '#115F9A');
    gradientStroke.addColorStop(1, '#115F9A');
  
    const gradientBkgrd = ctx.createLinearGradient(0, 100, 0, 400);
    gradientBkgrd.addColorStop(0, '#115F9A)');
    gradientBkgrd.addColorStop(1, '#115F9A');
  
    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'],
        datasets: [{
          label: 'Income',
          backgroundColor: gradientBkgrd,
          borderColor: gradientStroke,
          data: [5500, 2500, 10000, 6000, 14000, 1500, 7000, 20000],
          pointBorderColor: 'rgba(255,255,255,0)',
          pointBackgroundColor: 'rgba(255,255,255,0)',
          pointBorderWidth: 0,
          pointHoverRadius: 8,
          pointHoverBackgroundColor: gradientStroke,
          pointHoverBorderColor: 'rgba(220,220,220,1)',
          pointHoverBorderWidth: 4,
          pointRadius: 1,
          borderWidth: 5,
          pointHitRadius: 16,
        }],
      },
      options: {
        plugins: {
          tooltip: {
            backgroundColor: '#f5f6fa',
            displayColors: false,
            titleColor: '#f5f6fa',
            bodyColor: '#f5f6fa',
          },
        },
        elements: {
          line: {
            tension: 0.4,
          },
        },
        scales: {
          x: {
            type: 'timeseries', // Adjusted type
            grid: {
              display: false,
            },
          },
          y: {
            ticks: {
              
            },
          },
        },
      },
    });
  }
  
  
}
