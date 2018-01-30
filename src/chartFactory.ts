declare var Chart: any;

export class ChartFactory {
    _createdCharts = [];
    CreateChart(canvasId: string, chartType: string, chartData: Chart.ChartDataSets) {
        var index = this._createdCharts.findIndex(function(element:Chart) { 
            if(element.canvas.id === canvasId)
                 return true;
            return false
        });

        if(index === -1){
            var summaryCompleteChart: any = document.getElementById(canvasId);
            var ctx = summaryCompleteChart.getContext('2d');
            var chart = new Chart(ctx,
                    { type: chartType,
                    data: chartData,
                    options: {
                        maintainAspectRatio: false,
                        legend: {
                            display: false
                        }
                    }
                });
            this._createdCharts.push(chart);
        } else {
            var chart = this._createdCharts[index];
            chart.data = chartData;
        }
    }
}