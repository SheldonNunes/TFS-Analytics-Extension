import { Queue } from "../dataStructures/queue"

export class TreeNode {
    data = null;
    parent = null;
    children = [];

    constructor (data) {
        this.data = data;
    }
}

export class Tree {
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
