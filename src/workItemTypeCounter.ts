import { WorkItemType } from './workItemClassifier';
import { Tree, TreeNode } from './dataStructures/tree';
import { WorkItemClassifier } from './workItemClassifier';

class WorkItemTypeCounter {
    public getWorkItemCountFromTree(tree:Tree) {
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
}

export const workItemTypeCounter = new WorkItemTypeCounter();
