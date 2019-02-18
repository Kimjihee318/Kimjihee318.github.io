var dataSet = [];
var yearExtent = [];
var valueExtent = [];
var width = 950;
var height = 250;

// sm === smallMultiples
var countriesToShow = [
    'Korea', 'China', 'Germany', 'Netherlands',
    'United Kingdom', 'United States', 'Italy', 'France',
    'Japan', 'Greece', 'Norway', 'Spain'
];

var smDataSet = [];
var smYearExtent = [];
var smValueExtent = [];
var smWidth = 1000;
var smHeight = 450;
var smPadding = 50;

var events = [
    {
        name: '리우 기후변화협약',
        icon: 'images/hands_shake-01.png',
        year: 1992
    },
    {
        name: '교토의정서 발효',
        icon: 'images/kyoto-01.png',
        year: 2005
    }
];

d3.csv('data/CO2emissions.csv', function (err, rows) {
    updateData(rows);
    redraw();

    smUpdateData(rows);
    smRedraw();
});


var updateData = function (rows) {
    rows.forEach(function (row) {
        row.value = +row.value;
        row.year = +row.year;
    });

    yearExtent = d3.extent(rows, function (d) {
        return d.year;
    });
    valueExtent = [0, d3.max(rows, function (d) {
        return d.value;
    })];

    dataSet = d3.nest()
        .key(function (d) {
            return d.country;
        })
        .entries(rows);
}

var redraw = function () {
    var MARGIN = {
        LEFT: 100,
        RIGHT: 100
    };

    var xScale = d3.scaleLinear()
        .domain(yearExtent)
        .rangeRound([0, width]);

    var yScale = d3.scaleLinear()
        .domain(valueExtent)
        .rangeRound([height, 0]);

    var xAxis = d3.axisBottom()
        .scale(xScale)
        .tickFormat(function (d) {
            return d;
        })
        .tickSize(0)
        .tickPadding(10);
        
    var yAxis = d3.axisLeft()
        .scale(yScale)
        .tickSize(-width)
        .tickPadding(10);

    var svg = d3.select('svg')
        .attr('width', width + MARGIN.LEFT + MARGIN.RIGHT)
        .attr('height', height + 40);

    var innerChart = svg
        .append('g')
        .attr('transform', 'translate( ' + MARGIN.LEFT + ', ' + 20 + ')');

    var gradientMin = ((valueExtent[1] - valueExtent[0]) * 0.22) + valueExtent[0];
    var gradientMax = ((valueExtent[1] - valueExtent[0]) * 0.70) + valueExtent[0];

    svg.append('linearGradient')
        .attr('id', 'temperature-gradient')
        .attr('gradientUnits', 'userSpaceOnUse')
        .attr('x1', 0).attr('y1', yScale(gradientMin))
        .attr('x2', 0).attr('y2', yScale(gradientMax))
        .selectAll('stop')
        .data([
            {
                offset: '0%',
                color: '#339d5f'
            },
            {
                offset: '50%',
                color: 'grey'
            },
            {
                offset: '100%',
                color: '#cc3440'
            }
        ])
        .enter()
        .append('stop')
        .attr('offset', function (d) {
            return d.offset;
        })
        .attr('stop-color', function (d) {
            return d.color;
        });

    innerChart.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate( 0 , ' + height + ' )')
        .style('stroke-width', '3')
        .style('font-size', 12)
        .style('opacity', 0.5)
        .call(xAxis);

    innerChart.append('g')
        .attr('class', 'y axis')
        .style('font-size', 12)
        .style('opacity', 0.5)
        .call(yAxis);

    var lineCo2 = d3.line()
        .curve(d3.curveBasis)
        .x(function (d) {
            return xScale(d.year);
        })
        .y(function (d) {
            return yScale(d.value);
        });

    var dataLines = innerChart.selectAll('path.lineCo2').data(dataSet);
    
    dataLines.enter()
        .append('path')
        .attr('class', 'lineCo2')
        .style('fill', 'none')
        .style('opacity', 0.5)
        .style('stroke-width', 2)
        .merge(dataLines)
        .attr('d', function (d) {
            console.log(d);
            return lineCo2(d.values);
        })
        .on('mouseover', function (d) {

            var coords = d3.mouse(this);
            var newData = {
                x: Math.round(xScale.invert(coords[0])),
                y: Math.round(yScale.invert(coords[1]))
            };
            d3.select(this)
                .style('opacity', 0.8)
                .style('stroke-width', 3);
            d3.select('#tooltip')
                .style('opacity', 1)
                .style('left', coords[0] + (MARGIN.LEFT * 1.5) + 'px')
                .style('top', coords[1] + 115 + 'px')
                .classed('hidden', false);
            d3.select('#tooltip .keyText').text(d.key);
            d3.select('#tooltip .valueText').text(newData.y);
        })
        .on('mouseout', function () {
            d3.select(this)
                .style('opacity', 0.45)
                .style('stroke-width', 2);
            d3.select('#tooltip').classed('hidden', true);
        });

    // Render events
    var eventSel = innerChart.selectAll('g.event').data(events);
    eventSel.enter()
        .append('g')
        .attr('class', 'event')
        .html('<text /><image /><path />')
        .merge(eventSel)
        .each(function (event) {
            d3.select(this).select('text')
                .attr('x', xScale(event.year))
                .attr('y', 50)
                .attr('opacity', 0.8)
                .attr('fill', 'black')
                .attr('font-weight', 'bold')
                .attr('text-anchor', 'middle')
                .style('font-size', 12)
                .text(event.name);
            d3.select(this).select('image')
                .attr('x', xScale(event.year))
                .attr('y', 58)
                .attr('opacity', 0.8)
                .attr('xlink:href', event.icon)
                .attr('width', 36)
                .attr('transform', 'translate(' + (-36 * 0.5) + ', 0)');
            d3.select(this).select('path')
                .attr('d', 'M ' + xScale(event.year) + ' 250 l 0 -160')
                .attr('stroke', "grey")
                .attr('opacity', 0.5)
                .attr('stroke-width', 2)
                .attr('fill', 'none')
                .style('stroke-dasharray', '4, 4');
        });
    eventSel.exit().remove();
};

