
export class Collection<TCollectionItem> {
  private items: Array<TCollectionItem>;

  constructor(values?: Array<TCollectionItem>) {
    this.items = [];

    if (values) {
      // Push initial values into the items array. 
      for (var i = 0; i < values.length; i += 1) {
        if (values[i] === undefined) {
          continue;
        }

        this.items.push(values[i]);
      }
    }
  }

  public add(item: TCollectionItem): void {
    if (item === undefined) {
      return;
    }

    // note: null is considered a valid member of the collection array. 
    this.items.push(item);
  }

  public remove(index: number): TCollectionItem {
    if (index < 0 || index >= this.items.length) {
      return undefined;
    }

    var item = this.items.splice(index, 1);
    return item[0];
  }

  public get(index: number): TCollectionItem {
    if (index < 0 || index >= this.items.length) {
      return undefined;
    }

    return this.items[index];
  }

  public length(): number {
    return this.items.length;
  }

  public each(callback: (item: TCollectionItem, index: number, items: Array<TCollectionItem>) => void) {
    if (Array.prototype.forEach) {
      // prefer the built-in forEach method
      this.items.forEach(callback);
    } else {
      // emulate the forEach behaviour.
      for (var i = 0; i < this.items.length; i += 1) {
        callback.call(this.items, this.items[i], i, this.items);
      }
    }
  }

  public find(predicate: (item: TCollectionItem) => boolean): TCollectionItem {
    var item: TCollectionItem;
    for (var i = 0; i < this.items.length; i += 1) {
      item = this.items[i];

      if (predicate.call(this.items, item)) {
        return item;
      }
    }

    return undefined;
  }

  public findAll(predicate: (item: TCollectionItem) => boolean): Array<TCollectionItem> {
    var items: Array<TCollectionItem> = [];
    var item: TCollectionItem;

    for (var i = 0; i < this.items.length; i += 1) {
      item = this.items[i];

      if (predicate.call(this.items, item)) {
        items.push(item);
      }
    }

    return items;
  }
}
 