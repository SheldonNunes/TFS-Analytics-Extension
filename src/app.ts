/// <reference path="../node_modules/@types/chart.js/index.d.ts" />
import TFSClient = require("TFS/WorkItemTracking/RestClient");
import WorkItemExpand = require("TFS/Work/Contracts");
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

    public visualize(){
        var tree = new Tree(new TreeNode('TFS'));
        var projectId = VSS.getWebContext().project.id;

        // Retrieves the Work Item Tracking REST client
        var workItemQuery = {
            query: "SELECT Microsoft.VSTS.Scheduling.RemainingWork FROM WorkItem ORDER BY [System.Id] ASC" 
        };

        var tfsItems = [];
        // Executes the WIQL query against the active project
        this.httpClient.queryByWiql(workItemQuery, projectId).then(
        (function(result) {
            var workItemIds = result.workItems.map(function (wi) { return wi.id });                
            this.httpClient.getWorkItems(workItemIds, null, null, 4).then(
                (function (workItems) {
                    var workItemLinksQuery = {       
                        query: "select [System.Id] from WorkItemLinks where ([System.Links.LinkType] = 'System.LinkTypes.Hierarchy-Forward') order by [System.Id] ASC"
                    };

                    this.httpClient.queryByWiql(workItemLinksQuery, projectId).then(
                    function(workItemLinks) {
                        workItemLinks.workItemRelations.forEach(function(workItemLink, index){
                            var item = workItems.find(function(item){
                                return item.id === workItemLink.target.id
                            });

                            var tfsItem : ITFSItem ={
                                id: item.id,
                                title: item.fields["System.Title"],
                                workItemType: item.fields["System.WorkItemType"],
                                state: item.fields["System.State"],
                                estimate: item.fields["Microsoft.VSTS.Scheduling.RemainingWork"]//item.fields["Microsoft.VSTS.Scheduling.OriginalEstimate"]
                            };

                            if(tfsItem.workItemType === "Feature")
                            {
                                tree.add(tfsItem, 'TFS', tree.traverseBF);
                            } else if (workItemLink.source != null){
                                var parentItem = workItems.find(function(item){
                                    return item.id === workItemLink.source.id
                                }) 

                                var parentItemTest : ITFSItem = {
                                    id: parentItem.id,
                                    title: parentItem.fields["System.Title"],
                                    workItemType: parentItem.fields["System.WorkItemType"],
                                    state: item.fields["System.State"],
                                    estimate: item.fields["Microsoft.VSTS.Scheduling.RemainingWork"]//item.fields["Microsoft.VSTS.Scheduling.OriginalEstimate"]
                                };

                                tree.add(tfsItem, parentItemTest, tree.traverseBF)
                            }
                        });

                        console.log(tree);

                        var stateDictionary : any = {};
                        const callback = node => {
                            if(stateDictionary[node.data.state] != null){
                                stateDictionary[node.data.state]++;
                            } else {
                                stateDictionary[node.data.state] = 1;
                            }
                        };

                        var feature : Tree = new Tree(tree._root.children[0])
                        feature.traverseBF(callback);

                        console.log(feature);
                        console.log(stateDictionary);
                        
                        var chartDataSet : Chart.ChartDataSets = {
                            label: feature._root.data.title,
                            data: Object.values(stateDictionary)
                        }

                        var chartData : Chart.ChartData = {
                            labels: Object.keys(stateDictionary),
                            datasets: [chartDataSet]
                        } 
    
                        var chartTickOptions : Chart.LinearTickOptions = {
                            beginAtZero:true
                        }

                        var myChart: any = document.getElementById("myChart");
                        var ctx = myChart.getContext('2d');
                        var chart = 
                            new Chart(ctx,
                                { type: "bar",
                                data: chartData,
                                options: {
                                    scales: {
                                        yAxes: [{
                                            ticks: chartTickOptions
                                        }]
                                        }
                                    }
                                })
                    });
                }).bind(this)); 
        }).bind(this));    
    }
}

var visualizer = new TFSVisualizer();
visualizer.visualize();