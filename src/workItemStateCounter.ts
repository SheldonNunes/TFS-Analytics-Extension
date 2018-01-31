export class WorkItemStateCounter {
    private wiStateCounter;
    constructor(){
        this.resetCounter();
    }

    public resetCounter() {
        this.wiStateCounter = {
            NotCompleted: 0,
            Completed: 0,
            New: 0,
            "In Progress": 0,
        }
    }

    public incrementCounter(workItemState) {
        if(workItemState === "Done" || workItemState === "Closed") 
        {
            this.wiStateCounter.Completed++;
        } else {
            this.wiStateCounter.NotCompleted++;
        }
    }

    public getCompleted(){
        return this.wiStateCounter.Completed;
    }

    public getNotCompleted() {
        return this.wiStateCounter.NotCompleted;
    }
}
            
