//by Lsq
(function(window, undefined) {
    var arr = [],
        push = arr.push,
        slice = arr.slice;

    // 构造函数
    var Lsq = function(selector) {
        return new Lsq.prototype.init(selector);
    };
    // 核心原型
    Lsq.fn = Lsq.prototype = {
        constructor: Lsq,
        selector: null, // 作为判断Lsq对象的标识符
        length: 0,
        init: function(selector) {
            if (!selector) return this;
            // 字符串：选择器、html
            if (Lsq.isString(selector)) {
                if (selector.charAt(0) === '<') {
                    Lsq.push.apply(this, Lsq.parseHTML(selector));
                } else {
                    Lsq.push.apply(this, Lsq.select(selector));
                    this.selector = selector;
                }
                return this;
            }
            // DOM对象
            if (Lsq.isDOM(selector)) {
                this[0] = selector;
                this.length = 1;
                return this;
            }
            // Lsq对象
            if (Lsq.isLsq(selector)) {
                return selector;
            }
            // DOM数组
            if (Lsq.isLikeArray(selector)) {
                Lsq.push.apply(this, selector);
                return this;
            }
            // 函数（包括入口函数）
            if (Lsq.isFunction(selector)) {
                var oldFn = window.onload;
                if (typeof oldFn === 'function') {
                    window.onload = function() {
                        oldFn();
                        selector();
                    };
                } else {
                    window.onload = selector;
                }
            }
        },
        each: function(callback) {
            Lsq.each(this, callback);
            return this;
        }
    };
    //重写原型链
    Lsq.fn.init.prototype = Lsq.prototype;
    //可扩展方法extend封装
    Lsq.extend = Lsq.fn.extend = function(obj) {
        var k;
        for (k in obj) {
            this[k] = obj[k];
        }
    };
    // 基本选择器实现
    var selector =

        (function() {

            var myPush = function(target, els) {
                var j = target.length,
                    i = 0;
                // Can't trust NodeList.length
                while ((target[j++] = els[i++])) {} //关联数组，将els的每一项赋给target，没有了自动跳出while循环
                target.length = j - 1; //伪数组的长度不能自动增加，所以手动赋值一下
            };

            // 对基本方法的封装
            var getTag = function(tag, context, results) {
                results = results || [];
                try {
                    results.push.apply(results, context.getElementsByTagName(tag));
                } catch (e) {
                    myPush(results, context.getElementsByTagName(tag));
                }
                return results;
            };
            var getId = function(id, results) {
                results = results || [];
                results.push(document.getElementById(id));
                return results;
            };
            var getClass = function(className, context, results) {
                results = results || [];

                if (document.getElementsByClassName) {
                    results.push.apply(results, context.getElementsByClassName(className));
                } else {
                    each(getTag('*', context), function(i, v) {
                        if ((' ' + v.className + ' ')
                            .indexOf(' ' + className + ' ') != -1) {
                            results.push(v);
                        }
                    });
                }
                return results;
            };
            // 对循环的封装
            var each = function(arr, fn) {
                for (var i = 0; i < arr.length; i++) {
                    if (fn.call(arr[i], i, arr[i]) === false) {
                        break;
                    }
                }
            };
            // 通用的方法
            var get = function(selector, context, results) {
                results = results || [];
                context = context || document;
                //                     1          2        3       4
                var rquickExpr = /^(?:#([\w-]+)|\.([\w-]+)|([\w]+)|(\*))$/,
                    m = rquickExpr.exec(selector);

                if (m) {
                    if (context.nodeType) {
                        context = [context];
                    }
                    // 如果 context 是一个 dom 数组就没有问题了
                    // 但是 context 是一个选择器字符串. 有可能是 '.c'
                    //
                    if (typeof context == 'string') {
                        context = get(context);
                    }
                    each(context, function(i, v) {
                        if (m[1]) {
                            results = getId(m[1], results);
                        } else if (m[2]) {
                            results = getClass(m[2], v, results);
                        } else if (m[3]) {
                            results = getTag(m[3], this, results);
                        } else if (m[4]) {
                            results = getTag(m[4], this, results);
                        }
                    });
                }

                return results;
            };
            // 去除两端空格
            var myTrim = function(str) {
                if (String.prototype.trim) {
                    return str.trim();
                } else {
                    return str.replace(/^\s+|\s+$/g, '');
                }
            };
            var select = function(selector, context, results) {
                results = results || [];
                // 首先处理逗号
                var newSelectors = selector.split(','); // => [ '.dv  .c1', ' .c2' ]
                each(newSelectors, function(i, v) {

                    // 需要解析的就是 v 或 this
                    // 分割
                    var list = v.split(' ');
                    var c = context;
                    // context -> list[ 0 ] -> list[ 1 ] -> ... -> list[ length - 1 ]
                    for (var i = 0; i < list.length; i++) {
                        if (list[i] === '') continue;
                        c = get(list[i], c);
                        // 如果 list[ i ] 是空字符串, 那么只是在 c 下面找空数据, 是不会报错的
                    }
                    results.push.apply(results, c);
                });
                return results;
            };
            return select;
        })();

    // 转换html为DOM
    var parseHTML = function(html) {
        var div = document.createElement('div'),
            arr = [],
            i,
            len;
        div.innerHTML = html;
        for (i = 0; len = div.childNodes.length, i < len; i++) {
            arr.push(div.childNodes[i]);
        }
        return arr;
    };
    // 将选择器模块作为工具方法添加到Lsq上，方便扩展，比如能通过Lsq.select = Sizzle来替换为Sizzle引擎
    Lsq.extend({
        select: selector,
        parseHTML: parseHTML
    });

    // 基本的工具方法（静态方法）
    Lsq.extend({
        each: function(arr, fn) {
            var i,
                len = arr.length,
                isArray = Lsq.isLikeArray(arr);
            if (isArray) {
                for (i = 0; i < len; i++) {
                    var tempRes = fn.call(arr[i], i, arr[i]);
                    if (tempRes === false) {
                        break;
                    } else if (tempRes === -1) {
                        continue;
                    }
                }
            } else {
                for (i in arr) {
                    var tempRes = fn.call(arr[i], i, arr[i]);
                    if (tempRes === false) {
                        break;
                    } else if (tempRes === -1) {
                        continue;
                    }
                }
            }
        },
        push: push,
        trim: function(str) {
            if (String.prototype.trim) {
                return str.trim();
            } else {
                return str.replace(/^\s+|\s+$/g, '');
            }
        }
    });

    // 判断类型的方法
    Lsq.extend({
        isFunction: function(obj) {
            return typeof obj === 'function';
        },
        isString: function(obj) {
            return typeof obj === 'string';
        },
        isLikeArray: function(obj) {
            return obj && obj.length && obj.length >= 0;
        },
        isLsq: function(obj) {
            return 'selector' in obj;
        },
        isDOM: function(obj) {
            return !!obj.nodeType;
        }
    });

    // 基本的DOM操作模块
    // 工具方法
    Lsq.extend({
        firstChild: function(dom) {
            var node;
            Lsq.each(dom.childNodes, function(i, v) {
                if (this.nodeType === 1) {
                    node = this;
                    return false;
                }
            });
            return node;
        },
        nextSibling: function(dom) {
            var newDom = dom;
            while (newDom = newDom.nextSibling) {
                if (newDom.nodeType === 1) {
                    return newDom;
                }
            }
        },
        nextAll: function(dom) {
            var newDom = dom,
                arr = [];
            while (newDom = newDom.nextSibling) {
                if (newDom.nodeType === 1) {
                    arr.push(newDom);
                }
            }
            return arr;
        }
    });
    // 实例方法
    Lsq.fn.extend({
        appendTo: function(selector) {
            var objs = Lsq(selector),
                i,
                j,
                len1 = objs.length,
                len2 = this.length,
                arr = [],
                node,
                self = this;
            // 将this加到objs中
            for (i = 0; i < len1; i++) {
                for (j = 0; j < len2; j++) {
                    node = i === len1 - 1 ?
                        this[j] :
                        this[j].cloneNode(true);
                    arr.push(node);
                    objs[i].appendChild(node);

                }
            } //在这里其实是有一个链破坏
            return Lsq(arr); //注意这里的arr是DOM数组，所以能够用Lsq包装成Lsq对象，如果是普通的数组则不可以
        },
        append: function(selector) {
            Lsq(selector).appendTo(this);
            return this;
        },
        prependTo: function(selector) {
            var objs = Lsq(selector),
                len1 = objs.length,
                len2 = this.length,
                i, j,
                node,
                arr = [];
            for (i = 0; i < len1; i++) {
                for (j = 0; j < len2; j++) {
                    node = i === len1 - 1 ?
                        this[j] :
                        this[j].cloneNode(true);
                    objs[i].insertBefore(node,
                        Lsq.firstChild(objs[i]));
                    arr.push(node);
                }
            }
            // return this;这样则只能获得到前面的一次元素，而添加到后面的有可能添加到多个，所以采用下面用数组的形式返回出去，注意包装成Lsq对象
            return Lsq(arr);
        },
        prepend: function(selector) {
            Lsq(selector).prependTo(this);
            return this;
        },
        remove: function() {
            // 将this删除
            var i,
                len = this.length;
            for (i = 0; i < len; i++) {
                this[i].parentNode.removeChild(this[i]);
            }
            return this; //将自身返回确保能够链式操作
        },
        next: function() {
            var arr = [];
            Lsq.each(this, function(i, v) {
                arr.push(Lsq.nextSibling(v));
            });
            return Lsq(arr);
        },
        nextAll: function() {
            var arr = [];
            Lsq.each(this, function(i, v) {
                Lsq.push.apply(arr, Lsq.nextAll(v));
            });
            return Lsq(arr);
        }
    });


    // 事件模块
    // 事件对象
    Lsq.Event = function(e) { //在Lsq上自己构造一个事件对象构造函数
        this.event = e; //给构造出的每一个事件对象的event属性赋值为浏览器的事件对象e,注意在ie中是window.event
    };
    Lsq.Event.prototype = { //重写构造函数原型
        constructor: Lsq.Event,
        stopPropagation: function() { //加入阻止冒泡的原型方法，这样每一个构造函数都能通过继承到找这个方法，复用
            this.event.stopPropagation(); //通过this.event找到浏览器提供的事件对象e，然后调用其原生方法
            this.event.cancelBubble = true;
        }
    };
    Lsq.fn.extend({
        on: function(type, callback) {
            this.each(function() { //这里的each是用的实例中的each，不是静态方法each
                if (this.addEventListener) {
                    this.addEventListener(type, function(e) {
                        e = e || window.event;
                        callback.call(this, new Lsq.Event(e)); //通过call调用上下文能确保该函数callback是每一个DOM元素调用，并且将构造出来的事件对象传进去；
                    }); //注意这里的this是指DOM元素，
                    // 因为已经通过each循环，Lsq对象只要一加索引就是DOM元素，Lsq就是一个DOM伪数组
                } else {
                    this.attachEvent('on' + type, function(e) {
                        e = e || window.event;
                        callback.call(this, new Lsq.Event(e));
                    });
                } //注意这里的this是指DOM元素，同上
            });
            return this; //当前对象
        },
        off: function() {
            this.each(function() {
                this.removeEventListener(type, callback);
            });
            return this;
        }
    });

    // 其他事件
    Lsq.each(("click,mouseover,mouseout,mouseenter,mouseleave," +
        "mousemove,mousedown,mouseup,keydown,keyup,change").split(','), function(i, v) {
        Lsq.fn[v] = function(callback) {
            return this.on(v, callback);
            // or: this.on(v,callback);
            // return this;
        }
    });

    // toggle与hover
    Lsq.fn.extend({
        hover: function(fn1, fn2) {
            return this.mouseover(fn1).mouseout(fn2);
        },
        toggle: function() {
            var args = arguments,
                i = 0;
            return this.click(function(e) {
                args[i++ % args.length].call(this, e);
            });
        }
    });



    // 样式操作模块
    Lsq.fn.extend({
        css: function(cssName, cssValue) {
            if (typeof cssName === 'object') {
                this.each(function() { //这里不用return是因为封装实例each方法的时候就已经return了this
                    var self = this;
                    // var k;
                    // for(k in cssName) {
                    //   this.style[k] = cssName[k];
                    // }
                    Lsq.each(cssName, function(i, v) {
                        self.style[i] = v;
                    });
                });
            } else if (cssValue === undefined) { //style只能获得到行内样式，所以采用下面的能够获得到css中的样式
                return window.getComputedStyle(this[0])[cssName]; //课下完善一下ie的currentStyle兼容性，封装一个方法
            } else {
                return this.each(function() {
                    this.style[cssName] = cssValue;
                });
            }
        },
        hasClass: function(cName) {
            //判断this[0]是否具有该类样式
            // 方法1（传统方法）
            // var has = false;
            // Lsq.each(this[0].className.split(' '), function(i, v) {
            //     if (v === Lsq.trim(cName)) {  //注意这里不能用this，因为这里each的参数是
            //     字符串，是一个基本类型，会被转化成包装对象
            //         has = true;
            //         return false;
            //     }
            // });
            // return has;
            // 方法2
            //又是运用了给字符串前后添加空格的小技巧，这样会使得更加具有可操作性，主要是为了确保首尾的匹配处理
            return (' ' + this[0].className + ' ').indexOf(' ' + Lsq.trim(cName) + ' ') != -1;

            // 方法3（正则）
            // new RegExp('\\b'+ cName.replace(' ','\\b/\\b')+'\\b','g').test(this[0].className);

        },
        addClass: function(cName) {
            return this.each(function() {
                // 方法1
                if (this.className != undefined) {
                    var className = this.className; //这里又用了一个变量先把这个存起来主要是为了考虑到性能方面， 所以先对临时变量做操作
                    // 最后一次加到界面中的元素中
                    className += ' ' + cName; //这里会出现多次添加cName么，后期可以对进行一下字符串分隔来处理同时添加多个类名
                    className = Lsq.trim(className); //注意这里的trim，作为一个严谨的程序员来说应该要考虑细致的
                } else {
                    this.className = cName;
                }
            });
        },
        removeClass: function(cName) {
            this.each(function() {
                var className = ' ' + this.className + ' '; //前后加空格的小技巧，这些小技巧自己要掌握熟练，在一些应用场景下还是挺方便的
                this.className = Lsq.trim(className.replace(' ' + cName + ' ', ' '));
            });
        },
        toggleClass: function(cName) {
            this.each(function() {
                if (L(this).hasClass(cName)) { //注意这里要用L(this)，因为在each循环里this是指向DOM元素的，所以包装一下以便使用L的方法
                    L(this).removeClass(cName);
                } else {
                    // alert(1);
                    L(this).addClass(cName);
                }
            });
        }
    });
    // 内容处理模块工具方法（静态方法）
    Lsq.extend({
        // 获得内部文本内容
        getInnerText: function(dom) {//注意在早起火狐中是不支持这个innerText属性的，封装一个兼容方法getInnerText
            var list = [];
            if (dom.innerText !== undefined) {
                return dom.innerText;
            } else {
                getTextNode(dom, list);
                return list.join(''); //其实join中不加默认也可以，回去试试吧，没准是按逗号
            }
            // 递归获得所有文本节点
            function getTextNode(dom, arr) {
                // 将dom里面的所有的文本节点放到arr中
                var i,
                    len = dom.childNodes.length,
                    node;
                for (i = 0; i < len; i++) {
                    node = dom.childNodes[i];
                    if (node.nodeType === 3) {
                        arr.push(node.nodeValue);
                    } else {
                        getTextNode(node, arr); //递归实现,最后一定会得到一个没有子节点的节点，从而跳出
                    }
                }
            }
        },
        setInnerText: function(dom, text) {
            if ('innerText' in dom) { //用in运算符在这里更加全面一些，因为会有一些特殊的值，如果用dom.innerText可能会造成bug
                dom.innerText = text;
            } else {
                dom.innerHTML = ''; //先清空
                dom.appendChild(document.createTextNode(text)); //再添加上新创建的文本节点
            }
        }
    });

    // 属性操作模块（实例方法）
    Lsq.fn.extend({
        attr: function(attrName, attrValue) {
            if (arguments.length === 1) {
                //返回第0个元素的属性值
                return this[0][attrName];
            } else {
                //设置所有对应元素的属性值
                return this.each(function() {
                    this[attrName] = attrValue;
                });
            }
        },
        val: function(value) {
            if (value === undefined) {
                // 返回第0个元素的value值
                return this[0][value];
            } else {
                // 设置所有对应元素的value值
                return this.each(function() {
                    // this.value = value;
                    this['value'] = value;
                    //this[value] = value; //注意这种写法是错误的，需要加上引号，如果不加上引号是相当于关联数组自定义一个属性
                });
            }
        },
        //内容处理模块
        html: function(html) {
            if (html === undefined) {
                return this[0].innerHTML;
            } else {
                return this.each(function() {
                    this.innerHTML = html;
                });
            }
        },
        text: function(text) {
            // 兼容版
            if (text === undefined) {
                //返回0元素的innerText 读取操作
                return Lsq.getInnerText(this[0]);
            } else {
                return this.each(function() {
                    Lsq.setInnerText(this, text); //这里的this是DOM，因为在each循环里面
                });
            }

        }
    });


    // 动画模块
    // 工具方法（静态方法）,主要是用来这几个静态方法来实现遍历对象和属性
    Lsq.extend({
        easing: {
            liner: function(x, t, b, c, d) {
                // console.log( '匀速' );
                return t * (c - b) / d;
            },
            easeInQuad: function(x, t, b, c, d) {
                return c * (t /= d) * t + b;
            },
            easeOutQuad: function(x, t, b, c, d) {
                return -c * (t /= d) * (t - 2) + b;
            },
            easeInOutQuad: function(x, t, b, c, d) {
                if ((t /= d / 2) < 1) return c / 2 * t * t + b;
                return -c / 2 * ((--t) * (t - 2) - 1) + b;
            },
            easeInCubic: function(x, t, b, c, d) {
                return c * (t /= d) * t * t + b;
            },
            easeOutCubic: function(x, t, b, c, d) {
                return c * ((t = t / d - 1) * t * t + 1) + b;
            },
            easeInOutCubic: function(x, t, b, c, d) {
                if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
                return c / 2 * ((t -= 2) * t * t + 2) + b;
            },
            easeInQuart: function(x, t, b, c, d) {
                return c * (t /= d) * t * t * t + b;
            },
            easeOutQuart: function(x, t, b, c, d) {
                return -c * ((t = t / d - 1) * t * t * t - 1) + b;
            },
            easeInOutQuart: function(x, t, b, c, d) {
                if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
                return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
            },
            easeInQuint: function(x, t, b, c, d) {
                return c * (t /= d) * t * t * t * t + b;
            },
            easeOutQuint: function(x, t, b, c, d) {
                return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
            },
            easeInOutQuint: function(x, t, b, c, d) {
                if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
                return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
            },
            easeInSine: function(x, t, b, c, d) {
                return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
            },
            easeOutSine: function(x, t, b, c, d) {
                return c * Math.sin(t / d * (Math.PI / 2)) + b;
            },
            easeInOutSine: function(x, t, b, c, d) {
                return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
            },
            easeInExpo: function(x, t, b, c, d) {
                return (t == 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
            },
            easeOutExpo: function(x, t, b, c, d) {
                return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
            },
            easeInOutExpo: function(x, t, b, c, d) {
                if (t == 0) return b;
                if (t == d) return b + c;
                if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
                return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
            },
            easeInCirc: function(x, t, b, c, d) {
                return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
            },
            easeOutCirc: function(x, t, b, c, d) {
                return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
            },
            easeInOutCirc: function(x, t, b, c, d) {
                if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
                return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
            },
            easeInElastic: function(x, t, b, c, d) {
                var s = 1.70158;
                var p = 0;
                var a = c;
                if (t == 0) return b;
                if ((t /= d) == 1) return b + c;
                if (!p) p = d * .3;
                if (a < Math.abs(c)) {
                    a = c;
                    var s = p / 4;
                } else var s = p / (2 * Math.PI) * Math.asin(c / a);
                return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
            },
            easeOutElastic: function(x, t, b, c, d) {
                var s = 1.70158;
                var p = 0;
                var a = c;
                if (t == 0) return b;
                if ((t /= d) == 1) return b + c;
                if (!p) p = d * .3;
                if (a < Math.abs(c)) {
                    a = c;
                    var s = p / 4;
                } else var s = p / (2 * Math.PI) * Math.asin(c / a);
                return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
            },
            easeInOutElastic: function(x, t, b, c, d) {
                var s = 1.70158;
                var p = 0;
                var a = c;
                if (t == 0) return b;
                if ((t /= d / 2) == 2) return b + c;
                if (!p) p = d * (.3 * 1.5);
                if (a < Math.abs(c)) {
                    a = c;
                    var s = p / 4;
                } else var s = p / (2 * Math.PI) * Math.asin(c / a);
                if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
                return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
            },
            easeInBack: function(x, t, b, c, d, s) {
                if (s == undefined) s = 1.70158;
                return c * (t /= d) * t * ((s + 1) * t - s) + b;
            },
            easeOutBack: function(x, t, b, c, d, s) {
                if (s == undefined) s = 1.70158;
                return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
            },
            easeInOutBack: function(x, t, b, c, d, s) {
                if (s == undefined) s = 1.70158;
                if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
                return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
            },

            easeOutBounce: function(x, t, b, c, d) {
                if ((t /= d) < (1 / 2.75)) {
                    return c * (7.5625 * t * t) + b;
                } else if (t < (2 / 2.75)) {
                    return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
                } else if (t < (2.5 / 2.75)) {
                    return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
                } else {
                    return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
                }
            }
        },
        //转换属性名一致
        kv: {
            left: 'offsetLeft',
            top: 'offsetTop',
            width: 'offsetWidth',
            height: 'offsetHeight'
        },
        //获得总距离
        getDistance: function(dom, target) {
            var o = {},
                k;
            for (k in target) {
                o[k] = parseInt(target[k]) - dom[Lsq.kv[k]];
            }
            return o;
        },
        // 获得开始的坐标位置
        getLocation: function(dom, target) {
            var o = {},
                k;
            for (k in target) {
                o[k] = dom[Lsq.kv[k]];
            }
            return o;
        },
        // 运动轨迹
        easings: function(x, time, startLocations, target, dur, easingName) {
            var o = {},
                k;
            for (k in target) {
                o[k] = Lsq.easing[easingName](x, time, startLocations[k], parseInt(target[k]), dur);
            }
            return o;
        },
        //设置样式
        setStyle: function(dom, startLocations, tweens, target) {
            var k;
            for (k in target) {
                dom.style[k] = startLocations[k] + tweens[k] + 'px';
            }
        }
    });
    // 实例方法
    Lsq.fn.extend({
        timerId: null,
        animate: function(target, dur, easingName, callback) {
            easingName = easingName || 'liner';
            //用前先清定时器
            clearInterval(this.timerId);
            var dom = this[0];
            var totalDistances = Lsq.getDistance(dom, target),
                startTime = +new Date,
                startLocations = Lsq.getLocation(dom, target),
                stepTime = 25,
                play = function() {
                    var time = +new Date - startTime, // 已过时间毫秒,通过时间戳的思想
                        tweens;
                    // 就是在计算 速度 * 已过时间
                    if (time >= dur) {
                        tweens = totalDistances;
                        clearInterval(this.timerId);
                        this.timerId = null;
                        if (typeof callback === 'function') {
                            callback();
                        }
                    } else {
                        tweens = Lsq.easings(null, time, startLocations, target, dur, easingName);
                    }
                    Lsq.setStyle(dom, startLocations, tweens, target);
                };
            play(); //先调用一下，确保开始的时候不出问题
            this.timerId = setInterval(play, stepTime); // 50Hz
        },
        stopAnimating: function() {
            console.log(this.timerId);
            clearInterval(this.timerId);
        },
        isAnimating: function() {
            return this.timerId === null;
        }
    });


    // 对外公开
    window.L = window.Lsq = Lsq;

})(window);
