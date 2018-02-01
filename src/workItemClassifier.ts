
export enum WorkItemType {
    Initiative,
    Feature,
    WorkItem,
    Bug,
    Task
}

export class WorkItemClassifier {
    public static getWorkItemType(workItem){
        var workItemType = workItem.fields["System.WorkItemType"];
        if(workItemType === "Initiative")
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