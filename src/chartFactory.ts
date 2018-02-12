import { ChartOptions, LinearTickOptions } from "chart.js";

declare var Chart: any;

export class ChartFactory {
    _createdCharts = [];
    CreateChart(canvasId: string, chartType: string, chartData: Chart.ChartData, chartTitle?: string) {
        var index = this._createdCharts.findIndex(function(element:Chart) { 
            if(element.canvas.id === canvasId)
                 return true;
            return false
        });

        if(index !== -1){
            var chart = this._createdCharts[index];
            chart.destroy();
            this._createdCharts.splice(index, 1);
        }

        var chartOptions:ChartOptions = {
            maintainAspectRatio: false,
            legend: {
                display: false
            }
        }

        if(chartTitle){
            chartOptions.title = {
                display: true,
                text: chartTitle
            };
        }

        if(chartType === "bar"){
            var ticks: LinearTickOptions  = {
                beginAtZero: true
            };
            chartOptions.scales = {
                xAxes: [{
                    stacked: true
                }],
                yAxes: [{
                    stacked: true,
                    ticks
                }]
            };
        }

        var summaryCompleteChart: any = document.getElementById(canvasId);
        var ctx = summaryCompleteChart.getContext('2d');
        var chart = new Chart(ctx,
                { type: chartType,
                data: chartData,
                options: chartOptions
            });

        this._createdCharts.push(chart);
    } 
}