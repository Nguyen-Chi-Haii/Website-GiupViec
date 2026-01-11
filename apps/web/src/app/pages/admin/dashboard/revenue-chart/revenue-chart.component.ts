import { Component, Input, OnChanges, SimpleChanges, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { AdminService } from '../../../../core/services/admin.service';

@Component({
  selector: 'app-revenue-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  template: `
    <div class="chart-container relative h-[300px] w-full">
      <div *ngIf="isLoading()" class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
      
      <canvas baseChart
        [data]="lineChartData"
        [options]="lineChartOptions"
        [type]="lineChartType">
      </canvas>
    </div>
  `,
  styles: [`
    .chart-container {
      min-height: 300px;
    }
  `]
})
export class RevenueChartComponent implements OnChanges {
  @Input() startDate: string = '';
  @Input() endDate: string = '';

  constructor(private adminService: AdminService) {}
  
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  isLoading = signal(false);

  public lineChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Doanh thu',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(59, 130, 246, 0.8)',
        fill: 'origin',
      }
    ]
  };

  public lineChartOptions: ChartConfiguration['options'] = {
    elements: {
      line: {
        tension: 0.4
      }
    },
    scales: {
      // We rely on Chart.js defaults, but can customize if needed
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value));
          }
        }
      }
    },
    plugins: {
      legend: { display: true },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    responsive: true,
    maintainAspectRatio: false
  };

  public lineChartType: ChartType = 'line';

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['startDate'] || changes['endDate']) && this.startDate && this.endDate) {
      this.loadData();
    }
  }

  loadData() {
    this.isLoading.set(true);
    this.adminService.getRevenueChartData(this.startDate, this.endDate).subscribe({
      next: (res: any) => {
        // Expected res: { labels: string[], revenues: number[] }
        if (res) {
          this.lineChartData.labels = res.labels;
          this.lineChartData.datasets[0].data = res.revenues;
          this.chart?.update();
        }
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error('Error loading chart data', err);
        this.isLoading.set(false);
      }
    });
  }
}
