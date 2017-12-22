/* https://github.com/Zneiat/cron-builder.js */
var CronBuilder = function () {

    var SelectElem = function (config, attrs) {
        var selectEl = $('<select />');
        for (var k in attrs || {})
            selectEl.attr(k, attrs[k]);

        if (config.range) {
            if (!config.range.end || config.range.end <= 1)
                throw new Error('"config.range.end" 必须大于 1.');

            for (var i = config.range.start || 0; i <= config.range.end; i++) {
                var html = (i < 10) ? '0' + i : i;
                selectEl.append($('<option />').html(html).attr('value', i));
            }
        } else {
            for (var i in config.opts) {
                var value = config.optsValKeyPlus ? Number(i) + Number(config.optsValKeyPlus) : i;
                selectEl.append($('<option />').html(config.opts[i]).attr('value', value));
            }
        }

        return selectEl;
    };

    var builder = function (container) {

        var selectEls = {
            'min': SelectElem({range: {end: 59}}, {'multiple': 'multiple'}),
            'hour': SelectElem({range: {end: 23}}, {'multiple': 'multiple'}),
            'dow': SelectElem({opts: '周日|周一|周二|周三|周四|周五|周六'.split('|')}, {'multiple': 'multiple'}),
            'dom': SelectElem({range: {start: 1, end: 31}}, {'multiple': 'multiple'}),
            'month': SelectElem({
                opts: '1月|2月|3月|4月|5月|6月|7月|8月|9月|10月|11月|12月'.split('|'),
                optsValKeyPlus: 1
            }, {'multiple': 'multiple'})
        };

        var timeSelectEls = [selectEls.hour, ':', selectEls.min];

        var runEvery = {
            types: ['分钟', '小时', '天', '周', '月', '年'],
            options: [
                [],
                [' 的 ', selectEls.min, ' 分'],
                [].concat(timeSelectEls),
                [' 的 ', selectEls.dow, ' '].concat(timeSelectEls),
                [' 的 ', selectEls.dom, ' 号 '].concat(timeSelectEls),
                [' 的 ', selectEls.month, ' ', selectEls.dom, ' 号 ', ' '].concat(timeSelectEls)
            ],
            build: [
                ['*', '*', '*', '*', '*'],
                ['min', '*', '*', '*', '*'],
                ['min', 'hour', '*', '*', '*'],
                ['min', 'hour', '*', '*', 'dow'],
                ['min', 'hour', 'dom', '*', '*'],
                ['min', 'hour', 'dom', 'month', '']
            ]
        };

        var cronTypeEl = SelectElem({opts: runEvery.types});

        // UI Init
        var UiReload = function () {
            container[0].innerHTML = '';
            container.append('每', cronTypeEl, runEvery.options[cronTypeEl.val()]);
        };

        UiReload();

        // Bind Event
        $(cronTypeEl).change(function () {
            UiReload();
            var str = getResult();
            onChange(str);
            // ...
        });

        for (var k in selectEls) {
            $(selectEls[k]).change(function () {
                var str = getResult();
                onChange(str);
                // ...
            });
        }

        var getResult = this.getResult = function () {
            var cron = [];

            for (var i in runEvery.build[cronTypeEl.val()]) {
                var k = runEvery.build[cronTypeEl.val()][i];
                var el = selectEls[k];
                var str = el ? (function () {
                    return (el.val() instanceof Array ? el.val() : [el.val()]).join(',') || '*';
                })() : '*';
                cron.push(str);
            }

            var result = cron.join(' ');

            return result;
        };

        // On Change Event
        var onChange = function (result) {};
        this.setOnChange = function (func) {
            onChange = func;
        }
    };

    return builder;
}();
