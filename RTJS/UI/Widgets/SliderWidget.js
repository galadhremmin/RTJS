/// <reference path="Abstract/Widget.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./Abstract/Widget", "RTJS/Util/Observable"], function(require, exports, widget, util) {
    var SliderWidget = (function (_super) {
        __extends(SliderWidget, _super);
        function SliderWidget(rootElement, parameters) {
            var _this = this;
            _super.call(this, rootElement, parameters);
            this.value = parameters ? parameters.min || 0 : 0;

            var $elem = this.rootElement;
            $elem.addClass('widget-slider');

            var ball = $('<a href="#">Handtag</a>');
            ball.click(function (ev) {
                if (ev.preventDefault) {
                    ev.preventDefault();
                } else {
                    ev.returnValue = false;
                }
            });

            this.rootElement.on('mousedown', function (event) {
                return _this.beginSlide(event);
            });
            this.rootElement.on('touchstart', function (event) {
                return _this.beginSlide(event);
            });
            this.rootElement.on('keyup', function (event) {
                return _this.keyedSlide(event);
            });

            this.rootElement.append(ball);
            this.rootElement.append('<div class="widget-slider-space"><div class="marked-area"></div><div class="shadow"></div></div>');

            //We need to recalculate the offsets for the slider if the user resizes the window while it is onscreen.
            $(window).on('resize.recalcslider', function () {
                return function () {
                    return _this.recalculatePositions();
                };
            });

            window.setTimeout(function () {
                return _this.set(_this.params().min);
            }, 0);
        }
        SliderWidget.prototype.set = function (v) {
            var markArea = false;

            // This binding method is multi-purposed: it supports setup parameters, as well as
            // value binding, once the slider has been initialized. This functionality enables
            // late initialization through data properties from the data model.
            if (v instanceof SliderSetup) {
                var setup = v;
                this.parameters = {
                    min: setup.min,
                    max: setup.max,
                    step: setup.step,
                    markedLeft: setup.markedLeft,
                    markedRight: setup.markedRight
                };

                this.steps = undefined;

                v = setup.initialValue;

                markArea = true;
            }

            if (v === undefined || v === null || isNaN(v)) {
                return;
            }

            if (v > this.params().max) {
                this.value = this.params().max; // value exceeds allowed maximum?
            } else if (v < this.params().min) {
                this.value = this.params().min; // value is lower than the minimum?
            } else {
                this.value = Math.round(v / this.params().step) * this.params().step; // Calculate the nearest step
            }

            this.slide({ pageX: this.positionXForValue(this.value) });

            if (markArea) {
                this.setMarkedArea();
            }
        };

        SliderWidget.prototype.get = function () {
            return this.value;
        };

        SliderWidget.prototype.params = function () {
            return this.parameters;
        };

        SliderWidget.prototype.setup = function () {
            if (this.steps !== undefined) {
                return;
            }

            // Save the slider's left hand side from the left side of the screen
            this.startX = this.rootElement.offset().left;

            // Save the slider's right hand side from the left side of the screen
            this.endX = this.rootElement.innerWidth() + this.startX;

            // Calculate the number of available steps between the defined minimum and maximum values
            this.steps = (this.params().max - this.params().min) / parseFloat(this.params().step);

            // Calculate the precision based on the number of integers defined as the step size
            this.precision = Math.pow(10, String(this.params().step).replace(/^[0-9]/g, '').length - 1);

            // Calculate width of the handle (first <a> in slider element)
            this.handleW = this.rootElement.children('a').outerWidth();

            if (this.value === undefined || this.value === null) {
                this.value = this.params().min;
            }
        };

        SliderWidget.prototype.setMarkedArea = function () {
            if (this.params().markedRight == null || this.params().markedRight == undefined && this.params().markedLeft == null || this.params().markedRight == undefined) {
                return;
            }

            var marker = $('.marked-area', this.rootElement), markedRight = this.params().markedRight, markedLeft = this.params().markedLeft;

            if (!markedLeft || markedLeft <= this.params().min) {
                markedLeft = this.params().min;
                marker.addClass('left-radius');
            }
            if (!markedRight || markedRight >= this.params().max) {
                markedRight = this.params().max;
                marker.addClass('right-radius');
            }

            var rightPosition = this.calculateRelativePosition(this.positionXForValue(markedRight), 0), leftPosition = this.calculateRelativePosition(this.positionXForValue(markedLeft), 0), markedWidth = rightPosition.position - leftPosition.position;

            marker[0].style.width = markedWidth + 'px';
            marker[0].style.left = leftPosition.position + 'px';
        };

        SliderWidget.prototype.calculateRelativePosition = function (pageX, offsetWidth) {
            var sliderWidth = (this.endX - this.startX), pixelWidthOfStep = sliderWidth / this.steps, maxX = sliderWidth - (offsetWidth / 2), minX = offsetWidth / 2, contextX, positionInSteps, offsetPosition, resultVal;

            if (pageX < this.startX) {
                contextX = 0;
            } else if (pageX > this.endX) {
                contextX = sliderWidth;
            } else {
                contextX = pageX - this.startX;
            }

            positionInSteps = Math.round(contextX / pixelWidthOfStep);
            resultVal = Math.round(((positionInSteps * this.params().step) + this.params().min) * this.precision) / this.precision;

            if (this.value < this.params().min) {
                resultVal = this.params().min;
            } else if (this.value > this.params().max) {
                resultVal = this.params().max;
            }

            if (contextX < minX) {
                offsetPosition = minX;
            } else if (contextX > maxX) {
                offsetPosition = maxX;
            } else {
                offsetPosition = contextX;
            }

            return { val: resultVal, pxStepWidth: pixelWidthOfStep, numberSteps: positionInSteps, position: offsetPosition, maxX: maxX, minX: minX };
        };

        SliderWidget.prototype.recalculatePositions = function () {
            // Save the slider's left hand side from the left side of the screen
            this.startX = this.rootElement.offset().left;

            // Save the slider's right hand side from the left side of the screen
            this.endX = this.rootElement.innerWidth() + this.startX;
        };

        SliderWidget.prototype.beginSlide = function (ev) {
            var _this = this;
            // Prepare calculation values
            this.setup();

            // Assign the last reported value to null, forcing the bound value to be reported within the first iteration.
            this.lastReportedValue = null;

            // Attach the touch and mouse move events to the document element. These events are not attached to the <A> element
            // as it should be possible to touch outside the element and still affect its position.
            var d = $(document);

            d.on('touchmove', function (event) {
                return _this.slide(event);
            });
            d.on('mousemove', function (event) {
                return _this.slide(event);
            });
            d.on('touchcancel', function (event) {
                return _this.endSlide(event);
            });
            d.on('mouseleave', function (event) {
                return _this.endSlide(event);
            });
            d.on('mouseup', function (event) {
                return _this.endSlide(event);
            });
            d.on('touchend', function (event) {
                return _this.endSlide(event);
            });

            ev.preventDefault();
        };

        SliderWidget.prototype.slide = function (ev) {
            var x;

            if (ev.originalEvent && ev.originalEvent.touches && ev.originalEvent.touches.length) {
                x = ev.originalEvent.touches[0].pageX;
            } else {
                x = ev.pageX;

                if (x === undefined) {
                    x = 0;
                }
            }
            if (ev.hasOwnProperty('preventDefault')) {
                ev.preventDefault();
            }

            var calculatedPositionData = this.calculateRelativePosition(x, this.handleW);

            this.value = calculatedPositionData.val;

            this.rootElement.get(0).firstChild.style.left = calculatedPositionData.position + 'px';

            if (this.lastReportedValue !== this.value) {
                this.notify(new util.Notification('change', this.rootElement, this.action(), this.get()));
                this.lastReportedValue = this.value;
            }
        };

        SliderWidget.prototype.keyedSlide = function (ev) {
            var mod = 0;

            switch (ev.which) {
                case 39:
                    mod = 1;
                    break;
                case 37:
                    mod = -1;
                    break;
                default:
                    return;
            }

            ev.preventDefault();

            this.slide({ pageX: this.positionXForValue(this.get() + (mod * this.params().step)) });
        };

        SliderWidget.prototype.positionXForValue = function (v) {
            this.setup(); // Prepare calculation values

            var w = (this.endX - this.startX) / this.steps, vInSteps = Math.round((v - this.params().min) / parseFloat(this.params().step)), x = this.startX + (vInSteps * w);

            return x;
        };

        SliderWidget.prototype.endSlide = function (ev) {
            // Detach the touch events
            var d = $(document);

            d.off('touchmove');
            d.off('mousemove');
            d.off('touchcancel');
            d.off('mouseleave');
            d.off('mouseup');
            d.off('touchend');
        };
        return SliderWidget;
    })(widget.Widget);
    exports.SliderWidget = SliderWidget;

    var SliderSetup = (function () {
        function SliderSetup(min, max, step, initialValue, markedLeft, markedRight) {
            this.min = min;
            this.max = max;
            this.step = step;
            this.initialValue = initialValue;
            this.markedLeft = markedLeft;
            this.markedRight = markedRight;
        }
        return SliderSetup;
    })();
    exports.SliderSetup = SliderSetup;
});
