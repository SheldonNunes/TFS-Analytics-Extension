/// <reference path="../node_modules/@types/chart.js/index.d.ts" />
/// <reference types="vss-web-extension-sdk" />

import Tfs_Work_WebApi = require("TFS/Work/RestClient");
import WorkItemTrackingClient = require("TFS/WorkItemTracking/RestClient");
import Contracts = require("TFS/WorkItemTracking/Contracts");
import { WorkItem, WorkItemExpand, WorkItemQueryResult } from "TFS/WorkItemTracking/Contracts";
import { Tree, TreeNode } from "./dataStructures/tree";
import { ChartFactory } from "./chartFactory"
declare var Chart: any;

class WorkItemRetriever {
    private _httpClient: WorkItemTrackingClient.WorkItemTrackingHttpClient4;
    public get httpClient(): WorkItemTrackingClient.WorkItemTrackingHttpClient4 {
        if (!this._httpClient) {
            this._httpClient = WorkItemTrackingClient.getClient();
        }
    
        return this._httpClient;
    }

    private getWorkItemOrdering(workItemType){
        if(workItemType === "Epic")
            return 0;
        if(workItemType === "Feature")
            return 1;
        if(workItemType === "Product Backlog Item" || workItemType === "Bug")
            return 2;
        if(workItemType === "Task")
            return 3;
    }

    public getEpicCategoryItems(){
        var projectId = VSS.getWebContext().project.id;
        var initiatiesQuery = {
            query: "SELECT * FROM WorkItem WHERE [System.WorkItemType] IN GROUP 'Microsoft.EpicCategory' ORDER BY [System.Id] ASC" 
        };

        var that = this;
        return new Promise<Contracts.WorkItem[]>(function(resolve, reject) {
            that.httpClient.queryByWiql(initiatiesQuery, projectId).then(function(result){
                var ids = result.workItems.map(function (wi) { return wi.id });  
                resolve(that.httpClient.getWorkItems(ids, null, null, 1));
            });
        });
    }

    public getWorkItems(projectId, initiativeId){
        var treeQuery = {
            query: "select * from WorkItemLinks where (Source.[System.TeamProject] = @project and Source.[System.Id] = " + initiativeId + " and Source.[System.State] <> '') and ([System.Links.LinkType] = 'System.LinkTypes.Hierarchy-Forward') and (Target.[System.TeamProject] = @project and Target.[System.WorkItemType] <> '') mode (Recursive)"
        };

        return new Promise<Tree>((function(resolve, reject){
            this.httpClient.queryByWiql(treeQuery, projectId).then((function(result:WorkItemQueryResult){
                //get the ids of all the child elements
                var workItemIds = [];
                result.workItemRelations.forEach(function(item, index){
                    workItemIds.push(item.target.id)
                });
                
                this.httpClient.getWorkItems(workItemIds, null, null, 4).then(
                    (function (workItems) {
                        workItems.sort((function(a,b) {
                            return this.getWorkItemOrdering(a.fields["System.WorkItemType"]) - this.getWorkItemOrdering(b.fields["System.WorkItemType"])
                        }).bind(this));
                        
                        var tree = new Tree(new TreeNode(workItems[0]));
                        
                        workItems.forEach(function(workItem : Contracts.WorkItem, index){
                            if(index !== 0) {
                                var parentWorkItem = workItems.find(function(item){
                                    if(workItem.relations === undefined)
                                        return false;                               
                                    var id = workItem.relations[0].url.split('/').pop();
                                    return item.id === parseInt(id);
                                });
                                tree.add(workItem, parentWorkItem, tree.traverseBF)
                            }
                        });

                        resolve(tree);
                    }).bind(this));
            }).bind(this));
        }).bind(this));
    }
}

class TFSVisualizer {
    private _chartFactory: ChartFactory;
    constructor(chartFactory:ChartFactory){
        this._chartFactory = chartFactory;
    }
    public getInitatiatives(){
        var workItemRetriever = new WorkItemRetriever();
        workItemRetriever.getEpicCategoryItems().then(function(result){
            result.forEach(function(item, index){
                var option = document.createElement('option');
                option.value = item.id.toString();
                option.appendChild(document.createTextNode(item.fields["System.Title"]));
                document.getElementById('initiativeSelection').appendChild(option)
                
            });
        });
    }

