/** Interface wrapped around a queue in charge of scheduling when items added to the queue are ran. */
export interface Scheduler<T> {
  /** Schedule an item to be ran ASAP. The item is added to the back of the queue */
  add(item: T): void;
}
