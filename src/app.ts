/// <reference path="../node_modules/@types/chart.js/index.d.ts" />
/// <reference types="vss-web-extension-sdk" />

import Tfs_Work_WebApi = require("TFS/Work/RestClient");
import WorkItemTrackingClient = require("TFS/WorkItemTracking/RestClient");
import Contracts = require("TFS/WorkItemTracking/Contracts");
import { WorkItem, WorkItemExpand, WorkItemQueryResult } from "TFS/WorkItemTracking/Contracts";
declare var Chart: any;

interface ITFSItem {
    id: number,
    title: string,
    workItemType: string,
    state: string,
    estimate: number
};

class Queue {
    _oldestIndex = 1;
    _newestIndex = 1;
    _storage = {};

    size() {
        return this._newestIndex - this._oldestIndex;
    }

    enqueue(data) {
        this._storage[this._newestIndex] = data;
        this._newestIndex++;
    }

    dequeue() {
        const oldestIndex = this._oldestIndex;
        const deletedData = this._storage[oldestIndex];

        delete this._storage[oldestIndex];
        this._oldestIndex++;

        return deletedData;
    }
}


class TreeNode {
    data = null;
    parent = null;
    children = [];

    constructor (data) {
        this.data = data;
    }
}

class Tree {
    _root: TreeNode = null;
    constructor(data: TreeNode) {
        const node = data;
        this._root = node;
    }

    traverseBF(callback) {
        const queue = new Queue();
        
        queue.enqueue(this._root);
    
        let currentTree = queue.dequeue();
    
        while(currentTree){
            for (let i = 0, length = currentTree.children.length; i < length; i++) {
                queue.enqueue(currentTree.children[i]);
            }
    
            callback(currentTree);
            currentTree = queue.dequeue();
        }
    }

    contains(callback, traversal) {
        traversal.call(this, callback);
    }

    add(data, toData, traversal) {
        const child = new TreeNode(data);
        let parent = null;

        const callback = node => {
            if (node.data === toData || node.data.id === toData.id) {
                parent = node;
            }
        };

        this.contains(callback, traversal);

        if (parent) {
            parent.children.push(child);
            child.parent = parent;
        } else {
            throw new Error('Cannot add node to a non-existent parent.');
        }
    }
}

function makeUL(array) {
    // Create the list element:
    var list = document.createElement('ul');

    for(var i = 0; i < array.length; i++) {
        // Create the list item:
        var item = document.createElement('li');

        // Set its contents:
        item.appendChild(document.createTextNode(array[i]));

        // Add it to the list:
        list.appendChild(item);
    }

    // Finally, return the constructed list:
    return list;
}

class ProcessRetriever {
    public getProcess(){
        let workClient = WorkItemTrackingClient.getClient();
        var projectId = VSS.getWebContext().project.id;
        workClient.getWorkItemTypeCategories(projectId).then(
            (function(result) {
                var test = result;
            })
        );
    }
}

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
                //Needs work
                resolve(that.httpClient.getWorkItems(ids, null, null, 1));
            });
        });
    }

    public getWorkItems(initiativeId){
        var that = this;
        var projectId = VSS.getWebContext().project.id;

        //This gets all children of initiativeId
        var treeQuery = {
            query: "select * from WorkItemLinks where (Source.[System.TeamProject] = @project and Source.[System.Id] = " + initiativeId + " and Source.[System.State] <> '') and ([System.Links.LinkType] = 'System.LinkTypes.Hierarchy-Forward') and (Target.[System.TeamProject] = @project and Target.[System.WorkItemType] <> '') mode (Recursive)"
        };
        this.httpClient.queryByWiql(treeQuery, projectId).then(function(result:WorkItemQueryResult){
            //get the ids of all the child elements            
            var workItemIds = [];
            result.workItemRelations.forEach(function(item, index){
                workItemIds.push(item.target.id)
            });
            
            that.httpClient.getWorkItems(workItemIds, null, null, 4).then(
                (function (workItems) {
                    workItems.sort(function(a,b) {
                        return that.getWorkItemOrdering(a.fields["System.WorkItemType"]) - that.getWorkItemOrdering(b.fields["System.WorkItemType"])
                    });
                    
                    var tree = new Tree(new TreeNode(workItems[0]));
                    
                    workItems.forEach(function(workItem : Contracts.WorkItem, index){
                        if(index !== 0) {
                            var parentWorkItem = workItems.find(function(item){
                                if(workItem.relations === undefined)
                                    return false;
                                // array 0 is the Reverse                                
                                var id = workItem.relations[0].url.split('/').pop();
                                return item.id === parseInt(id);
                            });
                            tree.add(workItem, parentWorkItem, tree.traverseBF)
                        }
                    })

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


                    var myChart: any = document.getElementById("myChart");
                    var ctx = myChart.getContext('2d');
                    var chart = new Chart(ctx,
                            { type: "doughnut",
                            data: chartData,
                            options: {
                                maintainAspectRatio: false,
                                legend: {
                                    display: false
                                }
                            }
                        });
                }).bind(this)); 
        });   
    }
}

class TFSVisualizer {
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

    public generateReport(initiativeId){
        var workItemRetriever = new WorkItemRetriever();
        workItemRetriever.getWorkItems(initiativeId);
    }
}




var testing = new ProcessRetriever();
testing.getProcess();

var visualizer = new TFSVisualizer();


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
    visualizer.generateReport(initiativeId);
}


