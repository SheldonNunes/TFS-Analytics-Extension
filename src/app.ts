/// <reference path="../node_modules/@types/chart.js/index.d.ts" />
import TFSClient = require("TFS/WorkItemTracking/RestClient");
import Contracts = require("TFS/WorkItemTracking/Contracts");
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

class TFSVisualizer {
    private _httpClient: TFSClient.WorkItemTrackingHttpClient4;
    public get httpClient(): TFSClient.WorkItemTrackingHttpClient4 {
        if (!this._httpClient) {
            this._httpClient = TFSClient.getClient();
        }
    
        return this._httpClient;
    }

    private getWorkItemOrdering(workItemType){
        if(workItemType === "Feature")
            return 0;
        if(workItemType === "Product Backlog Item" || workItemType === "Bug")
            return 1;
        if(workItemType === "Task")
            return 2;
    }

    public visualize(){
        var that = this;
        var tree = new Tree(new TreeNode('TFS'));
        var projectId = VSS.getWebContext().project.id;

        // Retrieves the Work Item Tracking REST client
        var workItemQuery = {
            query: "SELECT * FROM WorkItem ORDER BY [System.Id] ASC" 
        };

        var tfsItems = [];
        // Executes the WIQL query against the active project
        this.httpClient.queryByWiql(workItemQuery, projectId).then(
        (function(result) {
            var workItemIds = result.workItems.map(function (wi) { return wi.id });                
            this.httpClient.getWorkItems(workItemIds, null, null, 4).then(
                (function (workItems) {
                    workItems.sort(function(a,b) {
                        return that.getWorkItemOrdering(a.fields["System.WorkItemType"]) - that.getWorkItemOrdering(b.fields["System.WorkItemType"])
                    });
                    workItems.forEach(function(workItem : Contracts.WorkItem, index){
                        if(workItem.fields["System.WorkItemType"] === "Feature"){
                            tree.add(workItem, 'TFS', tree.traverseBF);
                        } else {
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
                    };

                    tree.traverseBF(callback);
                    
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
        }).bind(this));    
    }

    


    public getItemStateGraph(tfsTree){
        
    }
}

var visualizer = new TFSVisualizer();
visualizer.visualize();