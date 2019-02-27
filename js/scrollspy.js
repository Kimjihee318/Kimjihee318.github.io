$(function () {
    'use strict';
    var sections = document.querySelectorAll(".section");
    var curSection = sections[0];

    window.onscroll = function () {
        var positions = {};
        var i = 0;
        Array.prototype.forEach.call(sections, function (e) {
            positions[e.id] = cumulativeOffset(e).top;
        });

        var scrollPosition =
            document.documentElement.scrollTop ||
            document.body.scrollTop;
        scrollPosition += 300;

        var newSection = curSection;
        for (i in positions) {
            if (positions[i] <= scrollPosition) {
                newSection = document.querySelector('#' + i);
            }
        }
        if (curSection !== newSection) {
            sectionChanged(curSection, newSection);
            curSection = newSection;
        }
    };

    function sectionChanged(from, to) {
        var functionName = to.dataset['function'];
        window[functionName]();
    }

    function cumulativeOffset(element) {
        var top = 0,
            left = 0;
        do {
            top += element.offsetTop || 0;
            left += element.offsetLeft || 0;
            element = element.offsetParent;
        } while (element);

        return {
            top: top,
            left: left
        };
    };
});
