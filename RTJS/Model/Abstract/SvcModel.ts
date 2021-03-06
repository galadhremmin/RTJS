﻿import Model = require("./Model");
import observer = require("../../Util/Observable");
import SessionStorage = require("../../Util/SessionStorage");

export class SvcModel extends observer.Observable implements Model {
  private requests: Array<SvcRequest>;
  private working: boolean;
  private serviceFormatter: ISvcFormatter;

  constructor(private serviceName: string, svcFormatter?: ISvcFormatter) {
    super();
    this.requests = [];
    this.working = false;
    this.serviceFormatter = svcFormatter || {
      formatSvcUrl(request: SvcRequest): string {
        return '/Services/' + request.serviceName + '.svc/' + request.methodName;
      },
      retrieveData(request: SvcRequest, data: any) {
        return data[request.methodName + 'Result']
      }
    };
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
      url: this.serviceFormatter.formatSvcUrl(request),
      success: $.proxy(jsonData => {

        // Run next item in the work queue. Do this asynchronously
        window.setTimeout($.proxy(() => this.moveToNextWorkItem(), this), 1);

        // Invoke the callback
        if (request.callback.success) {
          var param = request.callback.success.call(this, this.serviceFormatter.retrieveData(request, jsonData));
          
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

/**
  * Used to allow the svcmodel to interface different types of web services.
  * See default implementation in the constructor of SvcModel.
  * 
  * formatSvcUrl: should return the correctly formatted service url for the request provided.
  * retrieveData: used to extract data from the service reply, and convert it to a format usable
  * by the rest of the app.
  */
export interface ISvcFormatter {
  formatSvcUrl(request: SvcRequest): string;
  retrieveData(request: SvcRequest, data: any): any;
}