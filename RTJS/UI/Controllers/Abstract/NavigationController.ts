import views = require("../../Views/View");
import Model = require("../../../Model/Abstract/Model");
import Controller = require("./Controller");

class NavigationController<TView extends views.View, TModel extends Model> extends Controller<TView, TModel> {
  private activeFragments: any;

  constructor(view: TView, model: TModel) {
    super(view, model);
    this.activeFragments = {};
  }

  public loaded(): void {
    super.loaded();

    $(window).on('hashchange', () => {
      this.identifyNavigationRequest();
    });

    this.identifyNavigationRequest();
  }

  private identifyNavigationRequest(): void {
    var hash = String(location.hash);
    if (hash.length <= 2 || hash[1] !== '?') {
      this.popAllNavigationFragments();
      return;
    }

    var queries = hash.substr(2).split('&');
    var keys = [];
    var i = 0;

    for (i = 0; i < queries.length; i += 1) {
      var query = queries[i].split('=');
      this.pushNavigationFragment(query[0], query.length > 1 ? query[1] : undefined);
      keys.push(query[0]);
    }

    for (var key in this.activeFragments) {
      for (i = 0; i < keys.length; i += 1) {
        if (keys[i] === key) {
          break;
        }
      }

      if (i === keys.length) {
        this.popNavigationFragment(key);
      }
    }
  }

  private pushNavigationFragment(fragmentName: string, value: string): void {
    if (value !== undefined && this.activeFragments[fragmentName] === value) {
      return;
    }

    this.activeFragments[fragmentName] = value;

    var methodName = this.formatForMethodName(fragmentName) + 'NavigateIn';
    if (this[methodName]) {
      this[methodName].call(this, value);
    }
  }

  private popAllNavigationFragments(): void {
    for (var key in this.activeFragments) {
      this.popNavigationFragment(key);
    }

    this.activeFragments = [];
  }

  private popNavigationFragment(fragmentName: string): void {
    delete this.activeFragments[fragmentName];

    var methodName = this.formatForMethodName(fragmentName) + 'NavigateOut';
    if (this[methodName]) {
      this[methodName].call(this);
    }
  }

  private formatForMethodName(fragmentName: string): string {
    return fragmentName.substr(0, 1).toLowerCase() + fragmentName.substr(1);
  }
}

export = NavigationController;