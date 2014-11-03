/*jslint indent: 2, white: true, bitwise: true, browser: true */
(function () {
  'use strict';
  if (!String.prototype.format) {
    /// <summary>
    /// Formatterar en sträng enligt samma princip som C# metoden.
    /// 'Hej {0}!'.format('Simon') => 'Hej Simon!'
    /// </summary>
    String.prototype.format = function () {
      var s = this,
          i = arguments.length,
          exp, res, replacement,
          result = s;
      
      while ((i -= 1) >= 0) {
        exp = new RegExp('\\{' + i + '(:([a-z]+))?\\}', 'gm');
        
        while (res = exp.exec(s)) {
          replacement = arguments[i];
          
          /*
          if (res.length > 2) {
            replacement = rtjs.formatter.format(res[2], replacement);
          }*/

          result = result.replace(res[0], replacement);
        }
      }
      
      return result;
    };
  }
  
  if (!String.prototype.hashCode) {
    String.prototype.hashCode = function () {
      var i, hash = 0;
      for (i = 0; i < this.length; i += 1) {
        hash = ((hash << 5) - hash) + this.charCodeAt(i);
        hash = hash & hash;
      }
      return hash;
    };
  }
  
  if (!Array.prototype.reduce) {
    Array.prototype.reduce = function (accumulator, initialValue) {
      if (this===null || this===undefined) {
        throw new TypeError("Object is null or undefined");
      }
      var i = 0, l = this.length >> 0, curr;

      if(typeof accumulator !== "function") { // ES5 : "If IsCallable(callbackfn) is false, throw a TypeError exception."
        throw new TypeError("First argument is not callable");
      }

      if(arguments.length < 2) {
        if (l === 0) {
          throw new TypeError("Array length is 0 and no second argument");
        }
        
        curr = this[0];
        i = 1; // start accumulating at the second element
      } else {
        curr = initialValue;
      }

      while (i < l) {
        if (this.hasOwnProperty(i)) {
          curr = accumulator.call(undefined, curr, this[i], i, this);
        }
        
        i += 1;
      }

      return curr;
    };
  }
  
  // Production steps of ECMA-262, Edition 5, 15.4.4.19
  // Reference: http://es5.github.com/#x15.4.4.19
  if (!Array.prototype.map) {
    Array.prototype.map = function(callback, thisArg) {

      var T, A, k, O, len, kValue, mappedValue;

      if (this === null || this === undefined) {
        throw new TypeError(" this is null or not defined");
      }

      // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
      O = this;

      // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
      // 3. Let len be ToUint32(lenValue).
      len = O.length >>> 0;

      // 4. If IsCallable(callback) is false, throw a TypeError exception.
      // See: http://es5.github.com/#x9.11
      if (typeof callback !== "function") {
        throw new TypeError(callback + " is not a function");
      }

      // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
      if (thisArg) {
        T = thisArg;
      }

      // 6. Let A be a new array created as if by the expression new Array(len) where Array is
      // the standard built-in constructor with that name and len is the value of len.
      A = [len];

      // 7. Let k be 0
      k = 0;

      // 8. Repeat, while k < len
      while(k < len) {

        // a. Let Pk be ToString(k).
        //   This is implicit for LHS operands of the in operator
        // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
        //   This step can be combined with c
        // c. If kPresent is true, then
        if (O.hasOwnProperty(k)) {

          // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
          kValue = O[k];

          // ii. Let mappedValue be the result of calling the Call internal method of callback
          // with T as the this value and argument list containing kValue, k, and O.
          mappedValue = callback.call(T, kValue, k, O);

          // iii. Call the DefineOwnProperty internal method of A with arguments
          // Pk, Property Descriptor {Value: mappedValue, Writable: true, Enumerable: true, Configurable: true},
          // and false.

          // In browsers that support Object.defineProperty, use the following:
          // Object.defineProperty(A, Pk, { value: mappedValue, writable: true, enumerable: true, configurable: true });

          // For best browser support, use the following:
          A[k] = mappedValue;
        }
        // d. Increase k by 1.
        k += 1;
      }

      // 9. return A
      return A;
    };      
  }
  
  window.ApplicationError = function (message) {
    this.name = 'ApplicationError';
    this.message = message || 'An application error occurred';
  };

  window.ApplicationError.prototype = new Error();
  window.ApplicationError.prototype.constructor = window.ApplicationError;
  
  if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (searchElement, fromIndex) {
      if (this === null || this === undefined) {
          throw new TypeError();
      }
      var t, len, n, k;

      t = this;
      len = t.length >>> 0;
      
      if (len === 0) {
          return -1;
      }
      
      n = 0;
      
      if (arguments.length > 0) {
          n = Number(fromIndex);
          if (isNaN(n)) {
              n = 0;
          } else if (n !== 0 && n !== Infinity && n !== -Infinity) {
              n = (n > 0 || -1) * Math.floor(Math.abs(n));
          }
      }
      
      if (n >= len) {
          return -1;
      }
      
      k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
      
      while (k < len) {
        if (t.hasOwnProperty(k) && t[k] === searchElement) {
            return k;
        }
        k += 1;
      }
      
      return -1;
    };
  }

  String.prototype.toCurrencyFormat = function () {
    return this.toCurrency(0, false);
  };

  String.prototype.toCurrency = function (/* optional */ fractalDigits, /* optional */ showKr, /* optional */ roundToHundred) {
    var i, digits, result = [], value, startPos;
    
    // Parse what float value the string currently contains. This will remove trailing
    // zeroes which are obviously redundant
    if (fractalDigits === undefined) {
      fractalDigits = /[,\.]/.test(this) ? 2 : 0;
    }

    value = parseFloat(isNaN(this) ? '0' : this).toFixed(fractalDigits);
    
    if (roundToHundred === true) {
      value = Math.round(value/100) * 100; 
    }

    value = value.toString();

    // Find the comma sign as the thousand separator shall not affect decimals
    startPos = value.indexOf('.');
    
    if (startPos === -1) {
      startPos = value.indexOf(','); // just in case 
    }

    // If no comma sign was found, start from the very last integer 
    if (startPos === -1) {
      startPos = value.length - 1;
    } else {
      // If there was a comma found, start from the first integer, but
      // pre-populate the array with the decimals
      startPos -= 1;
      for (i = value.length - 1; i > startPos; i -= 1) {
        result.push(value.charAt(i));
      }
    }
    
    // Iterate through every digit and add it to the stack, with a 
    // space between every three digits.
    for (i = startPos, digits = 0; i >= 0; i -= 1, digits += 1) {
      if (digits === 3) {
        result.push(showKr !== false ? '&nbsp;' : ' ');
        digits = 0;
      }

      result.push(value.charAt(i));
    }

    result = result.reverse().join('');

    //remove any spaces that the above code added between a negative number and the '-' sign.
    result = result.replace(/\-\s+(?=[0-9])/i, '-');

    //show "kr" if not stated otherwise
    if (showKr !== false) {
      result += '&nbsp;kr';
    }

    return result;
  };

  // IE 8 hasOwnProperty
  window.hasOwnProperty = window.hasOwnProperty || Object.prototype.hasOwnProperty;
}());