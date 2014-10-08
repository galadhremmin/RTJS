var rtjs;
(function (rtjs) {
    var Initializer = (function () {
        function Initializer(container, clearSessionCache) {
            this.container = container;
            this.clearSessionCache = clearSessionCache;
            this.isIE = window.navigator.appName.toUpperCase().indexOf('EXPLORER') >= 0;
        }
        Initializer.getClassName = function (name, includePath) {
            var formatName = function (n) {
                return n.substr(0, 1).toLocaleUpperCase() + n.substr(1);
            };
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
        };

        Initializer.hookInitializer = function () {
            require.config({
                baseUrl: '/',
                waitSeconds: 60
            });

            require.onError = function (error) {
                console.log(error);
            };

            $(window).ready(function () {
                var initializer = new Initializer(null, false);
                initializer.initialize(new BootstrapInitializer(), null);
            });
        };

        Initializer.prototype.initialize = function (moduleInitializer, callback) {
            var _this = this;
            var queue = [];
            var parent = this;

            // Find all HTML elements relevant to the module initializer (for an example, all elements with the data-bootstrap
            // attribute for BootstrapInitializer)
            moduleInitializer.getElements(this.container).each(function () {
                // Transform the element reference to an initializing module
                var workItem = moduleInitializer.transform($(this), parent.clearSessionCache);

                queue.push(workItem);
            });

            this.processQueue(moduleInitializer, queue, function (initializedModules) {
                _this.disableEnterOnTextInputs();

                if ($.type(callback) === 'function') {
                    callback.call(_this, initializedModules);
                }
            });
        };

        /**
        * Processes the queue containing initializing modules using the specified initializer.
        */
        Initializer.prototype.processQueue = function (moduleInitializer, queue, callback) {
            var _this = this;
            var dependencyList = this.makeDependencyReferenceArray(moduleInitializer, queue);
            var i;

            require(dependencyList.dependencies, function () {
                var loadedDependencies = Array.prototype.slice.call(arguments);
                var modules = [];
                dependencyList.assignBlueprints(loadedDependencies);

                for (i = 0; i < queue.length; i += 1) {
                    var initializedModule = moduleInitializer.initialize(queue[i]);
                    modules.push(initializedModule);
                }

                if ($.type(callback) === 'function') {
                    callback.call(_this, modules);
                }
            });
        };

        /**
        * Creates an instance of the DependencyReferenceList class which maintains a complete list of all dependency references across all initializing modules.
        */
        Initializer.prototype.makeDependencyReferenceArray = function (moduleInitializer, queue) {
            var dependencies = new DependencyReferenceList();
            var references;
            var i;
            var j;

            for (i = 0; i < queue.length; i += 1) {
                references = moduleInitializer.getDependencies(queue[i]);

                for (j = 0; j < references.length; j += 1) {
                    dependencies.addReference(references[j]);
                }
            }

            return dependencies;
        };

        Initializer.prototype.disableEnterOnTextInputs = function () {
            $(this.container || 'body').find('input[type="text"]:not(.enter-intercepted)').addClass('enter-intercepted').on('keypress', function (event) {
                if (event.which == 13) {
                    event.preventDefault();
                    return false;
                }
            });
        };
        Initializer.rootPath = 'RTJS/';
        return Initializer;
    })();
    rtjs.Initializer = Initializer;

    

    

    /**
    * Represents a multi-phased reference to a dependency.
    */
    var DependencyReference = (function () {
        function DependencyReference() {
            this.index = -1;
            this.blueprint = undefined;
        }
        DependencyReference.prototype.getClassName = function () {
            var parts = this.name.split("/");
            return parts[parts.length - 1];
        };
        return DependencyReference;
    })();
    rtjs.DependencyReference = DependencyReference;

    var DependencyReferenceList = (function () {
        function DependencyReferenceList() {
            this.references = [];
            this.dependencies = [];
        }
        /**
        * Adds the specified dependency reference to the collection of references. If the reference hasn't previously been recorded,
        * the list of module paths is updated as well.
        */
        DependencyReferenceList.prototype.addReference = function (reference) {
            var dependency = Initializer.rootPath + reference.name;
            var i;

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
        };

        /**
        * Assigns the dependencies to the dependency references' blueprint property.
        */
        DependencyReferenceList.prototype.assignBlueprints = function (loadedDependencies) {
            var reference;
            var i;
            for (i = 0; i < this.references.length; i += 1) {
                reference = this.references[i];

                if (reference.index < 0 || reference.index >= loadedDependencies.length) {
                    reference.blueprint = undefined;
                    continue;
                }

                reference.blueprint = loadedDependencies[reference.index][reference.getClassName()];
            }
        };
        return DependencyReferenceList;
    })();

    /**
    * Initializes all data-bootstrap elements. All controllers, views and widgets associated with the elements being bootstrapped
    * are also initialized.
    */
    var BootstrapInitializer = (function () {
        function BootstrapInitializer() {
            this.loadedModelsMap = {};
        }
        BootstrapInitializer.prototype.getElements = function (rootElement) {
            var bootstraps = null;

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
        };

        BootstrapInitializer.prototype.transform = function (element, clearCache) {
            var bootstrapper = new InitializingBootstrapper();
            var controllers;
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
        };

        BootstrapInitializer.prototype.getDependencies = function (bootstrapper) {
            var references = [];
            var i;

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
        };

        BootstrapInitializer.prototype.initialize = function (initializingModule) {
            var i;
            var data;
            var bootstrapper, controller, model;
            var controllers = new LoadedControllerMap();

            // Clear cache
            if (initializingModule.storageRef) {
                initializingModule.storageRef.blueprint.instance().clear();
            }

            // Initialize an instance of the model, or used an existing one (if shared)
            if (!this.loadedModelsMap[initializingModule.modelRef.index]) {
                this.loadedModelsMap[initializingModule.modelRef.index] = new initializingModule.modelRef.blueprint();
            }

            model = this.loadedModelsMap[initializingModule.modelRef.index];

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
        };
        return BootstrapInitializer;
    })();
    rtjs.BootstrapInitializer = BootstrapInitializer;

    /**
    * Initializes all data-widget elements.
    */
    var WidgetInitializer = (function () {
        function WidgetInitializer() {
        }
        WidgetInitializer.prototype.getElements = function (rootElement) {
            return rootElement.find('[data-widget]');
        };

        WidgetInitializer.prototype.transform = function (element, clearCache) {
            var data = element.data();
            var widget = new InitializingWidget();
            var paramTransform = function (x) {
                return x.substr(0, 1).toLocaleLowerCase() + ((x.length > 1) ? x.substr(1) : '');
            };

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
        };

        WidgetInitializer.prototype.getDependencies = function (widget) {
            return [widget.ref];
        };

        WidgetInitializer.prototype.initialize = function (initializingModule) {
            var widget = new initializingModule.ref.blueprint(initializingModule.root, initializingModule.parameters);
            return widget;
        };
        return WidgetInitializer;
    })();
    rtjs.WidgetInitializer = WidgetInitializer;

    var InitializingBootstrapper = (function () {
        function InitializingBootstrapper() {
            this.controllers = [];
            this.storageRef = null;
            this.ref = new DependencyReference();
            this.modelRef = new DependencyReference();
        }
        return InitializingBootstrapper;
    })();
    rtjs.InitializingBootstrapper = InitializingBootstrapper;

    var InitializingController = (function () {
        function InitializingController() {
            this.ref = new DependencyReference();
        }
        return InitializingController;
    })();
    rtjs.InitializingController = InitializingController;

    var InitializingWidget = (function () {
        function InitializingWidget() {
            this.ref = new DependencyReference();
            this.parameters = {};
        }
        return InitializingWidget;
    })();
    rtjs.InitializingWidget = InitializingWidget;

    var LoadedControllerMap = (function () {
        function LoadedControllerMap() {
            this.controllers = {};
        }
        LoadedControllerMap.prototype.add = function (name, instance) {
            if (this.controllers.hasOwnProperty(name)) {
                if (!$.isArray(this.controllers[name])) {
                    this.controllers[name] = [this.controllers[name]];
                }

                this.controllers[name].push(instance);
            } else {
                this.controllers[name] = instance;
            }
        };

        LoadedControllerMap.prototype.get = function (name) {
            return this.controllers[name];
        };

        LoadedControllerMap.prototype.each = function (callback) {
            var key;
            var controllers;
            var i;

            for (key in this.controllers) {
                controllers = this.controllers[key];

                if (!$.isArray(controllers)) {
                    controllers = [controllers];
                }

                for (i = 0; i < controllers.length; i += 1) {
                    callback.call(controllers[i], controllers[i]);
                }
            }
        };
        return LoadedControllerMap;
    })();
    rtjs.LoadedControllerMap = LoadedControllerMap;

    Initializer.hookInitializer();
})(rtjs || (rtjs = {}));
