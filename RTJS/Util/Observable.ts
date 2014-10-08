export class Observable implements IObservable {
  private observers: Array<IObserver>;

  constructor() {
    this.observers = [];
  }

  public observe(observer: IObserver): void {

    // Prevent that multiple references are made to the same instance
    for (var i = 0; i < this.observers.length; i += 1) {
      if (this.observers[i] === observer) {
        return;
      }
    }

    this.observers.push(observer);
  }

  public unobserve(observer: IObserver): boolean {

    // Looks for the reference in the list of observers, and remove (splice) it
    for (var i = 0; i < this.observers.length; i += 1) {
      if (this.observers[i] === observer) {
        this.observers.splice(i, 1);
        return true;
      }
    }

    return false;
  }

  /**
    * Notifies all observers with the specified message payload. This is a synchronous operation.
    */
  public notify(payload: INotification): void {
      
    // Run the notification method on each observer
    for (var i = 0; i < this.observers.length; i += 1) {
      this.observers[i].notified.call(this.observers[i], this, payload);
    }

  }
}

export class Notification implements INotification  {
  constructor(private typeName: string, private notificationSource: any, private widgetAction?: string, private payload?: any) {
  }

  public type(): string {
    return this.typeName;
  }

  public source(): any {
    return this.notificationSource;
  }

  public action(): string {
    return this.widgetAction;
  }

  public data(): any {
    return this.payload;
  }
}

export interface INotification {
  type(): string;
  source(): any;
  action(): string;
  data(): any;
}

export interface IObserver {
  notified(source: Object, data: INotification): void;
}

export interface IObservable {
  observe(observer: IObserver);
}
