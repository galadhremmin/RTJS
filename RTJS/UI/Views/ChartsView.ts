import view = require("./View");
import widgets = require("../Widgets/Abstract/Widget");

export class ChartsView extends view.ButtonView {
  public load(callback?: () => void): void {
    super.load(() => {
      this.widgets.each((wdgt: Object) => {
        if (wdgt instanceof widgets.ChartWidget) {
          var chart = <widgets.ChartWidget>wdgt;

          chart.create();
          chart.render();
        }
      });

      if ($.type(callback) === 'function') {
        callback.call(this);
      }
    });
  }
} 