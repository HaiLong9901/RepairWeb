export class Queue {
  constructor(private queue: any[]) {
    this.queue = [];
  }
  getQueue() {
    return this.queue;
  }
  enqueue(item: any) {
    return this.queue.unshift(item);
  }

  dequeue() {
    return this.queue.pop();
  }

  peek() {
    return this.queue[this.length - 1];
  }

  get length() {
    return this.queue.length;
  }

  isEmpty() {
    return this.queue.length === 0;
  }
}
