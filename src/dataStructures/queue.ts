export class Queue {
    _oldestIndex = 1;
    _newestIndex = 1;
    _storage = {};

    size() {
        return this._newestIndex - this._oldestIndex;
    }

    enqueue(data) {
        this._storage[this._newestIndex] = data;
        this._newestIndex++;
    }

    dequeue() {
        const oldestIndex = this._oldestIndex;
        const deletedData = this._storage[oldestIndex];

        delete this._storage[oldestIndex];
        this._oldestIndex++;

        return deletedData;
    }
}
