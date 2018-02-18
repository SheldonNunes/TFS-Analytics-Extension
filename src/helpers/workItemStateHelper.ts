export enum WorkItemState {
    Completed,
    NotCompleted
}

class WorkItemStateHelper {
    public getWorkItemState(workItem) {
        let wiStatus = workItem.fields["System.State"];
        if(wiStatus === "Done" || wiStatus === "Closed") {
            return WorkItemState.Completed
        } else {
            return WorkItemState.NotCompleted
        }
    }
}
            
export const workItemStateHelper = new WorkItemStateHelper();