var smUpdateData = function (rows) {
    var pickedCountries = rows.filter(function (row) {
        return countriesToShow.indexOf(row.country) !== -1;
    });

    smYearExtent = d3.extent(pickedCountries, function (d) {
        return d.year;
    });
    smValueExtent = d3.extent(pickedCountries, function (d) {
        return d.value;
    });

    smDataSet = d3.nest()
        .key(function (d) {
            return d.country;
        })
        .entries(pickedCountries);
}

var smRedraw = function () {
    var MARGIN = {
        TOP: 0,
        LEFT: 20,
        RIGHT: 0,
        BOTTOM: 0,
    }
    var GRID = {
        W: 4,
        H: 3
    };

    var wBand = d3.scaleBand()
        .domain(d3.range(GRID.W))
        .range([0, smWidth + MARGIN.LEFT + MARGIN.RIGHT])
        .round(true)
        .paddingOuter(0.2)
        .paddingInner(0.45);
    var hBand = d3.scaleBand()
        .domain(d3.range(GRID.H))
        .range([0, smHeight + MARGIN.TOP + MARGIN.BOTTOM])
        .round(true)
        .paddingOuter(0.2)
        .paddingInner(0.6);

    var cellSel = d3.select('#chartSecond')
        .attr('width', smWidth + MARGIN.LEFT + MARGIN.RIGHT)
        .attr('height', smHeight + MARGIN.TOP + MARGIN.BOTTOM)
        .selectAll('g.cell').data(d3.range(GRID.W * GRID.H));
    cellSel.enter()
        .append('g')
        .attr('class', 'cell')
        .attr('transform', function (d) {
            var x = wBand(d % GRID.W);
            var y = hBand(Math.floor(d / GRID.W));
            return 'translate(' + x + ', ' + y + ')';
        })
        .each(function (i) {
            // Title
            d3.select(this).append('text')
                .attr('x', -18)
                .attr('y', -15)
                .style('text-anchor', 'start')
                .style('font-size', '0.9rem')
                .style('font-weight', '400')
                .style('fill', 'black')
                .style('opacity', '0.8')
                .text(function (d) {
                    return smDataSet[d].key;
                });

            // Axis
            var smXscale = d3.scaleLinear()
                .domain(smYearExtent)
                .rangeRound([0, wBand.bandwidth()]);
            var smYscale = d3.scaleLinear()
                .domain(smValueExtent)
                .rangeRound([hBand.bandwidth(), 0]);
            var smXaxis = d3.axisBottom()
                .scale(smXscale)
                .tickSize(0)
                .tickFormat(function (d) {
                    return +d;
                })
                .ticks(3)
                .tickPadding(10);
            var smYaxis = d3.axisLeft()
                .scale(smYscale)
                .ticks(6)
                .tickSize(-wBand.bandwidth())
                .tickPadding(5);

            d3.select(this)
                .append('g')
                .attr('class', 'axis xS')
                .attr('transform', 'translate(0, ' + hBand.bandwidth() + ')')
                .style('font-size', '0.7rem')
                .style('stroke-width', '2px')
                .style('text-anchor', 'start')
                .call(smXaxis);
            d3.select(this)
                .append('g')
                .attr('class', 'axis yS')
                .attr('transform', 'translate(0, 0)')
                .style('font-size', '0.7rem')
                .style('stroke-width', '0.5px')
                .style('text-anchor', 'end')
                .call(smYaxis);

            // Event
            var event = events[1];
            d3.select(this).append("image")
                .attr('x', smXscale(event.year) - (30 / 2))
                .attr('y', hBand.bandwidth() * 0.15)
                .attr('width', 30)
                .attr('opacity', 0.8)
                .attr('xlink:href', event.icon);
            d3.select(this).append('path')
                .attr('d', 'M ' + smXscale(event.year) + ' ' + hBand.bandwidth() + ' l 0 -' + (hBand.bandwidth() * 0.5))
                .attr('stroke', 'grey')
                .attr('opacity', 0.7)
                .attr('stroke-width', 2)
                .attr('fill', 'none')
                .style('stroke-dasharray', '4,4');

            // Data line
            var line = d3.line()
                .curve(d3.curveBasis)
                .x(function (d) {
                    return smXscale(d.year);
                })
                .y(function (d) {
                    return smYscale(d.value);
                });
            d3.select(this)
                .append('path')
                .attr('class', function (d) {
                    return 'data'
                })
                .style('fill', 'none')
                .style('stroke', '#339d5f')
                .style('opacity', 0.8)
                .style('stroke-width', 3)
                .attr('d', function (d) {
                    return line(smDataSet[d].values);
                });

            // Data point and value
            d3.select(this).append('text')
                .attr('class', 'data')
                .attr('fill', 'rgb(100,100,100)')
                .attr('opacity', '0')
                .style('font-size', 15);
            d3.select(this).append('circle')
                .attr('class', 'data')
                .attr('opacity', '0')
                .attr('r', 5);

            // Background
            d3.select(this).append('rect')
                .attr('class', 'bg')
                .attr('fill', '#FFF')
                .attr('opacity', '0')
                .attr('width', wBand.bandwidth())
                .attr('height', hBand.bandwidth())
                .on('mousemove', function () {
                    var coords = d3.mouse(this);
                    var year = Math.round(smXscale.invert(coords[0]));
                    var value = smDataSet[i].values.filter(function (d) {
                        return d.year == year;
                    })[0];
                    value = value ? value.value : null;

                    if (value === null) return;

                    d3.select(this.parentNode.querySelector('circle.data'))
                        .style('opacity', 1)
                        .attr('cx', smXscale(year))
                        .attr('cy', smYscale(value))
                        .style('fill', '#339d5f');
                    d3.select(this.parentNode.querySelector('text.data'))
                        .style('opacity', 1)
                        .attr('x', smXscale(year) - 3)
                        .attr('y', smYscale(value) - 12)
                        .text(Math.round(value) + ' ton');
                })
                .on('mouseout', function () {
                    d3.select(this.parentNode.querySelector('circle.data'))
                        .style('opacity', 0);
                    d3.select(this.parentNode.querySelector('text.data'))
                        .style('opacity', 0);
                });
        })
        .merge(cellSel)
        .each(function (i) {
            // Update
        })
    cellSel.exit()
        .remove();
};
