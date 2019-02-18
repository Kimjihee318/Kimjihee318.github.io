var dataSet = [];
d3.csv('data/hourly_compensation.csv', function (err, data) {
    console.log();
    console.log(data.length);
    // pure data : Country,1980,1981,1982,1983,1984,1985,1986,1987,1988,
    for (var i = 0; i < data.length; i++) {
        var row = data[i];
        var countryD = row['Country'];
        delete row['Country'];
        for (var key in row) { // 앞은 property, 뒤는 obj obj의 수만큼 루프를 돈다.
            dataSet.push({
                country: countryD,
                year: +key, // 키값을 밸류값으로 넣어주게따!
                value: +row[key], // year은 키값
            });
        }
    }

    console.log(dataSet);
    var nested = d3.nest()
        .key(function (d) {
            return d.country;
        })
        .entries(dataSet);

    var countries = d3.select('#countries').selectAll('option').data(nested);
    countries.enter()
        .append('option')
        .merge(countries)
        .attr('value', function (d) {
            return d.key;
        })
        .text(function (d) {
            return d.key;
        });
    countries.exit().remove();

    d3.select('#countries').on('change', function () {
        render(nested);
    });
    render(nested);
});

function render(data) {

    var targetC = d3.select('#countries').property('value');

    var data = data.filter(function (d) {
        return d['key'] === targetC;
    });

    var W = innerWidth * 0.9,
        H = innerHeight * 0.9,
        T = 100,
        B = 100,
        L = 100,
        R = 100;

    var svg = d3.select('svg').attr('width', W).attr('height', H);

    var xScale = d3.scaleLinear()
        .domain(d3.extent(dataSet, function (d) {
            return d.year;
        }))
        .range([0, W - L - R]);

    var yScale = d3.scaleLinear()
        .domain([d3.max(dataSet, function (d) {
            return d.value;
        }), 0])
        .range([0, H - T - B]);

    var xAxis = d3.axisBottom()
        .scale(xScale)
        .tickSize(0)
        .tickPadding(15)
        .tickFormat(function (d) {
            return d;
        });

    var yAxis = d3.axisLeft()
        .scale(yScale)
        .tickSize(0)
        .tickPadding(10)
        .tickFormat(function (d) {
            return d + '$';
        });

    d3.select('.xAxis')
        .style('transform', 'translate(' + L + 'px,' + (H - B) + 'px)')
        .style('font-size', '1.5rem')
        .style('text-anchor', 'start')
        .call(xAxis);

    d3.select('.yAxis')
        .style('font-size', '1.5rem')
        .style('transform', 'translate(' + L + 'px,' + T + 'px)')
        .call(yAxis);

    var line = d3.line()
        .curve(d3.curveNatural)
        .x(function (d) {
            return xScale(d.year);
        })
        .y(function (d) {
            return yScale(d.value);
        });

    var pathUpdate = svg.select('.lineG').selectAll('path').data(data);
    var pathEnter = pathUpdate.enter();
    var pathMerge = pathEnter
        .append('path')
        .merge(pathUpdate)
        .transition()
        .duration(300)
        .attr('d', function (d, i) {
            return line(d.values);
        })
        .style('transform', 'translate(' + L + 'px,' + T + 'px)')
        .style('stroke', '#ff02f4')
        .style('opacity', 0.9)
        .style('stroke-width', 18)
        .style('fill', 'none');
    pathEnter.exit().remove;

    var imageData = svg.select('.imaG').data(data);
    var imageUpdate = imageData.selectAll('image').data(function (d) {
        return d.values
    });
    
    var imageEnter = imageUpdate.enter();
    var images = imageEnter
        .append('image')
        .style('transform', 'translate(' + L + 'px,' + T + 'px)')
        .merge(imageUpdate)
        .attr('x', function (d) {
            return xScale(d.year) - 80;
        })
        .transition()
        .delay(function (d, i) {
            return i * 180;
        })
        .attr('y', function (d) {
            return yScale(d.value) - 50;
        })
        .attr('width', 130)
        .attr('xlink:href', 'images/dollar_mini.png');

    imageUpdate.exit().remove;

}
