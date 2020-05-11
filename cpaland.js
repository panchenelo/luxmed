(function () {
    'use strict';

    var $ = window.lq = {
        domReady: function(fn) {
            if (document.addEventListener) {
                document.addEventListener('DOMContentLoaded', fn);
            } else {
                var readyStateCheckInterval = setInterval(function() {
                    if (document.readyState === "complete") {
                        clearInterval(readyStateCheckInterval);
                        fn();
                    }
                }, 5);
            }
        },
        on: function(el, eventName, callback, context) {
            if (el.addEventListener) {
                el.addEventListener(eventName, function (e) {
                    callback.call(context, e);
                }, false);
            } else if(el.attachEvent) {
                el.attachEvent('on' + eventName, function (e) {
                    callback.call(context, e);
                });
            }
        },
        each: function(array, fn) {
            for (var i = 0, l = array.length; i < l; i++) {
                fn(array[i], i);
            }
        },
        extend: function(defaults, options) {
            var extended = {},
                prop;
            for (prop in defaults) {
                if (Object.prototype.hasOwnProperty.call(defaults, prop)) {
                    extended[prop] = defaults[prop];
                }
            }
            for (prop in options) {
                if (Object.prototype.hasOwnProperty.call(options, prop)) {
                    extended[prop] = options[prop];
                }
            }
            return extended;
        },
        serialize: function(form) {
            var obj = {};
            for (var i = 0, l = form.length; i < l; i++) {
                obj[form[i].getAttribute('name')] = form[i].value;
            }
            return obj;
        },
        urlGET: function(name) {
            if (name = (new RegExp('[?&]' + encodeURIComponent(name) + '=([^&]*)')).exec(location.search));
            return (name === null) ? '' : decodeURIComponent(name[1]);
        },
        objectToGet: function (object) {
            var GETString = '';
            var encode = '';
            for(var key in object) {
                encode = encodeURIComponent(object[key]);
                GETString += '&'+key+'=' + encode;
            }
            return GETString;
        },
        JSONP: function(url) {
            var script = document.createElement('script');
                script.async = true;
                script.setAttribute('src', url);

            document.body.appendChild(script);
        },
        isPhone: function(value) {
            return value.length > 7 ? true : false;
        },
        isName: function(value) {
            return value.length > 2 ? true : false;
        },
        isEmail: function(value) {
            var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
            return re.test(value);
        },
        getCookie: function (name) {
            var matches = document.cookie.match(new RegExp(
              "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
            ));
            return matches ? decodeURIComponent(matches[1]) : undefined;
        },
    };
    

    var CpaLand = function (params) {
        var _this = this;

        this.params = $.extend({
            // cookieDomains: [
            //     'cpa'+'ggetti'+'.'+'com', 
            //     'cpa'+'gette'+'.'+'com', 
            //     'cpa'+'ggette'+'.'+'com', 
            //     'cpa'+'ghetti'+'.'+'com'
            // ],
            oDomain: 'kcabl'+'lac.'+'com',
            hasLocalStorage: typeof Storage !== 'undefined',
            checkDomainIndex: 0,
            checkedDomains: 0, 
            cookieUrl: "checkdomain",
            location: document.location.hostname + document.location.pathname,
            sid: $.urlGET('sid'),
            tid: $.urlGET('tid')
        }, params);

        //Сheck SID
        this.checkSid();

        $.domReady(function() {
            _this.initDOM.call(_this);
        });

        return this;
    };

    CpaLand.prototype = {
        checkSid: function () {
            var params = this.params;

            if(params.hasLocalStorage) {
                if(params.sid.length) {
                    localStorage.sid = params.sid;
                } else {
                    if(localStorage.sid) {
                        params.sid = localStorage.sid;
                    }
                }

                if(params.tid.length) {
                    localStorage.tid = params.tid;
                } else {
                    if(localStorage.tid) {
                        params.tid = localStorage.tid;
                    }
                }
            }
        },
        initDOM: function () {
            this.initialize();
            this.initEvents();
            this.checkTest();

            if(typeof window.lCountries === 'object') {
                window.lCountries.initEvents();
                window.lCountries.setActiveCountrySelect();
            }
        },
        initialize: function () {
            // var getString = $.objectToGet({
            //     jsoncallback: 'CpaLand.checkDomainCallback',
            //     sid: this.params.sid
            // });
            // var url = 'http://callback.' + this.params.cookieDomains[this.params.checkDomainIndex] + '/' + this.params.cookieUrl + '?' + getString;
            // $.JSONP(url);
            var domain = $.getCookie('parking') == 1 ? document.location.hostname : this.params.oDomain;
            this.prepareDomainInfo(domain);
        },
        initEvents: function () {
            //Навесить на все формы
            var _this = this,
                orderForms = document.querySelectorAll('.cpa__order_form');

            //Обработка onsubmit
            for (var i = 0; i < orderForms.length; i++) {
                orderForms[i].onsubmit = function (event) {
                    _this.submitOrderForm.call(_this, event);
                }
            }

             _this.addSubIdInput();
        },
        orderConfirm: function (data) {
        },
        initLandData: function (data) {
            this.params = $.extend(this.params, data);
            var landingUrl = this.params.landingUrl || '';

            if(this.params.type === 'layer') {
                if(this.params.combacker.status === true) {
                    var textCmb = this.params.combacker.text.split('/n ').join('\n');
                    this.params.combacker.text = textCmb;
                    this.initComeBacker(this.params.combacker);
                }

                $.each(document.querySelectorAll('a'), function (a) {
                    a.setAttribute('target', '_blank');
                    a.setAttribute('href', landingUrl);
                });
            }
            //Check metrics
            //YA
            if(data.metrics.YA.length) this.addMetric('YA', data.metrics.YA); 
            //GA
            if(data.metrics.GA.length) this.addMetric('GA', data.metrics.GA); 
            //Vk
            if(data.metrics.VK.length) this.addVkMetric(data.metrics.VK); 
            //FB
            if (data.metrics.FB != undefined) {
                if (data.metrics.FB.length) {
                    this.addMetric('FB', data.metrics.FB);
                    var noscript = document.createElement('noscript');

                    var img = new Image();
                        img.height = 1;
                        img.width = 1;
                        img.style.display = 'none';
                        img.src = "https://www.facebook.com/tr?id=" + data.metrics.FB + "&ev=PageView&noscript=1";

                    noscript.appendChild(img);
                    
                    document.body.appendChild(noscript);
                }; 
            }

            if (data.hasOwnProperty('conversion')) {
                //check landing
                this.appendingCss = false;
                if (data.conversion.customers) this.showSideNotify();
                if (data.conversion.delivery) this.showDeliveryJaw();
                if (data.conversion.freeze_price) this.showFreezer();
                if (data.conversion.online_header) this.showOnlineHeader();
                if (data.conversion.online_side) this.showCustomersJaw();
            }
            
            this.setFormAction();
        },
        addMetric: function(type, code) {
            if (typeof this.metrics[type] === 'function') {
                var script = document.createElement('script');
                    script.innerHTML = this.metrics[type](code);

                document.body.appendChild(script);
            }
        },
        addVkMetric: function (code) {
            var divWrapp = document.createElement('div');
            divWrapp.innerHTML = code;
        	document.body.appendChild(divWrapp);
        },
        prepareDomainInfo: function (domain) {
            var getString = $.objectToGet({
                    jsoncallback: 'CpaLand.initLandData',
                    url: window.location.href,
                    sid: this.params.sid, 
                    m: $.urlGET('m'), 
                    c: window.lCountries.userCountryCode
                });
            this.params.orderDomain = domain;

            $.JSONP('http://' + domain + '/stream/cbsettings?' + getString);
        },
        checkDomainCallback: function (data) {
            // var domain = this.params.cookieDomains[this.params.checkDomainIndex],
            //     getString = $.objectToGet({
            //         jsoncallback: 'CpaLand.checkDomainCallback',
            //         sid: this.params.sid, //srteam id
            //         o_id: $.urlGET('o_id') //offer id
            //     });

            // if(data.status === true) {
            //     this.prepareDomainInfo(domain);
            // } else {
            //     this.params.checkDomainIndex++;
            //     if (this.params.cookieDomains[this.params.checkDomainIndex]) {
            //         $.JSONP('http://callback.' + this.params.cookieDomains[this.params.checkDomainIndex] + '/' + this.params.cookieUrl + '?' + getString);
            //     } else {
            //         this.prepareDomainInfo(this.params.cookieDomains[0]);
            //     }
            // }>
        },
        setFormAction: function (domain) {
            //Навесить на все фdemoормы
            var _this = this,
                orderForms = document.querySelectorAll('.cpa__order_form'),
                action = 'http://' + this.params.orderDomain + '/connect/bill/buyProduct?landing_id=' + this.params.landing_id,
                addInput = function (form, name, value) {
                    var input = document.createElement('input');
                        input.setAttribute('type', 'hidden');
                        input.setAttribute('name', name);
                        input.value = value;

                    return form.appendChild(input);
                };

            //Проставляем нужный домен
            for (var i = 0; i < orderForms.length; i++) {
                orderForms[i].setAttribute('action', action);
                orderForms[i].setAttribute('method', 'POST');

                addInput(orderForms[i], 'product_id[]', this.params.product_id);
                addInput(orderForms[i], 'sid', this.params.sid);
                addInput(orderForms[i], 'tid', this.params.tid);
                addInput(orderForms[i], 'cpaland', 1);
            }
        },
        initComeBacker: function (params) {
            var _this = this,
                comebacker = document.createElement('script');

            //Загружаем КБ и после загрузки инициализируем его.
            comebacker.src = '/iclick/js/comebacker.js';
            comebacker.onload = function () {
                _this.ComeBacker = new ComeBacker(params);
            };

            document.getElementsByTagName('head')[0].appendChild(comebacker);
        },
        submitOrderForm: function (event) {
            event = event || window.event; //IE8- event fix
            var _this = this,
                form = event.currentTarget || event.srcElement,
                formValid = true,
                input,
                GETString,
                currentLang = lCountries.userCountryCode,
                lang = lCountries.countries[lCountries.userCountryCode],
                formData = $.serialize(form);

            
            for (var i = 0, l = form.length; i < l; i++) {
                input = form[i];

                if (input.getAttribute('name') === 'phone') {
                    if ($.isPhone(input.value) === false) {
                        event.preventDefault ? event.preventDefault() : event.returnValue = false;
                        alert(lang.phoneError);
                        return false;
                    }
                }
                if (input.getAttribute('name') === 'name') {
                    if($.isName(input.value) === false) {
                        event.preventDefault ? event.preventDefault() : event.returnValue = false;
                        alert(lang.nameError);
                        return false;
                    }
                }
                if (input.getAttribute('name') === 'email') {
                    if ($.isEmail(input.value) === false) {
                        event.preventDefault ? event.preventDefault() : event.returnValue = false;
                        alert(lang.emailError);
                        return false;
                    }
                }
                if (input.getAttribute('type') === 'submit') {
                    input.setAttribute('disabled', 'disabled');
                }
            }

            formData = $.extend(formData, {
                sid: _this.params.sid,
                site: _this.params.location,
                jsoncallback: 'CpaLand.orderConfirm'
            });

            return true;
        },
        // добавляем в каждую форму sub_id при клике на кнопки с классом .js_add_sub-id
        addSubIdInput: function (event) {

            document.addEventListener('click', function(e) {
                if(e.target.className.indexOf('js_add_sub-id') != -1) {
                    var subId = e.target.getAttribute('data-subid');
                    return addSubIdInput(subId);                
                }
            });

            function addInputValue (subId) {
                $.each(document.querySelectorAll('form'), function (form) {
                    if (form.querySelectorAll('input[name="product_sub_id"]')[0] != undefined) {
                        $.each(form.querySelectorAll('input[name="product_sub_id"]'), function(inp){
                            inp.value = subId;
                        })
                    } else {
                        var input = document.createElement('input');
                        input.setAttribute('type', 'hidden');
                        input.setAttribute('name', 'product_sub_id');
                        input.value = subId;
                        form.appendChild(input);
                    }
                }); 
            }
        },
        /**
         * Запускаем JS тесты по хештегу #testcpa
         * @return {void}
         */
        checkTest: function () {
            //Проверка тестирования
            setTimeout(function() {
                if(window.location.hash === '#testcpa') {
                    var jsTest = document.createElement('script');
                        jsTest.setAttribute('src', '/iclick/js/cpa_test.js');
                    document.body.appendChild(jsTest);
                }
            }, 3000);   
        },
        metrics: {
            YA: function (yaId) {
                return '(function(d, w, c) {(w[c] = w[c] || []).push(function() {try {w.yaCounter'+yaId+' = new Ya.Metrika({id: '+yaId+', webvisor: true, clickmap: true, trackLinks: true, accurateTrackBounce: true, ut: "noindex"}); } catch (e) {} }); var n = d.getElementsByTagName("script")[0], s = d.createElement("script"), f = function() {n.parentNode.insertBefore(s, n); }; s.type = "text/javascript"; s.async = true; s.src = (d.location.protocol == "https:" ? "https:" : "http:") + "//mc.yandex.ru/metrika/watch.js"; if (w.opera == "[object Opera]") { d.addEventListener("DOMContentLoaded", f, false); } else { f();}})(document, window, "yandex_metrika_callbacks");';
            },
            GA: function (gaId) {
                return "(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o), m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m) })(window,document,'script','https://www.google-analytics.com/analytics.js','ga'); ga('create', '"+gaId+"', 'auto'); ga('send', 'pageview');";
            },
            FB: function (fbId) {
                return "!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod? n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init', '" + fbId + "');fbq('track', 'PageView');/success/g.test(window.location.pathname)&&fbq('track','Lead')";
            }
        },
        // показываем верхнюю плашку с количеством посетителей на сайте
        showOnlineHeader: function() {
            var _this = this;
            var visitorsToday = Math.round(Math.random() * (2900 - 1800) + 1800);
            var visitorsNow = Math.round(Math.random() * (190 - 51) + 51);
            var ordersToday = Math.round(Math.random() * (150 - 70) + 70);

            var topLine = document.createElement('div');
            topLine.classList.add('cpa__topline');
            topLine.innerHTML = '<span class="cpa__topline_item">Посетителей сегодня:' + visitorsToday + '</span>';
            topLine.innerHTML += '<span class="cpa__topline_item">Сейчас на сайте:' + visitorsNow + '</span>';
            topLine.innerHTML += '<span class="cpa__topline_item">Заказов сегодня:' + ordersToday + '</span>';
            if (_this.appendingCss) {
                document.body.appendChild(topLine);
            } else {
                _this.appendCss(topLine);
            }
        },
        // добавление стилевого файла для всех плашек
        // только после его згрузки добавляем какую-то плашку
        appendCss: function(jaw, callback) {
            var _this = this,
                link = document.createElement('link'),
                head = document.getElementsByTagName('head')[0];
            link.href = '/iclick/jaws/css/cpa-magick.min.css';
            link.type = "text/css";
            link.rel = "stylesheet";

            _this.appendingCss = true;

            head.appendChild(link);

            link.onload = function() {
                document.body.appendChild(jaw);
                if (typeof(callback) === "function") {
                    callback();
                }
            }
        },
        // показываем боковые всплывашки Кто-то купил сколько-то упаковок на такую-то сумму
        showSideNotify: function() {
            var scriptLp = document.createElement('script'),
                _this = this;

            scriptLp.setAttribute('type', 'text/javascript');
            // scriptLp.setAttribute('src', 'http://it' + 'tegapc.c' + 'om/jaws/' + 'js/lastpacknotify.js');
            scriptLp.setAttribute('src', '/iclick/js/lastpacknotify.js');
            if (_this.appendingCss) {
                document.body.appendChild(scriptLp);
            } else {
                _this.appendCss(scriptLp);
            }
            scriptLp.onload = function() {
                _this.packNotify = new LastPackNotify();
            }
        },
        // показываем боковую плашку с быстрой доставкой
        showDeliveryJaw: function() {
            var _this = this;
            var delivery = document.createElement('div');
            delivery.classList.add('cpa__delivery');
            var cityString = '';

            var xhr = new XMLHttpRequest();
            xhr.open('GET', 'http://5.187.2.223/?geo=' + lCountries.userCountryCode, true);
            xhr.send();
            if (xhr.status == 200) {
                cityString = ' в г.' + xhr.responseTest;
            }
            delivery.innerHTML = '<div class="cpa__delivery_close"></div><div class="cpa__delivery_icon"></div><div class="cpa__delivery_text">Действует быстрая доставка' + cityString + '</div>';

            if (_this.appendingCss) {
                document.body.appendChild(delivery);
                deliveryCallback();
            } else {
                _this.appendCss(delivery, deliveryCallback);
            }

            function deliveryCallback() {
                var closeDelivery = document.querySelector('.cpa__delivery_close');
                closeDelivery.addEventListener('click', hideDelivery);

                function hideDelivery() {
                    document.querySelector('.cpa__delivery').classList.add('hidden');
                    closeDelivery.removeEventListener('click', hideDelivery);
                }
            }
        },
        // показываем боковую плашку с количеством посетилелей сейчас на сайте
        showCustomersJaw: function() {
            var _this = this;
            var customersJaw = document.createElement('div');
            var visitorsRand = Math.round(Math.random() * (200 - 40) + 40);
            customersJaw.classList.add('cpa__customers');

            customersJaw.innerHTML = '<div class="cpa__customers_close"></div><div class="cpa__customers_icon"><span class="icon-userscpa"></span></div><div class="cpa__customers_text">Сейчас ' + visitorsRand + ' пользователей просматривают эту страницу вместе с вами.</div>';

            if (_this.appendingCss) {
                document.body.appendChild(customersJaw);
                customersCallback();
            } else {
                _this.appendCss(customersJaw, customersCallback);
            }

            function customersCallback() {
                var closeCustomers = document.querySelector('.cpa__customers_close');
                closeCustomers.addEventListener('click', hideCustomers);

                function hideCustomers() {
                    document.querySelector('.cpa__customers').classList.add('hidden');
                    closeCustomers.removeEventListener('click', hideCustomers);
                }
            }  
        },
        // показываем блок "Мы заморозили цену"
        showFreezer: function() {
            var _this = this;
            var freezPackCount = Math.floor(Math.random() * (150 - 40 + 1)) + 40;
            var freezBlock = document.createElement('div');
            freezBlock.classList.add('cpafreezing-wrap');
            freezBlock.innerHTML = '<div class="cpafreezing-info">' +
                '<div class="cpafreezing-info--title">Мы заморозили цену!</div>' +
                '<div class="cpafreezing-info--price">1$ = <span>45 руб.</span></div>' +
                '<div class="cpafreezing-info--packages">Осталось <span class="cpapackages-count">' + freezPackCount + '</span> шт. <br>по старому курсу</div>' + '<a href="#close" class="cpafreezing-close"></a></div>';

            if (_this.appendingCss) {
                document.body.appendChild(freezBlock);
            } else {
                _this.appendCss(freezBlock);
            }

            setTimeout(function() {
                freezBlock.classList.add('cpafreezing-active');
                document.getElementsByTagName('html')[0].classList.add('freezer');
            }, 2000);

            setTimeout(function() {
                freezBlock.classList.remove('cpafreezing-active');
                document.getElementsByTagName('html')[0].classList.remove('freezer');
            }, 30000);

            var freezClose = freezBlock.querySelector('.cpafreezing-close');

            freezClose.onclick = function(e) {
                e.preventDefault();
                freezBlock.classList.add('cpafreezing-hide');
                document.getElementsByTagName('html')[0].classList.remove('freezer');
            };
        }
    };

    window.CpaLand = new CpaLand({});
})();
