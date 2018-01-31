import { Tree, TreeNode } from "./dataStructures/tree";
import { ChartFactory } from "./chartFactory";
import { WorkItemRetriever } from "./workItemRetriever";
import { WorkItemTypeCounter } from "./workItemTypeCounter";
import { WorkItemStateCounter } from "./workItemStateCounter";

class TFSVisualizer {

    private projectId: string;
    private chartFactory: ChartFactory;
    private wiRetriever: WorkItemRetriever;

    constructor(id: string, factory: ChartFactory, workItemRetriever: WorkItemRetriever) {
        this.projectId = id;
        this.chartFactory = factory;
        this.wiRetriever = workItemRetriever;
    }

    public getInitatiatives() {
        this.wiRetriever.getEpicCategoryItems().then(function(result){
            result.forEach(function(item, index){
                let option = document.createElement('option');
                option.value = item.id.toString();
                option.appendChild(document.createTextNode(item.fields["System.Title"]));
                document.getElementById('initiativeSelection').appendChild(option)
            });
        });
    }

    public generateReport(initiativeId){
        this.wiRetriever.getWorkItems(this.projectId, initiativeId).then((function(tree:Tree){  
            this.generateSummary(tree);                      



            //Create Feature Breakdown

            let workItemStateCounter = {
                Completed: [],
                NotCompleted: []
            }
            let featureChartData : Chart.ChartData = {
                labels: [],
                datasets: []
            };
            let counter = 0;
            const featureCallback = (node:TreeNode) => {
                if(node.data.fields["System.WorkItemType"] === "Feature")
                    return;

                let workItemState = node.data.fields["System.State"];            
                if(workItemState === "Done" || workItemState === "Closed") 
                {
                    workItemStateCounter.Completed[counter]++;
                } else {
                    workItemStateCounter.NotCompleted[counter]++;
                }
            };

            let features = tree._root.children;
            features.forEach(function(feature, index){
                workItemStateCounter.Completed[counter] = 0;
                workItemStateCounter.NotCompleted[counter] = 0;

                featureChartData.labels.push(feature.data.fields["System.Title"]);
                let featureTree = new Tree(feature)
                featureTree.traverseBF(featureCallback)

                counter++;
            })

            let completedDataSet : Chart.ChartDataSets = {
                label: "Completed",
                data: workItemStateCounter.Completed,
                backgroundColor: 'rgba(51, 216, 20, 0.70)'
            };

            let notCompletedDataSet : Chart.ChartDataSets = {
                label: "Not Completed",
                data: workItemStateCounter.NotCompleted,
                backgroundColor: 'rgba(109, 109, 109, 0.25)'
            };

            featureChartData.datasets.push(completedDataSet);
            featureChartData.datasets.push(notCompletedDataSet);

            this.chartFactory.CreateChart("featureBreakdownChart", "bar", featureChartData);

        }).bind(this));
    };

    private generateSummary(tree: Tree){
        let workItemCounter = new WorkItemTypeCounter();
        let workItemStateCounter = new WorkItemStateCounter();
        const callback = (node:TreeNode) => {
            if(node.data.fields["System.WorkItemType"] === "Feature" || node.parent === null)
                return;

            workItemCounter.incrementCounter(node.data.fields["System.WorkItemType"]);
            workItemStateCounter.incrementCounter(node.data.fields["System.State"]);                
        };
        tree.traverseBF(callback);
        
        document.getElementById("totalFeatures").innerText = workItemCounter.getFeatureCount();
        document.getElementById("totalWorkItems").innerText = workItemCounter.getWorkItemCount();
        document.getElementById("totalTasks").innerText = workItemCounter.getTaskItemCount();
        document.getElementById("summaryCompletePercentageIndicator").innerText = Math.round((workItemStateCounter.getCompleted() / (workItemStateCounter.getNotCompleted()  + workItemStateCounter.getCompleted() )) * 100) + "%"

        let chartDataSet : Chart.ChartDataSets = {
            label: "Progress",// tree._root.data,//tree._root.data.fields["System.Title"],
            data: [workItemStateCounter.getCompleted(), workItemStateCounter.getNotCompleted() ],
            backgroundColor: ['rgba(51, 216, 20, 0.70)', 'rgba(109, 109, 109, 0.25)'] 
        };
        
        let chartData : Chart.ChartData = {
            labels: ["Completed", "Not Completed"],
            datasets: [chartDataSet]
        };
        
        let chartTickOptions : Chart.LinearTickOptions = {
            beginAtZero:true
        };

        this.chartFactory.CreateChart("summaryCompleteChart", "doughnut", chartData);
    }
};

let chartFactory = new ChartFactory();
let workItemRetriever = new WorkItemRetriever();
let projectId = VSS.getWebContext().project.id;

let visualizer = new TFSVisualizer(projectId, chartFactory, workItemRetriever);
visualizer.getInitatiatives();

let initiativeSelection : HTMLSelectElement = <HTMLSelectElement>document.getElementById('initiativeSelection')
initiativeSelection.onchange = function(){
    let selectedIndex = initiativeSelection.selectedIndex;
    let initiativeId = initiativeSelection.options[selectedIndex].value;
    visualizer.generateReport(initiativeId);
};