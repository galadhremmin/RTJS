
import util = require("RTJS/Util/Observable");
import collection = require("RTJS/Util/Collection");
import widget = require("RTJS/UI/Widgets/Abstract/Widget");
import widgetB = require("RTJS/UI/Widgets/ButtonWidget");
import widgetI = require("RTJS/UI/Widgets/InputWidget");

export class View extends util.Observable implements util.IObserver {

  private loaded: boolean;
  private pendingBinding: any[];
  private keyedWidgets: Object;
  public widgets: collection.Collection<widget.Widget>;
  public validationErrors: string[];

  constructor(public rootElement: JQuery) {
    super();
    this.widgets = new collection.Collection<widget.Widget>();
    this.validationErrors = [];
    this.keyedWidgets = {};
    this.loaded = false;
    this.pendingBinding = [];
  }

  public load(callback?: () => void): void {
    var initializer = new rtjs.Initializer(this.rootElement, false);
    initializer.initialize(new rtjs.WidgetInitializer(), (loadedWidgets: any[]) => {
      var i: number;
      var loadedWidget: widget.Widget;

      for (i = 0; i < loadedWidgets.length; i += 1) {
        loadedWidget = loadedWidgets[i];
        
        // Instruct the view to observe the widget for notifications, usually raised by 
        // user interaction
        loadedWidget.observe(this);

        // Instruct the widget that it might restore it's previous state, if applicable.
        loadedWidget.restore();

        this.widgets.add(loadedWidget);
      }

      if ($.type(callback) === 'function') {
        callback.call(this);
      }

      // Now that all widgets have been loaded, go through the pending binding list and bind, starting
      // with the oldest (= lowest index) first. Set the loaded flag to true first, in case the view
      // receives a binding event asynchronously.
      //
      // NOTE: binding occurs after the callback has been invoked, to ensure that other initialization
      //       is performed before the widgets are bound to.
      for (i = 0; i < this.pendingBinding.length; i += 1) {
        this.bindInternal(this.pendingBinding[i]);
      }

      this.loaded = true;
      this.pendingBinding = undefined;
    });
  }

  public bind(source: any): void {
    // If components are still being loaded, push the binding source to a pending queue.
    if (!this.loaded) {
      this.pendingBinding.push(source);
    } else {
      this.bindInternal(source);
    }
  }

  /**
    * Invokes the reflow()-method on all widgets associated with this view, which might trigger them to
    * recalculate their dimensions and repaint. For hidden views, this method is useful to invoke when the 
    * view is appears, because some widgets might erroneously assume that their parent containers were
    * in fact visible when they, the widgets, were bound.
    */
  public reflow(): void {
    this.widgets.each((item: widget.Widget) => {
      item.reflow();
    });
  }

  private bindInternal(source: any): void {
    var cache = {},
      path,
      value,
      hashCode,
      // inline method for getting value for a hierarchical path definition (a.path.like.this) 
      getPropertyValue = (absolutePath: string): any => {
        var i: number, tmp = source, props: string[] = absolutePath.split('.');

        // No dot = no hierarchy. Grab the value from the source.
        if (props.length < 2) {
          return tmp[path];
        }

        // Step through the hierarchy, to the end.
        for (i = 0; i < props.length; ++i) {
          if (!tmp || !tmp.hasOwnProperty(props[i])) {
            return undefined;
          }

          tmp = tmp[props[i]];
        }

        return tmp;
      };


    var zombies: number[] = [];
    this.widgets.each((widget: widget.Widget, i: number) => {
      // Ensure that the widget is still residing in the DOM
      if (!widget.inDOM()) {
        zombies.push(i);
        return;
      }

      // Look for the binding property within the specified data source
      path = widget._bindingSource();
      if (path === undefined) {
        return;
      }

      value = getPropertyValue(path);
      if (value === undefined) {
        return;
      }

      if (!cache.hasOwnProperty(path)) {
        cache[path] = JSON.stringify(value).hashCode();
      }

      // Calculate hash code for the binding data source, and look at the previous binding
      // to associate
      hashCode = cache[path];
      if (widget._lastBindingSourceDigest() === hashCode) {
        return;
      }

      widget.bind(value, hashCode);
    });

    // exterminate zombies (widgets living on even as they have left the DOM). This can happen when
    // a dialogue is opened and later closed, or when its contents are mutated.
    if (zombies.length) {
      var index = zombies.length;
      while (index) {
        this.widgets.remove(zombies[index - 1]);
        index -= 1;
      }
    }
  }

  /**
    * Creates an object containing current values from all widgets associated with this view.
    */
  public read(): any {
    var values: Object = {}, me = this;

    this.widgets.each((widget) => {
      if (!widget.writeOnly()) {
        var value = widget.get(),
          path = widget.key();

        if ($.type(path) === 'string') {
          me.appendToObject(values, path, value);
        }
      }
    });

    return values;
  }

  /**
    * Validates all widgets associated with this view. Widgets not supporting interaction are ignored.
    */
  public validate(): boolean {
    // Reset the array with validation errors if it's not empty
    if (this.validationErrors.length > 0) {
      this.validationErrors = [];
    }

    // Validate the view by invoking the validation method on all viable input fields
    var me = this;
    this.widgets.each((widget) => {
      if (!widget.writeOnly() && !widget.validate()) {
        me.validationErrors.push(widget.validationError);
      }
    });

    return this.validationErrors.length === 0;
  }

  /**
    * Returns the widget object for the specified ID. Returns null if none was fund.
    */
  public widgetById<TWidget extends widget.Widget>(id: string): TWidget {

    // Look for previous searches that might be cached. This is a slight performance enhancement.
    if (this.keyedWidgets.hasOwnProperty(id)) {
      return this.keyedWidgets[id];
    }

    var widget = this.widgets.find((w) => w.id() === id) || null;
    if (widget !== null) {
      this.keyedWidgets[id] = widget;
    }

    return <TWidget> widget;
  }

  /**
   * Returns the widget associated with the specified element. Returns null is none is found.
   */
  public widgetByElement<TWidget extends widget.Widget>(element: JQuery): TWidget {
    return <TWidget> this.widgets.find((widget: widget.Widget) => widget.rootElement.is(element)) || null;
  }

  public id(): string {
    return this.rootElement.attr('id');
  }

  public inDOM(): boolean {
    return !!this.rootElement.get(0).parentElement;
  }

  /**
    * Appends the specified value to the target object to the path specified. Hierarchical paths are supported. 
    * The changes are committed on the target object reference, but the reference is also returned in the end.
    */
  private appendToObject(target: Object, absolutePath: string, value: any): Object {
    var names: string[] = absolutePath.split('.');

    if (value === 'true' || value === 'false') {
      value = value === 'true';
    } else if (!isNaN(value)) {
      value = parseFloat(value);
    }

    for (var i = 0; i < names.length - 1; i += 1) {
      if (target[names[i]] === undefined) {
        target[names[i]] = {};
      }

      target = target[names[i]];
    }

    if (names.length) {
      target[names[names.length - 1]] = value;
      target = target[names[names.length - 1]];
    }

    return target;
  }

  public notified(source: Object, data: util.INotification): void {
    this.notify(data); // let the notification 'bubble up'
  }
}
   
export class ButtonView extends View {
  public notified(source: Object, data: any): void {
    if (source instanceof widgetB.ButtonWidget ||
        source instanceof widgetI.InputWidget) {
      super.notified(source, data);
    }
  }
}