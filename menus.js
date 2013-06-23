Crafty.c("Button", {
    settings: {
        css: {
            "border-color" : "white",
            "border-style" : "solid",
            "border-width" : "1px",
            "color"        : "white",
            "text-align"   : "center",
        }
    },

    init: function () {
        var self = this;

        self.requires("2D, DOM, Mouse, Text");

        self._label         = "";
        self._callback      = null;
        self._enabled       = true;
        self._default_alpha = null;

        self.css(self.settings.css);
        self.textFont({
            size   : "12px",
            family : "monospace"
        });

        self.bind("Click", function () {
            if (self._enabled) {
                self._callback();
            }
        });

        self.bind("MouseOver", function () {
            if (self._enabled) {
                self._default_alpha = self.alpha;
                self.alpha = 1;
            }
        });
        self.bind("MouseOut", function () {
            if (self._enabled) {
                self.alpha = self._default_alpha;
            }
        });

        self.bind("Draw", function (e) {
            var line_height = self._h;

            self._element.innerHTML = "<div style='line-height:" + self._h + "px'>"
                                    + self._label
                                    + "</div>";
        });

        return self;
    },

    label: function (label) {
        var self = this;

        if (typeof(label) !== "undefined") {
            self._label = label;
        } else {
            return self._label;
        }

        return self;
    },

    callback: function (callback) {
        var self = this;

        if (typeof(callback) !== "undefined") {
            self._callback = callback;
        } else {
            return self._callback;
        }

        return self;
    },

    enable: function () {
        var self = this;

        self._enabled = true;
        self.alpha = self._default_alpha;

        return self;
    },

    disable: function () {
        var self = this;

        self._enabled = false;
        self._default_alpha = self.alpha;
        self.alpha = 0.2;

        return self;
    }
});

Crafty.c("Selector", {
    settings: {
        selection_css: {
            "color"       : "white",
            "font-family" : "sans-serif",
            "padding-top" : "10px",
            "text-align"  : "center"
        },
        left_css: {
            "font-size" : "xx-small"
        },
        right_css: {
            "font-size" : "xx-small"
        },
        selector_button: {
            "width"  : 30,
            "height" : 30
        }
    },

    init: function () {
        var self = this;

        self.requires("2D, DOM");

        self._left      = null;
        self._right     = null;
        self._selection = null;

        self._options   = [];
        self._current   = 0;

        self._callback  = function () {};

        self._add_child_components();

        self.bind("Change", function () {
            self._left.attr(self._get_selector_button_attributes());
            self._right.attr(self._get_selector_button_attributes(1));
            self._selection.attr(self._get_selection_attributes());

            self._selection.text(self._options[self._current]);
            self._callback(self._options[self._current]);
        });

        return self;
    },

    _add_child_components: function () {
        var self = this;

        self._selection = Crafty.e("2D, DOM, Text")
                                .css(self.settings.selection_css);

        self._left = Crafty.e("Button")
                           .label("<")
                           .css(self.settings.left_css)
                           .callback(function () {
                               self._current = self._current - 1;
                               if (self._current < 0) {
                                   self._current = self._options.length - 1;
                               }

                               self.trigger("Change");
                           });
        self._right = Crafty.e("Button")
                            .label(">")
                            .css(self.settings.right_css)
                            .callback(function () {
                                self._current = self._current + 1;
                                if (self._current >= self._options.length) {
                                    self._current = 0;
                                }

                                self.trigger("Change");
                            });

        self.attach(self._selection, self._left, self._right);

        return self;
    },

    _get_selector_button_attributes: function (is_right) {
        var self = this;

        var x = self._x;
        var y = self._y;

        if (is_right) {
            x += self._w - self.settings.selector_button.width;
        }

        return {
            "w"     : self.settings.selector_button.width,
            "h"     : self.settings.selector_button.height,
            "x"     : x,
            "y"     : y,
            "alpha" : 0.8
        };
    },

    _get_selection_attributes: function () {
        var self = this;

        return {
            "x" : self._x + self.settings.selector_button.width,
            "y" : self._y,
            "w" : self._w - (self.settings.selector_button.width * 2),
            "h" : self.settings.selector_button.height
        };
    },

    options: function (options) {
        var self = this;

        if (typeof(options) !== "undefined") {
            self._options = options;
        } else {
            return self._options;
        }

        self.trigger("Change");

        return self;
    },

    callback: function (callback) {
        var self = this;

        if (typeof(callback) !== "undefined") {
            self._callback = callback;
        } else {
            return self._callback;
        }

        self.trigger("Change");

        return self;
    },

    get_selected: function () {
        var self = this;

        return self._options[self._current_select];
    },

    reset: function () {
        var self = this;

        self._current_select = 0;

        return self;
    }
});

Crafty.c("GridContainer", {
    init: function () {
        var self = this;

        self.requires("2D, DOM");

        self._padding_top    = 0;
        self._padding_bottom = 0;
        self._padding_left   = 0;
        self._padding_right  = 0;

        self._grid_num_columns = 0;
        self._grid_num_rows    = 0;

        self.css({
            "border-color" : "white",
            "border-style" : "solid",
            "border-width" : "1px",
            "color"        : "white"
        });

        self.alpha = 0.8;

        return self;
    },

    set_position: function (x, y) {
        var self = this;

        self.x = x;
        self.y = y;

        return self;
    },

    set_size: function (width, height) {
        var self = this;

        self.w = width;
        self.h = height;

        return self;
    },

    set_padding: function (top, bottom, left, right) {
        var self = this;

        self._padding_top    = top;
        self._padding_bottom = bottom;
        self._padding_left   = left;
        self._padding_right  = right;

        return self;
    },

    set_grid: function (columns, rows) {
        var self = this;

        self._grid_num_columns = columns;
        self._grid_num_rows    = rows;

        return self;
    },

    add: function () {
        var self = this;

        var items = arguments[0] instanceof Array
                  ? Array.prototype.slice.call(arguments)
                  : [ Array.prototype.slice.call(arguments) ];

        items.forEach(function (item) {
            var element = item[0];
            var column  = item[1];
            var row     = item[2];

            self._place_element(element, column, row);
            self.attach(element);
        });

        return self;
    },

    _place_element: function (element, column, row) {
        var self = this;

        var grid_element_width = (self._w - self._padding_left - self._padding_right)
                               / self._grid_num_columns;
        var grid_element_height = (self._h - self._padding_top - self._padding_bottom)
                                / self._grid_num_rows;

        var left = (grid_element_width * column) + self._padding_left;
        var top = (grid_element_height * row) + self._padding_top;

        element.x = parseInt(left + (grid_element_width / 2) - (element._w / 2) + self._x);
        element.y = parseInt(top + (grid_element_height / 2) - (element._h / 2) + self._y);

        return self;
    }
});
