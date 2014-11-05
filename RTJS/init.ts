module rtjs {
  interface ILanguageCache {
    name: string;
    lang: IFrameworkLanguage;
  }

  export class Language {
    private static defaultLanguage: string = "sv_SE";
    private static inst: Language = undefined;
    private currentLanguage: string;
    private currentStrings: IFrameworkLanguage;

    public static instance(): Language {
      if (Language.inst == null) {
        Language.inst = new Language();
      }

      return Language.inst;
    }

    public static current(): IFrameworkLanguage {
      var inst = Language.instance();
      return inst.strings();
    }

    constructor() {
      this.currentLanguage = null;
      this.strings = null;

      var json = window.sessionStorage['rtjslang'];
      if (json) {
        var cacheItem: ILanguageCache = JSON.parse(json);

        if (cacheItem) {
          this.currentStrings = cacheItem.lang;
          this.currentLanguage = cacheItem.name;
        }
      }
    }

    public initialize(cultureName: string, onCompleted?: () => void): void {
      if (cultureName == null) {
        cultureName = Language.defaultLanguage;
      }

      if (cultureName === this.currentLanguage) {
        if (onCompleted) {
          onCompleted.apply(this);
        }

        return;
      }

      require(['Globalization/lang.' + cultureName], (lang) => {
        this.strings = lang;
        this.currentLanguage = cultureName;

        window.sessionStorage.setItem('rtjslang', JSON.stringify({ name: cultureName, lang: lang }));

        if (onCompleted) {
          onCompleted.apply(this);
        }
      }, () => {
        // Something went wrong
        alert('Failed to load language ' + cultureName + '.');
      });
    }

    public strings(): IFrameworkLanguage {
      return this.currentStrings;
    }
  }

  export class Initializer {
    public static rootPath: string = 'RTJS/';
    private isIE: boolean;

    public static getClassName(name: string, includePath?: boolean): string {
      var formatName = (n) => n.substr(0, 1).toLocaleUpperCase() + n.substr(1);
      var parts = name.split('.');
      name = '';

      if (includePath === false) {
        return formatName(parts[parts.length - 1]);
      }

      for (var i = 0; i < parts.length; i += 1) {
        if (parts[i].length < 1) {
          continue;
        }

        name += formatName(parts[i]);

        if (i < parts.length - 1) {
          name += '/';
        }
      }

      return name;
    }

    public static hookInitializer() {
      require.config({
        baseUrl: this.rootPath,
        waitSeconds: 60 // The number of seconds to wait before giving up on loading a script
      });

      require.onError = (error) => {
        console.log(error);
      };

      $(window).ready(() => {
        Language.instance().initialize(null, () => {
          var initializer = new Initializer(null, false);
          initializer.initialize(new BootstrapInitializer(), null);
        });
      });
    }

    constructor(private container: any, private clearSessionCache: boolean) {
      this.isIE = window.navigator.appName.toUpperCase().indexOf('EXPLORER') >= 0;
    }

    public initialize(moduleInitializer: IModuleInitializer<IInitializingModule>, callback?: (modules: any[]) => void) {
      var queue: Array<IInitializingModule> = [];
      var parent = this;

      // Find all HTML elements relevant to the module initializer (for an example, all elements with the data-bootstrap
      // attribute for BootstrapInitializer)
      moduleInitializer.getElements(this.container).each(function () {
        // Transform the element reference to an initializing module
        var workItem = moduleInitializer.transform($(this), parent.clearSessionCache);

        queue.push(workItem);
      });

      this.processQueue(moduleInitializer, queue, (initializedModules: any[]) => {
        this.disableEnterOnTextInputs();

        if ($.type(callback) === 'function') {
          callback.call(this, initializedModules);
        }
      });
    }

    /**
     * Processes the queue containing initializing modules using the specified initializer.
     */
    private processQueue(moduleInitializer: IModuleInitializer<IInitializingModule>, queue: Array<IInitializingModule>, callback?: (initializedModules: any[]) => void): void {
      var dependencyList = this.makeDependencyReferenceArray(moduleInitializer, queue);
      var i: number;

      require(dependencyList.dependencies, () => {
        var loadedDependencies = Array.prototype.slice.call(arguments);
        var modules = [];
        dependencyList.assignBlueprints(loadedDependencies);

        for (i = 0; i < queue.length; i += 1) {
          var initializedModule = moduleInitializer.initialize(queue[i]);
          modules.push(initializedModule);
        }

        if ($.type(callback) === 'function') {
          callback.call(this, modules);
        }
      });
    }

    /**
     * Creates an instance of the DependencyReferenceList class which maintains a complete list of all dependency references across all initializing modules.
     */
    private makeDependencyReferenceArray(moduleInitializer: IModuleInitializer<IInitializingModule>, queue: Array<IInitializingModule>): DependencyReferenceList {
      var dependencies = new DependencyReferenceList();
      var references: Array<DependencyReference>;
      var i: number;
      var j: number;

      for (i = 0; i < queue.length; i += 1) {
        references = moduleInitializer.getDependencies(queue[i]);

        for (j = 0; j < references.length; j += 1) {
          dependencies.addReference(references[j]);
        }
      }

      return dependencies;
    }

    private disableEnterOnTextInputs() {
      $(this.container || 'body').find('input[type="text"]:not(.enter-intercepted)').addClass('enter-intercepted').on('keypress', (event) => {
        if (event.which == 13) { // if enter-key
          event.preventDefault();
          return false;
        }
      });
    }
  }

  /**
   * The protocol for module initializers. Given a root element, an initializer retrieves information about dependencies and transforms these into logical modules.
   */
  export interface IModuleInitializer<TRootModule extends IInitializingModule> {
    /**
     * Retrieves an JQuery selector object identifying all elements involved  in the initialization.
     */
    getElements(rootElement: JQuery): JQuery;

    /**
     * Transforms the specified element into an initializing module.
     */
    transform(element: JQuery, clearCache?: boolean): TRootModule;

    /** 
     * Builds an array with all dependency references available on the specified initializing module.
     */
    getDependencies(initializingModule: TRootModule): Array<DependencyReference>;

    /**
     * Initializes the specified module, finalizing the initialization as blueprints are turned into instances of objects.
     */
    initialize(initializingModule: TRootModule): any;
  }

  /**
   * A protocol defining an initializing module.
   */
  export interface IInitializingModule {
    ref: DependencyReference;
  }

  /**
   * Represents a multi-phased reference to a dependency.
   */
  export class DependencyReference {
    constructor() {
      this.index = -1;
      this.blueprint = undefined;
    }

    public getClassName(): string {
      var parts = this.name.split("/");
      return parts[parts.length - 1];
    }

    /**
     * File path to the dependency on the source tree.
     */
    public name: string;

    /**
     * Index to the object in the list of dependencies retrieved by AMD.
     */
    public index: number;

    /**
     * The "blueprint" for the dependency. This is essentially the class type. It's new-able.
     */
    public blueprint: any;
  }

  class DependencyReferenceList {
    constructor() {
      this.references = [];
      this.dependencies = [];
    }

    /**
     * Adds the specified dependency reference to the collection of references. If the reference hasn't previously been recorded,
     * the list of module paths is updated as well.
     */
    public addReference(reference: DependencyReference) {
      var dependency = reference.name;
      var i: number;

      for (i = 0; i < this.dependencies.length; i += 1) {
        if (this.dependencies[i] == dependency) {
          reference.index = i;
          break;
        }
      }

      if (i === this.dependencies.length) {
        reference.index = i;
        this.dependencies.push(dependency);
      }

      this.references.push(reference);
    }

    /**
     * Assigns the dependencies to the dependency references' blueprint property.
     */
    public assignBlueprints(loadedDependencies: Array<any>) {
      var reference: DependencyReference;
      var i: number;
      var loadedModule: any;

      for (i = 0; i < this.references.length; i += 1) {
        reference = this.references[i];

        if (reference.index < 0 || reference.index >= loadedDependencies.length) {
          reference.blueprint = undefined;
          continue;
        }

        loadedModule = loadedDependencies[reference.index];
        reference.blueprint = loadedModule.hasOwnProperty(reference.getClassName()) ? loadedModule[reference.getClassName()] : loadedModule;
      }
    }

    /**
     * An array containing all dependency references added to this collection. DO NOT MODIFY!
     */
    public references: Array<DependencyReference>;

    /**
     * An array containing module paths for the references added to this collection. DO NOT MODIFY!
     */
    public dependencies: Array<string>;
  }

  /**
   * Initializes all data-bootstrap elements. All controllers, views and widgets associated with the elements being bootstrapped 
   * are also initialized.
   */
  export class BootstrapInitializer implements IModuleInitializer<InitializingBootstrapper> {
    /**
     * An instance of a model is shared. This map enables this by storing initialized models.
     */
    private static loadedModelsMap: any = null;

    constructor() {
      if (!BootstrapInitializer.loadedModelsMap) {
        BootstrapInitializer.loadedModelsMap = {};
      }
    }

    public getElements(rootElement: JQuery): JQuery {
      var bootstraps: JQuery = null;

      if (rootElement === null || rootElement === undefined) {
        bootstraps = $('[data-bootstrap]');
      } else if (typeof rootElement === 'string') {
        rootElement = $(rootElement);
      } 

      if (!bootstraps) {
        if (rootElement && rootElement.length > 0) {
          bootstraps = $('[data-bootstrap]', rootElement);
        }

        if (!bootstraps) {
          // specified selector/jQuery object does not match/contain any elements.
          return $([]);
        }
      }

      return bootstraps;
    }

    public transform(element: JQuery, clearCache?: boolean): InitializingBootstrapper {
      var bootstrapper = new InitializingBootstrapper();
      var controllers: JQuery;
      var name = Initializer.getClassName(element.data('bootstrap'));

      bootstrapper.root = element;
      bootstrapper.ref.name = 'Bootstrap/' + name + 'Bootstrap';
      bootstrapper.modelRef.name = 'Model/' + name + 'Model';

      if (clearCache || /true/i.test(element.data('clear-session'))) {
        bootstrapper.storageRef = new DependencyReference();
        bootstrapper.storageRef.name = 'Util/SessionStorage';
      }

      if (element.data('controller') !== undefined) {
        // The data-controller attribute is on the same element as the data-bootstrap attribute
        controllers = element;
      } else {
        // The data-controller attribute is located on descendants to the element with the data-bootstrap attribute.
        controllers = element.find('[data-controller]');
      }

      controllers.each(function () {
        var controller = new InitializingController();

        controller.root = $(this);
        controller.ref.name = 'UI/Controllers/' + Initializer.getClassName($(this).data('controller')) + 'Controller';

        bootstrapper.controllers.push(controller);
      });

      return bootstrapper;
    }

    public getDependencies(bootstrapper: InitializingBootstrapper): Array<DependencyReference> {
      var references: Array<DependencyReference> = [];
      var i: number;

      references.push(bootstrapper.ref);
      references.push(bootstrapper.modelRef);

      // The storage reference is only set if the bootstrap has been configured to clear cache before initialization.
      if (bootstrapper.storageRef) {
        references.push(bootstrapper.storageRef);
      }

      for (i = 0; i < bootstrapper.controllers.length; i += 1) {
        references.push(bootstrapper.controllers[i].ref);
      }

      return references;
    }

    public initialize(initializingModule: InitializingBootstrapper): any {
      var i: number;
      var data: InitializingController;
      var bootstrapper, controller, model;
      var controllers = new LoadedControllerMap();

      // Clear cache
      if (initializingModule.storageRef) {
        initializingModule.storageRef.blueprint.instance().clear();
      }

      // Initialize an instance of the model, or used an existing one (if shared)
      if (!BootstrapInitializer.loadedModelsMap[initializingModule.modelRef.name]) {
        BootstrapInitializer.loadedModelsMap[initializingModule.modelRef.name] = new initializingModule.modelRef.blueprint();
      }

      model = BootstrapInitializer.loadedModelsMap[initializingModule.modelRef.name];

      for (i = 0; i < initializingModule.controllers.length; i += 1) {
        // Initialize an instance of the controller
        data = initializingModule.controllers[i];
        controller = new data.ref.blueprint(data.root, model);
        controllers.add(data.ref.getClassName(), controller);
      }

      // Initialize an instance of the bootstrapper
      bootstrapper = new initializingModule.ref.blueprint(controllers, model);
      bootstrapper.bootstrap();

      // Push the assembled bootstrapper into a list of active botostrapper. The bootstrap() method
      // will be invoked by the items in this list.
      return bootstrapper;
    }
  }

  /**
   * Initializes all data-widget elements. 
   */
  export class WidgetInitializer implements IModuleInitializer<InitializingWidget> {
    public getElements(rootElement: JQuery): JQuery {
      return rootElement.find('[data-widget]');
    }

    public transform(element: JQuery, clearCache?: boolean): InitializingWidget {
      var data = element.data();
      var widget = new InitializingWidget();
      var paramTransform = (x) => x.substr(0, 1).toLocaleLowerCase() + ((x.length > 1) ? x.substr(1) : '');

      widget.ref.name = 'UI/Widgets/' + rtjs.Initializer.getClassName(data.widget + 'Widget');
      widget.root = element;
      
      for (var key in data) {
        // IE8 stupidity check
        // ReSharper disable ConditionIsAlwaysConst
        if (key === undefined || key === null) {
          continue;
        }
        // ReSharper restore ConditionIsAlwaysConst

        // all widget parameters are prefixed with "widget"
        key = String(key);
        if (key.length > 6 && key.substr(0, 6) === 'widget') {
          widget.parameters[paramTransform(key.substr(6))] = data[key];
        }
      }

      return widget;
    }

    public getDependencies(widget: InitializingWidget): Array<DependencyReference> {
      return [widget.ref];
    }

    public initialize(initializingModule: InitializingWidget): any {
      var widget = new initializingModule.ref.blueprint(initializingModule.root, initializingModule.parameters);
      return widget;
    }
  }

  export class InitializingBootstrapper implements IInitializingModule {
    constructor() {
      this.controllers = [];
      this.storageRef = null;
      this.ref = new DependencyReference();
      this.modelRef = new DependencyReference();
    }

    public root: JQuery;
    public ref: DependencyReference;
    public modelRef: DependencyReference;
    public controllers: Array<InitializingController>;
    public storageRef: DependencyReference;
  }

  export class InitializingController implements IInitializingModule {
    constructor() {
      this.ref = new DependencyReference();
    }

    public root: JQuery;
    public ref: DependencyReference;
  }

  export class InitializingWidget implements IInitializingModule {
    constructor() {
      this.ref = new DependencyReference();
      this.parameters = {};
    }

    public root: JQuery;
    public ref: DependencyReference;
    public parameters: any;
  }

  export class LoadedControllerMap {
    private controllers: any;

    constructor() {
      this.controllers = {};
    }

    public add(name: string, instance: any): void {
      if (this.controllers.hasOwnProperty(name)) {
        if (!$.isArray(this.controllers[name])) {
          this.controllers[name] = [this.controllers[name]];
        }

        this.controllers[name].push(instance);
      } else {
        this.controllers[name] = instance;
      }
    }

    public get(name: string): any {
      return this.controllers[name];
    }

    public each(callback: (controller: any) => void) {
      var key: string;
      var controllers: any;
      var i: number;

      for (key in this.controllers) {
        controllers = this.controllers[key];

        if (!$.isArray(controllers)) {
          controllers = [controllers];
        } 

        for (i = 0; i < controllers.length; i += 1) {
          callback.call(controllers[i], controllers[i]);
        }
      }
    }
  }

  Initializer.hookInitializer();
}
