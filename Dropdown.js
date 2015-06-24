(function() {
    // События взял из нашего когда-то написанного но ныне покойного фреймворка
    var events = {

        /**
         * Бинд событий
         * @param {String|Object} ev
         * @param {Function} callback
         * @return {Object}
         */
        on: function(ev, callback) {

            if (typeof ev === 'object') {
                var that = this;
                _.each(ev, function(event) {
                    that.bind(event, callback);
                });
                return this;
            }

            var calls = this._callbacks || (this._callbacks = {});
            var list = calls[ev] || (calls[ev] = []);
            list.push(callback);
            return this;
        },


        /**
         * Удаление события
         *
         * @param {String|Object} ev
         * @param {Function} callback
         * @return {Object}
         */
        off: function(ev, callback) {
            if (typeof ev === 'object') {
                var that = this;
                _.each(ev, function(event) {
                    that.unbind(event, callback);
                });
                return this;
            }

            var calls;
            if (!ev) {
                this._callbacks = {};
            } else if (calls = this._callbacks) {
                if (!callback) {
                    calls[ev] = [];
                } else {
                    var list = calls[ev];
                    if (!list) return this;
                    for (var i = 0, l = list.length; i < l; i++) {
                        if (callback === list[i]) {
                            list[i] = null;
                            break;
                        }
                    }
                }
            }
            return this;
        },


        /**
         * Вызов события
         *
         * @param {String} eventName
         * @return {Object}
         */
        emit: function(eventName) {
            var list, calls, ev, callback, args;
            var both = 2;
            if (!(calls = this._callbacks)) {
                return this;
            }
            while (both--) {
                ev = both ? eventName : 'all';
                if (list = calls[ev]) {
                    for (var i = 0, l = list.length; i < l; i++) {
                        if (!(callback = list[i])) {
                            list.splice(i, 1);
                            i--;
                            l--;
                        } else {
                            args = both ? Array.prototype.slice.call(arguments, 1) : arguments;
                            callback.apply(this, args);
                        }
                    }
                }
            }
            return this;
        }
    };


    var tools = {
        /**
         * Расширить объект свойствами других объектов
         *
         * @method extend
         * @return {Object}
         */
        extend: function() {
            return Array.prototype.reduce.call(arguments, function(previousValue, currentValue) {
                for (var item in currentValue) {
                    previousValue[item] = currentValue[item];
                }

                return previousValue;
            });
        },


        /**
         * Получить первый dom-элемент по селектору
         *
         * @method el
         * @return {Object}
         */
        el: function(selector, parent) {
            if (parent) {
                return parent.querySelector(selector);
            }
            return document.querySelector(selector);
        },


        /**
         * Удалить имя класса dom-элемента
         *
         * @method removeClass
         * @return {tools}
         */
        removeClass: function(el, className) {
            if (el.classList) {
                el.classList.remove(className);
            } else {
                el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
            }

            return this;
        },


        /**
         * Добавить имя класса dom-элемента
         *
         * @method addClass
         * @return {tools}
         */
        addClass: function(el, className) {
            if (el.classList) {
                el.classList.add(className);
            } else {
                el.className += ' ' + className;
            }

            return this;
        }
    };





    // Собственно выпадашка
    var Dropdown = function(element, options) {
        if (typeof element === 'string') {
            this.element = tools.el(element);
        } else {
            this.element = element;
        }
        
        this.options = tools.extend({
            openBy: 'click'
        }, options);

        this.init();
    };

    tools.extend(Dropdown.prototype, events, {
        init: function() {
            this.list = tools.el('ul', this.element);
            this.trigger = tools.el('div', this.element);

            if (this.options.openBy === 'click') {
                this.trigger.addEventListener('click', function() {
                    this.open();
                }.bind(this));
            }

            if (this.options.openBy === 'hover') {
                this.element.addEventListener('mouseenter', function() {
                    this.open();
                }.bind(this));

                this.element.addEventListener('mouseleave', function() {
                    this.close();
                }.bind(this));
            }


            for (var i = 0; i < this.list.children.length; i++) {
                this._initItem(this.list.children[i]);
            }


            this.close();

            return this;
        },


        /**
         * Открыть выпадулю
         *
         * @method open
         * @return {Dropdown}
         */
        open: function() {
            this.list.style.display = '';
            tools.addClass(this.element, 'expanded');
            this.emit('open');

            return this;
        },


        /**
         * Закрыть выпадулю
         *
         * @method close
         * @return {Dropdown}
         */
        close: function() {
            this.list.style.display = 'none';
            tools.removeClass(this.element, 'expanded');
            this.emit('close');

            return this;
        },


        /**
         * Инициализация элементов выпадули
         *
         * @method _initItem
         * @private
         * @return {Dropdown}
         */
        _initItem: function(el) {
            if (!el.getAttribute('disabled')) {
                el.addEventListener('click', function(event) {
                    this.close();
                }.bind(this));
            }

            return this;
        }
    });

    this.Dropdown = Dropdown;

})(this);