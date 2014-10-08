/// <reference path="Abstract/Widget.ts"/> 

import widget = require("./Abstract/Widget");
import util = require("RTJS/Util/Observable");
  
export class ListWidget extends widget.ViewOnlyWidget {
  
  public set(array: any): void {
    if (!$.isArray(array)) {
      return;
    }

    var links = this.params().links;
    var highlighting = this.params().highlighting;

    if (links) {
      this.setLinks(array, highlighting);
    } else {
      this.setItems(array);
    }
  }

  private setLinks(links: ILink[], highlightWords: boolean): void {
    var items: Array<string> = [];
    var i: number;
    var link: ILink;
    var listItem: string;

    this.validateLinks(links);

    if (highlightWords) {
      this.validateHighlighting(links);
    }

    for (i = 0; i < links.length; i += 1) {
      link = links[i];
      listItem = this.getListItem(link, highlightWords);

      items.push(listItem);
    }

    this.rootElement.html(items.join(''));

    var me = this;
    this.rootElement.find('li a').on('click', function (ev) {
      me.linkClicked(ev, $(this));
    });
  }

  private getListItem(link: ILink, highlightWords: boolean): string {
    var linkTitle: string = link.title;
    
    if (highlightWords && link.highlight.length > 0) {
      var regeExp = new RegExp(link.highlight, 'gi');
      var titleArray: string[] = link.title.split(regeExp); // Case insensitive split

      if (titleArray.length !== 1) { // length === 1: Link title doesn't contain the word that is to be highlighted - don't highlight anything
        linkTitle = '';

        for (var i = 0; i < titleArray.length; i += 1) {  
          // Because we want to highlight words case insensitive it is important to write out the word with the same casing as in the original title.
          var highlightLength = link.highlight.length;
          var specificHighlightedWord: string;
          if (i !== titleArray.length - 1) {

            // Default string index values for the first iteration
            var start: number = titleArray[0].length;
            var end: number = titleArray[0].length + highlightLength;

            for (var j = 1; j <= i; j += 1) { // note that j starts with 1
              start += titleArray[j].length + highlightLength;
              end = start + highlightLength;
            }
            
            specificHighlightedWord = link.title.substring(start, end);
            linkTitle += titleArray[i] + '<strong>' + specificHighlightedWord + '</strong>';
          }

        }
      }
      // Add the last string from string array
      linkTitle += titleArray[titleArray.length - 1]; 
    }
    return '<li><a class="list-widget-item" href="' + link.url + '" > ' + linkTitle + ' </a></li>';
  }

  private setItems(array: any[]): void {
    var items: Array<string> = [];
    var i: any;

    for (i in array) {
      if (array.hasOwnProperty(i)) {
        items.push('<li>' + array[i] + '</li>');
      }
    }

    this.rootElement.html(items.join(''));
  }

  private params(): IParameters {
    return <IParameters> this.parameters;
  }

  private validateLinks(array: any): void {

    for (var i = 0; i < array.length; i += 1 ) {
      if (!array[i].hasOwnProperty('url') || !array[i].hasOwnProperty('title')) {
        throw 'ListWidget binding object must contain the properties "url" and "title"';
      }
    }
    
  }

  private validateHighlighting(array: any): void {
    for (var i = 0; i < array.length; i += 1) {
      if (!array[i].hasOwnProperty('highlight')) {
        throw 'ListWidget binding object must contain the property "highlight"';
      }
    }
  }

  private linkClicked(ev: JQueryEventObject, source: JQuery): void {
    ev.preventDefault();
    this.notify(new util.Notification('click', source, this.action(), source.attr('href')));
  }
}

interface IParameters {
  links: boolean;
  highlighting: boolean;
}

interface ILink {
  url: string;
  title: string;
  highlight?: string;
}