    public generateReport(projectId, initiativeId){
        var workItemRetriever = new WorkItemRetriever();
        workItemRetriever.getWorkItems(projectId, initiativeId).then((function(tree:Tree){
            var workItemCounter : any = {
                Features: 0,
                WorkItems: 0,
                Bugs: 0,
                Tasks: 0
            }
            
            var stateDictionary : any = {
                NotCompleted: 0,
                Completed: 0,
                New: 0,
                "In Progress": 0,
            };
            
            const callback = (node:TreeNode) => {
                if(node.data == "TFS")
                    return;
                var workItemState = node.data.fields["System.State"];
                stateDictionary[workItemState]++;
            
                if(workItemState === "Done" || workItemState === "Closed") 
                {
                    stateDictionary.Completed++;
                } else {
                    stateDictionary.NotCompleted++;
                }
            
            
                var workItemType = node.data.fields["System.WorkItemType"];
                if(workItemType === "Feature")
                    workItemCounter.Features++;
                if(workItemType === "Work Item" ||workItemType === "Product Backlog Item")
                    workItemCounter.WorkItems++;
                if(workItemType === "Bug")
                    workItemCounter.Bugs++;
                if(workItemType === "Task")
                    workItemCounter.Tasks++;
            };
            
            tree.traverseBF(callback);
            
            document.getElementById("totalFeatures").innerText = workItemCounter.Features;
            document.getElementById("totalWorkItems").innerText = workItemCounter.WorkItems;
            document.getElementById("totalTasks").innerText = workItemCounter.Tasks;
            
            var chartDataSet : Chart.ChartDataSets = {
                label: "Progress",// tree._root.data,//tree._root.data.fields["System.Title"],
                data: [stateDictionary.Completed, stateDictionary.NotCompleted ],
                backgroundColor: ['rgba(51, 216, 20, 0.70)', 'rgba(109, 109, 109, 0.25)'] 
            };
            
            var chartData : Chart.ChartData = {
                labels: ["Completed", "Not Completed"],
                datasets: [chartDataSet]
            };
            
            var chartTickOptions : Chart.LinearTickOptions = {
                beginAtZero:true
            };

            this._chartFactory.CreateChart("summaryCompleteChart", "doughnut", chartData);



            //Create Feature Breakdown

            let workItemStateCounter = {
                Completed: [],
                NotCompleted: []
            }
            var featureChartData : Chart.ChartData = {
                labels: [],
                datasets: []
            };
            var counter = 0;
            const featureCallback = (node:TreeNode) => {
                if(node == tree._root)
                    return;

                let workItemState = node.data.fields["System.State"];            
                if(workItemState === "Done" || workItemState === "Closed") 
                {
                    workItemStateCounter.Completed[counter]++;
                } else {
                    workItemStateCounter.NotCompleted[counter]++;
                }
            };

            var features = tree._root.children;
            features.forEach(function(feature, index){
                workItemStateCounter.Completed[counter] = 0;
                workItemStateCounter.NotCompleted[counter] = 0;

                featureChartData.labels.push(feature.data.fields["System.Title"]);
                var featureTree = new Tree(feature)
                featureTree.traverseBF(featureCallback)

                counter++;
            })

            var completedDataSet : Chart.ChartDataSets = {
                label: "Completed",// tree._root.data,//tree._root.data.fields["System.Title"],
                data: workItemStateCounter.Completed,
                backgroundColor: 'rgba(51, 216, 20, 0.70)'
            };

            var notCompletedDataSet : Chart.ChartDataSets = {
                label: "Not Completed",// tree._root.data,//tree._root.data.fields["System.Title"],
                data: workItemStateCounter.NotCompleted,
                backgroundColor: 'rgba(109, 109, 109, 0.25)'
            };

            featureChartData.datasets.push(completedDataSet);
            featureChartData.datasets.push(notCompletedDataSet);

            this._chartFactory.CreateChart("featureBreakdownChart", "bar", featureChartData);

        }).bind(this));
    };
};

var chartFactory = new ChartFactory();
var visualizer = new TFSVisualizer(chartFactory);

var projectId = VSS.getWebContext().project.id;
var workItemRetriever = new WorkItemRetriever();
workItemRetriever.getEpicCategoryItems().then(function(result){
    result.forEach(function(item, index){
        var option = document.createElement('option');
        option.value = item.id.toString();
        option.appendChild(document.createTextNode(item.fields["System.Title"]));
        document.getElementById('initiativeSelection').appendChild(option)
        
    });
});

var initiativeSelection : HTMLSelectElement = <HTMLSelectElement>document.getElementById('initiativeSelection')
initiativeSelection.onchange = function(){
    var selectedIndex = initiativeSelection.selectedIndex;
    var initiativeId = initiativeSelection.options[selectedIndex].value;
    visualizer.generateReport(projectId, initiativeId);
};