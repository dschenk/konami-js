/*
 * Konami-JS
 * Forked from: https://github.com/snaptortoise/konami-js/
 * Various changes and enhancements by @gridonic.
 * Licensed under the MIT License (http://opensource.org/licenses/MIT)
 */

var Konami = function (options) {

  var defaultOptions = {
    // Konami Code: '↑', '↑', '↓', '↓', '←', '→', '→', '←', 'b', 'a'
    pattern: [38, 38, 40, 40, 37, 39, 37, 39, 66, 65],
    patternTouch: ['↑', '↑', '↓', '↓', '←', '→', '→', '←', 'tap', 'tap'],
    onInput: null,
    onCorrectInput: null,
    onComboBreak: null,
    onSuccess: null
  };

  // Merging options with defaults
  for (var index in defaultOptions) {
    if (typeof options[index] === 'undefined') {
      options[index] = defaultOptions[index];
    }
  }

  var konami = {

    addEvent: function (obj, type, fn, ref_obj) {

      if (obj.addEventListener) {
        obj.addEventListener(type, fn, false);
      }

      // IE does not know addEventListener
      else if (obj.attachEvent) {

        obj['e' + type + fn] = fn;

        obj[type + fn] = function () {
          obj['e' + type + fn](window.event, ref_obj);
        }

        obj.attachEvent('on' + type, obj[type + fn]);
      }
    },
    pattern: options.pattern,
    orig_pattern: options.pattern,
    load: function (link) {
      this.addEvent(document, 'keydown', function (e, ref_obj) {

        // IE // todo: why do we have to do this?
        if (ref_obj) {
          konami = ref_obj;
        }

        var entered = e ? e.keyCode : event.keyCode;

        // Do something on input
        if (typeof options.onInput === 'function') {
          options.onInput(entered, konami.pattern, konami.orig_pattern);
        }

        // Current input is next key in line
        if (entered === konami.pattern[0]) {
          konami.pattern = konami.pattern.slice(1, konami.pattern.length);

          // Do something on correct input
          if (typeof options.onCorrectInput === 'function') {
            options.onCorrectInput(entered, konami.pattern, konami.orig_pattern);
          }
        }

        // If not, reset the current input
        else {

          // Do something on combo breaker
          if (typeof options.onComboBreak === 'function') {
            options.onComboBreak(entered, konami.pattern, konami.orig_pattern);
          }

          konami.pattern = konami.orig_pattern;
        }

        // Success, all keys have benn pressed
        if (konami.pattern.length === 0) {
          konami.pattern = konami.orig_pattern;
          konami.code(link);
          e.preventDefault();

          return false;
        }


      }, this);

      this.iphone.load(link);
    },
    code: function (link) {
      window.location = link
    },
    iphone: {
      start_x: 0,
      start_y: 0,
      stop_x: 0,
      stop_y: 0,
      tap: false,
      capture: false,
      orig_keys: options.patternTouch,
      keys: options.patternTouch,
      code: function (link) {
        konami.code(link);
      },
      load: function (link) {

        konami.addEvent(document, 'touchmove', function (e) {
          if (e.touches.length == 1 && konami.iphone.capture == true) {
            var touch = e.touches[0];
            konami.iphone.stop_x = touch.pageX;
            konami.iphone.stop_y = touch.pageY;
            konami.iphone.tap = false;
            konami.iphone.capture = false;
            konami.iphone.check_direction();
          }
        });

        konami.addEvent(document, 'touchend', function (evt) {
          if (konami.iphone.tap == true) {
            konami.iphone.check_direction(link);
          }
        }, false);

        konami.addEvent(document, 'touchstart', function (evt) {
          konami.iphone.start_x = evt.changedTouches[0].pageX;
          konami.iphone.start_y = evt.changedTouches[0].pageY;
          konami.iphone.tap = true;
          konami.iphone.capture = true;
        });
      },
      check_direction: function (link) {
        var x_magnitude = Math.abs(this.start_x - this.stop_x);
        var y_magnitude = Math.abs(this.start_y - this.stop_y);
        var x = ((this.start_x - this.stop_x) < 0) ? '→' : '←';
        var y = ((this.start_y - this.stop_y) < 0) ? '↓' : '↑';
        var result = (x_magnitude > y_magnitude) ? x : y;
        result = (this.tap == true) ? 'tap' : result;

        // Do something on any input
        if (typeof options.onInput === 'function') {
          options.onInput(result, this.keys, this.orig_keys);
        }

        // Current input is next key in line
        if (result === this.keys[0]) {
          this.keys = this.keys.slice(1, this.keys.length);

          // Do something on correct input
          if (typeof options.onCorrectInput === 'function') {
            options.onCorrectInput(result, this.keys, this.orig_keys);
          }
        }

        // If not, reset the current input
        else {

          // Do something on combo breaker
          if (typeof options.onComboBreak === 'function') {
            options.onComboBreak(result, this.keys, this.orig_keys);
          }

          this.keys = this.orig_keys;
        }

        // Success, all keys have benn pressed
        if (this.keys.length === 0) {
          this.keys = this.orig_keys;
          this.code(link);
        }
      }
    }
  }

  // Initialize konami with new window.location as onSuccess action
  typeof options.onSuccess === 'string' && konami.load(options.onSuccess);

  // Initialize konami with an onSucccess function
  if (typeof options.onSuccess === 'function') {
    konami.code = options.onSuccess;
    konami.load();
  }

  return konami;
};
