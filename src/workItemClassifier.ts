
export enum WorkItemType {
    Initiative = 0,
    Feature = 1,
    WorkItem = 2,
    Bug = 3,
    Task = 4
}

export class WorkItemClassifier {
    public static getWorkItemType(workItem){
        var workItemType = workItem.fields["System.WorkItemType"];
        if(workItemType === "Initiative" || workItemType === "Epic")
            return WorkItemType.Initiative
        if(workItemType === "Feature")
            return WorkItemType.Feature;
        if(workItemType === "Product Backlog Item" || workItemType === "Work Item")
            return WorkItemType.WorkItem;
        if(workItemType === "Bug")
            return WorkItemType.Bug;
        if(workItemType === "Task")
            return WorkItemType.Task;        
    }
}