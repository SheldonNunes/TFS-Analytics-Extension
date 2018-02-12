import { ChartFactory } from "./chartFactory";
import { Tree, TreeNode } from "./dataStructures/tree";
import { WorkItemClassifier, WorkItemType } from "./workItemClassifier";
import { WorkItemRetriever } from "./workItemRetriever";
import { WorkItemStateCounter } from "./workItemStateCounter";
import { WorkItemTypeCounter } from "./workItemTypeCounter";

const CompleteColour = "rgba(0, 122, 204, 1.0)";
const NotCompletedColour = "rgba(109, 109, 109, 0.25)";

class TFSVisualizer {

    private projectId: string;
    private chartFactory: ChartFactory;
    private wiRetriever: WorkItemRetriever;

    constructor(id: string, factory: ChartFactory, wiRetriever: WorkItemRetriever) {
        this.projectId = id;
        this.chartFactory = factory;
        this.wiRetriever = wiRetriever;
    }

    public getInitatiatives() {
        this.wiRetriever.getEpicCategoryItems().then((result) => {
            result.forEach((item, index) => {
                const option = document.createElement("option");
                option.value = item.id.toString();
                option.appendChild(document.createTextNode(item.fields["System.Title"]));
                document.getElementById("initiativeSelection").appendChild(option);
            });
        });
    }

    public generateReport(initiativeId) {
        this.wiRetriever.getWorkItems(this.projectId, initiativeId).then((function(tree: Tree) {
            this.generateSummary(tree);
            this.generateFeatureBreakdown(tree);
        }).bind(this));
    }

    private generateSummary(tree: Tree) {
        const workItemCounter = new WorkItemTypeCounter();
        const workItemStateCounter = new WorkItemStateCounter();
        const callback = (node: TreeNode) => {
            const workItemType = WorkItemClassifier.getWorkItemType(node.data);
            workItemCounter.incrementCounter(workItemType);
            if (workItemType === WorkItemType.Feature || node.parent === null) {
                return;
            }

            workItemStateCounter.incrementCounter(node.data.fields["System.State"]);
        };
        tree.traverseBF(callback);
        document.getElementById("totalFeatures").innerText = workItemCounter.getFeatureCount();
        document.getElementById("totalWorkItems").innerText = workItemCounter.getWorkItemCount();
        document.getElementById("totalBugs").innerText = workItemCounter.getBugItemCount();
        document.getElementById("totalTasks").innerText = workItemCounter.getTaskItemCount();
        const completed = workItemStateCounter.getCompleted();
        const notCompleted = workItemStateCounter.getNotCompleted();
        const percentageComplete = Math.round((completed / (notCompleted  + completed)) * 100) + "%";
        document.getElementById("summaryCompletePercentageIndicator").innerText = percentageComplete;

        const chartDataSet: Chart.ChartDataSets = {
            backgroundColor: [CompleteColour, NotCompletedColour],
            data: [workItemStateCounter.getCompleted(), workItemStateCounter.getNotCompleted() ],
            label: "Progress",
        };
        const chartData: Chart.ChartData = {
            datasets: [chartDataSet],            
            labels: ["Completed", "Not Completed"],
        };
        const chartTickOptions: Chart.LinearTickOptions = {
            beginAtZero: true
        };
        this.chartFactory.CreateChart("summaryCompleteChart", "doughnut", chartData);
    }

    private generateFeatureBreakdown(tree: Tree) {
        let features = [];
        let featureNodes = tree._root.children;
        featureNodes.forEach(function(node, index){
            let feature = {
                title: node.data.fields["System.Title"],
                children: []
            };

            let featureTree = new Tree(node)
            featureTree.traverseBF(function(node:TreeNode) {
                if(WorkItemClassifier.getWorkItemType(node.data) === WorkItemType.Feature) {
                    return;
                }
                let tfsItem = {
                    title: node.data.fields["System.Title"],
                    state: node.data.fields["System.State"]
                }
                feature.children.push(tfsItem);
            });
            features.push(feature);
        })

        const featureChartData : Chart.ChartData = {
            labels: features.map(a => a.title),
            datasets: []
        };

        let completedDataSet : Chart.ChartDataSets = {
            label: "Completed",
            data: features.map(x => x.children.reduce((acc, val) => { 
                if(val.state === "Done") {
                    return acc += 1;
                }
                return acc;
            }, 0)),
            backgroundColor: CompleteColour
        };

        let notCompletedDataSet : Chart.ChartDataSets = {
            label: "Not Completed",
            data: features.map(x => x.children.reduce((acc, val) => { 
                if(val.state === "In Progress" || val === "Proposed" || val === "Resolved" || val === "New" || val === "To Do") {
                    return acc += 1;
                }
                return acc;
            }, 0)),
            backgroundColor: NotCompletedColour
        };

        featureChartData.datasets.push(completedDataSet);
        featureChartData.datasets.push(notCompletedDataSet);

        this.chartFactory.CreateChart("featureBreakdownChart",  "bar", featureChartData, "Feature Status Breakdown");

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

VSS.notifyLoadSucceeded();
