import IModel = require("./IModel");
import observer = require("../../Util/Observable");
import SessionStorage = require("../../Util/SessionStorage");

export interface IGuideModel extends IModel {
  createSession(resume: boolean, callback: () => void);
}

export class SvcModel extends observer.Observable implements IModel {
  private requests: Array<SvcRequest>;
  private working: boolean;

  constructor(private serviceName: string) {
    super();
    this.requests = [];
    this.working = false;
  }

  public enqueueAll(requests: SvcRequest[]) {
    for (var i = 0; i < requests.length; i += 1) {
      this.enqueue(requests[i]);
    }
  } 

  public enqueue(request: SvcRequest) {
    this.requests.push(request);

    this.tryWorkQueue();
  }

  private dequeue(): SvcRequest {
    if (this.requests.length) {
      var request = this.requests.splice(0, 1)[0];
      return request;
    }

    return null;
  }
    
  private moveToNextWorkItem() {
    this.working = false;
    this.tryWorkQueue();
  }

  /**
    * Attempts to grab the next request item in the working queue.
    */
  private tryWorkQueue() {
    if (this.working) {
      return;
    }

    this.working = true;
    var request = this.dequeue();
    if (!request) {
      this.working = false;
      return;
    }
    
    request.setInferredOrDefaultServiceName(this.serviceName);
    
    $.ajax({
      contentType: 'application/json; charset=UTF-8',
      dataType: 'json',
      processData: false,
      data: request.data ? JSON.stringify(request.data) : null,
      type: 'POST',
      url: '/Services/' + request.serviceName + '.svc/' + request.methodName,
      success: $.proxy(jsonData => {

        // Run next item in the work queue. Do this asynchronously
        window.setTimeout($.proxy(() => this.moveToNextWorkItem(), this), 1);

        // Invoke the callback
        if (request.callback.success) {
          var param = request.callback.success.call(this, jsonData[request.methodName + 'Result']);
          
          // A default notification parameter was passed along. Notify the listeners.
          if (param) {
            this.notify(param);
          }
        }

      }, this),
      error: $.proxy((engine, statusText, errorObj) => {
        // Run next item in the work queue. Do this asynchronously
        window.setTimeout($.proxy(() => this.moveToNextWorkItem(), this), 1);

        if (request.callback.fail) {
          var param = request.callback.fail.call(this, engine.status, statusText, errorObj);

          if (param) {
            this.notify(param);
          }
        }

      }, this)
    });
  }

  public updateValidity(key: string, validity: boolean, data?: any) {
    var storage = SessionStorage.instance();
    data = data || storage.get(key) || {};
    data.Valid = !!validity;
    storage.set(key, data);
  }

  public checkHasChanged(key: string, newData: any) {
    var storage = SessionStorage.instance();
    return ! storage.matches(key, newData);
  }

  public checkValidity(key: string, data?: any) {
    var storage = SessionStorage.instance();
    data = data || storage.get(key) || {};
    return !!(data.Valid);
  }
}

export class SvcRequest {
  constructor(public methodName: string, public data: Object, public callback: ISvcRequestCallback, public serviceName?: string) {
      
  }

  public setInferredOrDefaultServiceName(defaultServiceName: string): void {
    this.serviceName = this.serviceName || defaultServiceName;

    if (this.serviceName.length > 4 && this.serviceName.substr(-4) === '.svc') {
      this.serviceName = this.serviceName.substr(0, this.serviceName.length - 4);
    }
  }
}

export interface ISvcRequestCallback {
  success? (data: any): observer.INotification;
  fail? (statusCode: number, statusText: string, error: string): observer.INotification;
}
