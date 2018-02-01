import { WorkItemType } from './workItemClassifier';

export class WorkItemTypeCounter {
    private workItemCounter;
    constructor(){
        this.resetCounter();
    }

    public incrementCounter(workItemType:WorkItemType){
        this.workItemCounter
        if(workItemType === WorkItemType.Feature)
            this.workItemCounter.Features++;
        if(workItemType === WorkItemType.WorkItem)
            this.workItemCounter.WorkItems++;
        if(workItemType === WorkItemType.Bug)
            this.workItemCounter.Bugs++;
        if(workItemType === WorkItemType.Task)
            this.workItemCounter.Tasks++;
    }

    public resetCounter() {
        this.workItemCounter = {
            Features: 0,
            WorkItems: 0,
            Bugs: 0,
            Tasks: 0
        }
    }

    public getFeatureCount() {
        return this.workItemCounter.Features
    }

    public getWorkItemCount() {
        return this.workItemCounter.WorkItems
    }

    public getBugItemCount() {
        return this.workItemCounter.Bugs
    }

    public getTaskItemCount() {
        return this.workItemCounter.Tasks
    }
}