import Tfs_Work_WebApi = require("TFS/Work/RestClient");
import WorkItemTrackingClient = require("TFS/WorkItemTracking/RestClient");
import { Tree, TreeNode } from "./dataStructures/tree";
import { WorkItem, WorkItemExpand, WorkItemQueryResult } from "TFS/WorkItemTracking/Contracts";
import Contracts = require("TFS/WorkItemTracking/Contracts");

export class WorkItemRetriever {
    private _httpClient: WorkItemTrackingClient.WorkItemTrackingHttpClient4;
    public get httpClient(): WorkItemTrackingClient.WorkItemTrackingHttpClient4 {
        if (!this._httpClient) {
            this._httpClient = WorkItemTrackingClient.getClient();
        }
    
        return this._httpClient;
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
