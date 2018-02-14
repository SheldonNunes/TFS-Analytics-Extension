/// <reference types="vss-web-extension-sdk" />

import { WorkItemTrackingHttpClient4, getClient } from "TFS/WorkItemTracking/RestClient";
import { Tree, TreeNode } from "./../dataStructures/tree";
import { WorkItemExpand, WorkItemQueryResult } from "TFS/WorkItemTracking/Contracts";
import { WorkItemClassifier, WorkItemType } from "./../workItemClassifier"
import * as Contracts from "TFS/WorkItemTracking/Contracts";
import { WorkItem } from "./../models/WorkItem";

export default class WorkItemApi {
    private _httpClient: WorkItemTrackingHttpClient4;
    public get httpClient(): WorkItemTrackingHttpClient4 {
        if (!this._httpClient) {
            this._httpClient = getClient();
        }
    
        return this._httpClient;
    }
    
    public getEpicCategoryItems(){
        var projectId = VSS.getWebContext().project.id;
        var teamId = VSS.getWebContext().team.id;
        var initiatiesQuery = {
            query: "SELECT * FROM WorkItem WHERE [System.WorkItemType] IN GROUP 'Microsoft.EpicCategory' AND [System.TeamProject] = @project ORDER BY [System.Id] ASC" 
        };

        var that = this;
        return new Promise<WorkItem[]>(function(resolve, reject) {
            that.httpClient.queryByWiql(initiatiesQuery, projectId, teamId).then(function(result){
                var ids = result.workItems.map((wi) => { return wi.id });  
                that.httpClient.getWorkItems(ids, null, null, 1).then((wi) => {
                    let result = wi.map((x) => {
                        let workItem: WorkItem = {
                            id: x.id,
                            title: x.fields["System.Title"],
                            type: x.fields["System.WorkItemType"]
                        }
                        return workItem
                    })
                    resolve(result);
                })
            });
        });
    }

    public getWorkItems(projectId, initiativeId){
        var treeQuery = {
            query: "select * from WorkItemLinks where (Source.[System.TeamProject] = @project and Source.[System.Id] = " + initiativeId + " and Source.[System.State] <> '') and ([System.Links.LinkType] = 'System.LinkTypes.Hierarchy-Forward') and (Target.[System.TeamProject] = @project and Target.[System.WorkItemType] <> '') order by Target.[System.WorkItemType] mode (Recursive)"
        };

        return new Promise<Tree>((function(resolve, reject){
            var teamId = VSS.getWebContext().team.id;
            this.httpClient.queryByWiql(treeQuery, projectId, teamId).then((function(result:WorkItemQueryResult){
                //get the ids of all the child elements
                var workItemIds = [];
                result.workItemRelations.forEach(function(item, index){
                    workItemIds.push(item.target.id)
                });
                
                this.httpClient.getWorkItems(workItemIds, null, null, 4).then(
                    (function (workItems) {
                        workItems.sort(function(a,b) {
                            return (WorkItemClassifier.getWorkItemType(a)) - WorkItemClassifier.getWorkItemType(b)
                        });

                        var tree = new Tree(new TreeNode(workItems[0]));
                        
                        workItems.forEach(function(workItem : Contracts.WorkItem, index){
                            if(index !== 0) {
                                var parentWorkItem = workItems.find(function(item){
                                    if(workItem.relations === undefined)
                                        return false;  
                                        
                                    var parentRelationIndex = workItem.relations.findIndex(function(element) {
                                        return element.rel === "System.LinkTypes.Hierarchy-Reverse"
                                    })    

                                    var id = workItem.relations[parentRelationIndex].url.split('/').pop();
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
