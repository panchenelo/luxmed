(function (window) {
    'use strict';

    var $ = {
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
        }
    };

    var Alarm = function () {
        console.log('alarm init')
        var _this = this;

        this.params = {
            domain: 'cpagette.com',
        };

        window.document.addEventListener('DOMContentLoaded', function(event) {
            return _this.DOMReady(event);
        });
    };
    
    //Инитимся и ждем 200мс
    Alarm.prototype = {
        DOMReady: function () {
            var _this = this,
                waitTime = setTimeout(function () {
                    return _this.checkBlocker();
                }, 2000);            
        },

        checkBlocker: function () {
            if(!CpaLand.params.orderDomain) {
                if (window.console) console.warn('cpaland fail detected');
                this.getSettings();
            }
        },

        getSettings: function () {
            var getString = $.objectToGet({
                    jsoncallback: 'Alarm.initLandData',
                    url: window.location.href,
                    sid: $.urlGET('sid'), //srteam id
                    c: window.lCountries.userCountryCode
                });
            
            $.JSONP('http://callback.' + this.params.domain + '/stream/cbsettings?' + getString);
        },

        initLandData: function (data) {
            //Проставляем аварийный orderDomain
            CpaLand.params.orderDomain = this.params.domain;
            CpaLand.initLandData.call(CpaLand, data);
        }
    };

    window.Alarm = new Alarm();

})(window);
