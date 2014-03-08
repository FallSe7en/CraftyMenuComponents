(function () {
    "use strict";

    Crafty.c("Button", {
        init: function () {
            var self = this;

            self.requires("2D, DOM, Mouse, Text");

            self._label         = "";
            self._callback      = undefined;
            self._enabled       = true;
            self._default_alpha = undefined;

            self.css({
                "border-color" : "white",
                "border-style" : "solid",
                "border-width" : "1px",
                "color"        : "white",
                "text-align"   : "center"
            });
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

            self.bind("Draw", self._draw_label);

            return self;
        },

        _draw_label: function () {
            var self = this;

            var line_height = self._h;

            self._element.innerHTML = "<div style='line-height:" + self._h + "px'>"
                                    + self._label
                                    + "</div>";

            return self;
        },

        label: function (label) {
            var self = this;

            if (typeof(label) !== "undefined") {
                self._label = label;
                self._draw_label();
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

            self._left      = undefined;
            self._right     = undefined;
            self._selection = undefined;

            self._options   = [];
            self._current   = 0;

            self._callback  = function () {};

            self._add_child_components();

            self.bind("Change", function () {
                var current_selection = self._options[self._current];

                self._left.attr(self._get_selector_button_attributes());
                self._right.attr(self._get_selector_button_attributes(1));

                if (typeof(current_selection) === "string") {
                    self._selection.attr(self._get_selection_attributes());
                    self._selection.text(self._options[self._current]);
                } else if (typeof(current_selection) === "function") {
                    self._place_entity(current_selection);
                }

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

            var w = self.settings.selector_button.width;
            var h = self.settings.selector_button.height;

            var x = self._x;
            var y = parseInt(self._y + (self._h / 2) - (h / 2));

            if (is_right) {
                x += self._w - w;
            }

            return {
                "w"     : w,
                "h"     : h,
                "x"     : x,
                "y"     : y,
                "alpha" : 0.8
            };
        },

        _get_selection_attributes: function () {
            var self = this;

            var y = parseInt(
                self._y + (self._h / 2) - (self.settings.selector_button.height / 2)
            );

            return {
                "x" : self._x + self.settings.selector_button.width,
                "y" : y,
                "w" : self._w - (self.settings.selector_button.width * 2),
                "h" : self.settings.selector_button.height
            };
        },

        _place_entity: function (entity_function) {
            var self = this;

            var entity = entity_function();
            
            entity.attr({
                x: parseInt(self._x + (self._w / 2) - (entity._w / 2)),
                y: parseInt(self._y + (self._h / 2) - (entity._h / 2))
            });

            return self;
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

            return self._options[self._current];
        },

        reset: function () {
            var self = this;

            self._current = 0;

            return self;
        }
    });

    Crafty.c("GridContainer", {
        settings: {
            css: {
                "border-color" : "white",
                "border-style" : "solid",
                "border-width" : "1px",
                "color"        : "white"
            }
        },

        init: function () {
            var self = this;

            self.requires("2D, DOM");

            self._padding_top    = 0;
            self._padding_bottom = 0;
            self._padding_left   = 0;
            self._padding_right  = 0;

            self._grid_num_columns = 0;
            self._grid_num_rows    = 0;

            self._elements = {};

            self.css(self.settings.css);

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
            var items = Array.prototype.slice.call(arguments);

            items.forEach(function (item) {
                var id      = item[0];
                var element = item[1];
                var column  = item[2];
                var row     = item[3];
                var colspan = item[4] || 1;
                var rowspan = item[5] || 1;

                if (colspan > self._grid_num_columns) {
                    colspan = self._grid_num_columns;
                }
                if (rowspan > self._grid_num_rows) {
                    rowspan = self._grid_num_rows;
                }

                self._place_element(element, column, row, colspan, rowspan);

                self._elements[id] = {
                    element : element,
                    column  : column,
                    row     : row
                };
            });

            return self;
        },

        remove: function () {
            var self = this;

            var ids = arguments[0] instanceof Array
                    ? Array.prototype.slice.call(arguments)
                    : [ Array.prototype.slice.call(arguments) ];

            ids.forEach(function (id) {
                if (id in self._elements) {
                    self.detach(self._elements[id].element);
                    self._elements[id].element.destroy();
                    delete self._elements[id];
                }
            });

            return self;
        },

        _place_element: function (element, column, row, colspan, rowspan) {
            var self = this;

            var grid_element_width = (self._w - self._padding_left - self._padding_right)
                                   / self._grid_num_columns * colspan;
            var grid_element_height = (self._h - self._padding_top - self._padding_bottom)
                                    / self._grid_num_rows * rowspan;

            var left = (grid_element_width * column) + self._padding_left;
            var top = (grid_element_height * row) + self._padding_top;

            element.x = parseInt(left + (grid_element_width / 2) - (element._w / 2) + self._x);
            element.y = parseInt(top + (grid_element_height / 2) - (element._h / 2) + self._y);

            self.attach(element);

            return self;
        },
    });

    Crafty.c("ColorSwatches", {
        init: function () {
            var self = this;

            self.requires("GridContainer");

            self._swatches = [];
            self._callback = function () {};

            self.css({
                "border-style" : "none",
                "border-width" : "0px"
            });

            return self;
        },

        swatches: function (swatches) {
            var self = this;

            for (var i = 0; i < self._swatches.length; i++) {
                self._swatches.splice(i, 1).destroy();
            }

            self._determine_grid_dimensions(swatches.length);

            var x = 0, y = 0;
            var swatch_width = parseInt(self._w / self._grid_num_columns);
            var swatch_height = parseInt(self._h / self._grid_num_rows);

            swatches.forEach(function (swatch) {
                var swatch_entity = Crafty.e("2D, DOM, Mouse")
                    .attr({ w: swatch_width, h: swatch_height })
                    .css({ "background-color" : swatch })
                   .bind("Click", function () { self._callback(swatch); });

                self.add([ swatch, swatch_entity, x, y ]);
                self._swatches.push(swatch_entity);

                if (x >= self._grid_num_columns - 1) {
                    x = 0;
                    y++;
                } else {
                    x++;
                }
            });

            return self;
        },

        _determine_grid_dimensions: function (num_swatches) {
            var self = this;

            if (self._grid_num_columns === 0 && self._grid_num_rows === 0) {
                var num_y = Math.floor(num_swatches / 2);
                var num_x = num_swatches - num_y;

                self.set_grid(num_x, num_y);
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
        }
    });

    Crafty.c("DropDown", {
        init: function () {
            var self = this;

            self.requires("2D, DOM");

            self._current_selected = undefined;

            self._show_options_button = undefined;
            self._shown_options = [];
            self._is_showing = false;

            self._options = [];
            self._current = 0;

            self._callback = function () {};

            self._add_child_components();
            self.bind("Change", self._place_child_components);

            return self;
        },

        show_options: function () {
            var self = this;

            self._shown_options.forEach(function (option) {
                option.visible = true;
            });
            self._is_showing = true;

            return self;
        },

        hide_options: function () {
            var self = this;

            self._shown_options.forEach(function (option) {
                option.visible = false;
            });
            self._is_showing = false;

            return self;
        },

        toggle_options: function () {
            var self = this;

            if (self._is_showing) {
                self.hide_options();
                self._is_showing = false;
            } else {
                self.show_options();
                self._is_showing = true;
            }

            return self;
        },

        _add_child_components: function () {
            var self = this;

            self._show_options_button = Crafty.e("Button")
                .label("&#8711;")
                .css({
                    "font-size"    : "small",
                    "border-style" : "solid",
                    "border-width" : "1px"
                })
                .callback(function () {
                    self.toggle_options();
                });

            self._current_selected = Crafty.e("Button")
                .css({
                    "text-align"   : "center",
                    "line-height"  : self._h,
                    "border-style" : "solid",
                    "border-width" : "1px"
                })
                .label("Select")
                .disable();
            self._current_selected.alpha = 1;

            self.attach(self._show_options_button);
            self.attach(self._current_selected);

            return self;
        },

        _place_child_components: function () {
            var self = this;

            self._show_options_button.attr({
                "w"     : self._h,
                "h"     : self._h,
                "x"     : self._x + self._w - self._h,
                "y"     : self._y,
                "alpha" : 0.8
            });

            self._current_selected.attr({
                "w" : self._w - self._show_options_button._w,
                "h" : self._h,
                "x" : self._x,
                "y" : self._y
            });
            
            return self;
        },

        _place_shown_options: function () {
            var self = this;

            for (var shown_option in self._shown_options) {
                self.detach(shown_option);
                shown_option.destroy();
            }
            self._shown_options = [];

            self._options.forEach(function (option, i) {
                var shown_option = Crafty.e("Button")
                    .label(option)
                    .attr({
                        "w"     : self._w,
                        "h"     : self._h,
                        "x"     : self._x,
                        "y"     : self._y + (self._h * (i + 1)) + 2,
                        "alpha" : 0.8
                    })
                    .css({
                        "background-color" : "black",
                        "border-style"     : "none"
                    })
                    .callback(function () {
                        self._current = i;
                        self._current_selected.label(option);
                        self._callback(option);
                        self.hide_options();
                    });

                shown_option.z = 100;

                self.attach(shown_option);
                self._shown_options.push(shown_option);
            });

            self.hide_options();

            return self;
        },

        options: function (options) {
            var self = this;

            if (typeof(options) !== "undefined") {
                self._options = options;
                self._place_shown_options();
            } else {
                return self._options;
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

        get_selected: function () {
            var self = this;

            return self._options[self._current];
        }
    });

    Crafty.c("VerticalStatusBar", {
        settings: {
            css: {
                "border-color" : "white",
                "border-style" : "solid",
                "border-width" : "1px",
                "color"        : "white"
            }
        },

        init: function () {
            var self = this;

            self.requires("2D, DOM");

            self._status = 0;

            self._num_segments = undefined;
            self._segments = [];

            self.css(self.settings.css);

            self._status_bar = Crafty.e("2D, DOM");
            self.attach(self._status_bar);

            self.bind("Change", function () {
                self._status_bar.css({ "background-color" : self.css("color") });

                self._status_bar.w = self._w;
                self._status_bar.h = self._h * self._status;

                self._status_bar.x = self._x + 1;
                self._status_bar.y = self._y - self._status_bar._h + self._h + 1;

                self._status_bar.alpha = self._alpha;

                self._resegment();
            });

            return self;
        },

        update: function (new_status) {
            var self = this;

            if (new_status > 1) {
                new_status = 1;
            } else if (new_status < 0) {
                new_status = 0;
            }

            self._status = new_status;

            self.trigger("Change");

            return self;
        },

        segment: function (num_segments) {
            var self = this, segment_height = self._h / num_segments;

            self._num_segments = num_segments;

            for (var i = 0; i < num_segments; i++) {
                var segment = Crafty.e("2D, DOM").attr({
                    x: self._x,
                    y: self._y + (segment_height * i),
                    w: self._w,
                    h: segment_height
                }).css(self.settings.css);

                self.attach(segment);
                self._segments.push(segment);
            }

            return self;
        },

        _resegment: function () {
            var self = this;

            if (typeof(self._num_segments) !== "undefined") {
                while (self._segments.length > 0) {
                    var segment = self._segments.shift();
                    segment.destroy();
                }

                self.segment(self._num_segments);
            }

            return self;
        }
    });

    Crafty.c("HorizontalStatusBar", {
        settings: {
            css: {
                "border-color" : "white",
                "border-style" : "solid",
                "border-width" : "1px",
                "color"        : "white"
            }
        },

        init: function () {
            var self = this;

            self.requires("2D, DOM");

            self._status = 0;

            self._num_segments = undefined;
            self._segments = [];

            self.css(self.settings.css);

            self._status_bar = Crafty.e("2D, DOM");
            self.attach(self._status_bar);

            self.bind("Change", function () {
                self._status_bar.css({ "background-color" : self.css("color") });

                self._status_bar.w = self._w * self._status;
                self._status_bar.h = self._h;

                self._status_bar.x = self._x + 1;
                self._status_bar.y = self._y + 1;

                self._status_bar.alpha = self._alpha;

                self._resegment();
            });

            return self;
        },

        update: function (new_status) {
            var self = this;

            if (new_status > 1) {
                new_status = 1;
            } else if (new_status < 0) {
                new_status = 0;
            }

            self._status = new_status;

            self.trigger("Change");

            return self;
        },

        segment: function (num_segments) {
            var self = this, segment_width = self._w / num_segments;

            self._num_segments = num_segments;

            for (var i = 0; i < num_segments; i++) {
                var segment = Crafty.e("2D, DOM").attr({
                    x: self._x + (segment_width * i),
                    y: self._y,
                    w: segment_width,
                    h: self._h
                }).css(self.settings.css);

                self.attach(segment);
                self._segments.push(segment);
            }

            return self;
        },

        _resegment: function () {
            var self = this;

            if (typeof(self._num_segments) !== "undefined") {
                while (self._segments.length > 0) {
                    var segment = self._segments.shift();
                    segment.destroy();
                }

                self.segment(self._num_segments);
            }

            return self;
        }
    });
})();
