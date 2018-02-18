import { WorkItemType } from './../workItemClassifier';
import { Tree, TreeNode } from './../dataStructures/tree';
import { WorkItemClassifier } from './../workItemClassifier';
import { workItemStateHelper, WorkItemState } from './../helpers/workItemStateHelper';

class SummaryService {
    public getSummary(tree:Tree) {
        let wiCount = this.getWorkItemCountFromTree(tree);
        let wiStatus = this.getWorkItemStateCountFromTree(tree);

        return {
            itemTypes: wiCount,
            itemStatuses: wiStatus
        }
    }

    public getFeatureSummary(featureNodes:TreeNode[]) {
        let features = [];
        featureNodes.forEach(function(node, index) {
            let feature = {
                title: node.data.fields["System.Title"],
                children: []
            };
            let featureTree = new Tree(node);
            featureTree.traverseBF((n) => {
                if(WorkItemClassifier.getWorkItemType(n.data) === WorkItemType.Feature) {
                    return;
                }
                let tfsItem = {
                    title: n.data.fields["System.Title"],
                    state: n.data.fields["System.State"]
                }
                feature.children.push(tfsItem);
            });
            features.push(feature);
        })
        return features;
    }

    private getWorkItemCountFromTree(tree:Tree) {
        let count = {
            featureCount: 0,
            workItemCount: 0,
            bugCount: 0,
            taskCount: 0
        }
        let features:TreeNode[] = tree._root.children;
        count.featureCount = features.length;
        features.forEach(function(feature, index) {
            if(feature.children) {
                feature.children.forEach(function(wi, i) {
                    if(WorkItemClassifier.getWorkItemType(wi.data) === WorkItemType.WorkItem) {
                        count.workItemCount += 1;
                    } else if(WorkItemClassifier.getWorkItemType(wi.data) === WorkItemType.Bug) {
                        count.bugCount += 1;
                    }
                    
                    if(wi.children) {
                        count.taskCount += wi.children.length;
                    }
                });
            }
        })
        return count;
    }

    private getWorkItemStateCountFromTree(tree:Tree) {
        let count = {
            completed: 0,
            incompleted: 0,
        }
        let features:TreeNode[] = tree._root.children;
        features.forEach(function(feature, index) {
            let featureTree = new Tree(feature);
            featureTree.traverseBF((node) => {
                let wi = node.data;
                if(workItemStateHelper.getWorkItemState(wi) === WorkItemState.Completed) {
                    count.completed += 1;
                } else {
                    count.incompleted += 1;
                }
            })
        })
        return count;
    }
}

export const summaryService = new SummaryService();
