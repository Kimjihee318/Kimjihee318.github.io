var _WIDTH = 1500,
    _HEIGHT = 760,
    _RADIUS = _WIDTH * 0.009,
    _LARGE_RADIUS = _RADIUS * 3.8,
    _SMALL_RADIUS = _RADIUS * 0.5,
    _SPEED = 500,
    _MARGIN_LEFT = _WIDTH * 0.03,
    _MARGIN_RIGHT = _WIDTH * 0.03,
    _MARGIN_TOP = _WIDTH * 0.03,
    _MARGIN_BOTTOM = _WIDTH * 0.035,
    _ALIGN_RIGHT = (_WIDTH - _MARGIN_RIGHT - _MARGIN_LEFT) / 11,
    _ALIGN_TOP = 3 * _MARGIN_TOP,
    _ALING_RIGHT_PADDING = _ALIGN_RIGHT * 6;

var svg = d3.select('#map')
    .attr('width', _WIDTH - _MARGIN_LEFT - _MARGIN_RIGHT)
    .attr('height', _HEIGHT - _MARGIN_TOP - _MARGIN_BOTTOM);
//make map scale ===============
var projection = d3.geoOrthographic()
    .scale(245)
    .translate([_WIDTH / 2, _HEIGHT / 2])
    .clipAngle(90)
    .precision(.9)
    .translate([_ALIGN_RIGHT * 7.8, (_HEIGHT) / 2.4]);

    var path = d3.geoPath()
    .projection(projection);

    svg.append("defs")
        .append("path")
        .datum({type: "Sphere"})
        .attr("id", "sphere")
        .attr("d", path)
        .style('fill','none')
        .style('stroke','#bbb5c3')
        .style('stroke-width',2)
        .style('opacity',0.3)
        .transition()
        .delay(3 * _SPEED)
        .duration(2.5 * _SPEED)
        .style('opacity', 0)
        .expOut;

    svg.append("use")
        .attr("class", "stroke")
        .attr("xlink:href", "#sphere");

//make map svg line ===============
var mapPath = d3.geoPath()
    .projection(projection);
//data_queue ===============
queue()
    .defer(d3.json, 'data/world_50m.json')
    .defer(d3.json, 'data/region_point.json')
    .await(ready);
//function draw svg ===============
var topology;
var region;
function billingDraw() {
    d3.selectAll('#map g.mapPath, #map g.lineG, #map g.arcsG, #map g.axis')
        .html('');
    console.log(region);
    var filtered_regionData = region.features;
    filtered_regionData.forEach(function (d) {
        d.fakeValues = [0, 0, 100];
    });
    var color = d3.scaleOrdinal()
        .range(['#0093c4','#8bf6ff', '#4fc3f7']);
    //pie seting ===============
    var arcRadius = d3.arc()
        .outerRadius(_RADIUS)
        .innerRadius(0);
    var smallRadius = d3.arc()
        .outerRadius(_SMALL_RADIUS)
        .innerRadius(0);
    var largeRadius = d3.arc()
        .outerRadius(_LARGE_RADIUS)
        .innerRadius(0);
    var pie = d3.pie()
        .sort(null)
        .value(function (d) {
            return d;
        });
//make circle graidient===================
    var defs = d3.select('.arcsG').append('defs');
    defs.append('radialGradient')
        .attr('id', 'sun-gradient')
        .attr('cx', '50%')
        .attr('cy', '50%')
        .attr('r', '50%')
        .selectAll('stop')
        .data([{
                offset: '0%',
                color: '#4fc3ff'
        },
            {
                offset: '80%',
                color: 'rgba(78, 195, 247,0.7)'
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
    //this is gruop to move===================
    var appendG = d3.select('.arcsG')
        .selectAll('.arcG')
        .data(filtered_regionData)
        .enter()
        // create group
        .append('g')
        .attr('class', 'arcG')
        .style('transform', function (d) {
            var xy = projection(d.geometry.coordinates);
            return 'translate(' + xy[0] + 'px, ' + xy[1] + 'px)';
        });
    var arcs = appendG.selectAll('.arcPath').data(function (d) {
        return pie(d.fakeValues);
    });
    var transitionEnded = false;
    function drawMap() {
        d3.select('.mapPath')
            .selectAll('path')
            .data(topojson.object(topology, topology.objects.countries)
                .geometries)
            .enter()
            .append('path')
            .attr('class', 'drawingPaths')
            .attr('d', mapPath)
            .transition()
            .delay(2.9 * _SPEED)
            .duration(2.5 * _SPEED)
            .style('opacity', 0)
            .expOut;
        arcs
            .enter()
            .append('path')
            .attr('class', function (d, i) {
                return 'arcPath a' + i;
            })
            .style('fill', 'url(#sun-gradient)')
            .attr('d', arcRadius)
            .style('opacity', 0)
            .transition()
            .duration(1.5 * _SPEED)
            .style('opacity', 0.8)
            .transition()
            .duration(1.4 * _SPEED)
            .style('opacity', 0)
            .transition()
            .duration(1.4 * _SPEED)
            .style('opacity', 0.6)
            .each(function (d) {
                this._current = d;
            })
            .on('end', function () {
                if (transitionEnded) return;
                transitionEnded = true;
                lineGraph();
            });
    }
    drawMap();
    //lineGraph ==================================
    function lineGraph() {
        var lineData = d3.nest()
            .key(function (d) {
                return d.a;
            })
            .entries(filtered_regionData.map(function (d, i) {
                var xy = projection(d.geometry.estimation);
                return {
                    x: xy[0],
                    y: xy[1]
                }
            }));
        var xScale = d3.scalePoint()
            .domain(d3.range(9))
            .range([0, (_WIDTH - _MARGIN_LEFT - _MARGIN_RIGHT) * 0.35]);
        var value_extent = lineData[0].values;
        var yScale = d3.scaleLinear()
            .domain(d3.extent(value_extent, function (d) {
                return d.y;
            }))
            .range([_HEIGHT * 0.5, 0]);
        appendG = d3.select('.arcsG').selectAll('.arcG').data(filtered_regionData.slice(0, 9));
        appendG.exit().remove();
        appendG
            .transition()
            .duration(1.2 * _SPEED)
            .style('transform', function (d, i) {
                var xy = projection(d.geometry.estimation);
                return 'translate(' + (xScale(i) + _ALING_RIGHT_PADDING) + 'px, ' + (_HEIGHT * 0.5 - yScale(xy[1]) + _ALIGN_TOP) + 'px)';
            });
        d3.selectAll('.arcPath')
            .style('fill', function (d, i) {
                return color(i);
            })
            .transition()
            .duration(0.3 * _SPEED)
            .attr('d', smallRadius)
            .transition()
            .duration(0.3 * _SPEED)
            .style('opacity', 0.8);
        var line = d3.line()
            .x(function (d, i) {
                return xScale(i);
            })
            .y(function (d) {
                return (_HEIGHT / 2) - yScale(d['y']);
            });
        var xAxis = d3.axisBottom()
            .scale(xScale)
            .tickFormat(function (d) {
                return (d + 1) + ' 일';
            })
            .tickSize(0)
            .tickPadding(10);
        var yAxis = d3.axisLeft()
            .scale(yScale)
            .ticks(5)
            .tickSize(0)
            .tickFormat(function (d) {
                return '$ ' + d + ',' + '000';
            })
            .tickPadding(10);
        svg.append('g')
            .attr('class', 'xaxis axis')
            .style('transform', 'translate(' + _ALING_RIGHT_PADDING + 'px, ' + (_HEIGHT * 0.5 + _ALIGN_TOP) + 'px)')
            .style('font-size', '1rem')
            .style('font-weight', 300)
            .call(xAxis)
            .transition()
            .delay(6 * _SPEED)
            .duration(0.8 * _SPEED)
            .style('opacity', 0);
        svg.append('g')
            .attr('class', 'yaxis axis')
            .style('transform', 'translate(' + _ALING_RIGHT_PADDING + 'px,' + _ALIGN_TOP + 'px)')
            .style('font-size', '1rem')
            .call(yAxis)
            .transition()
            .delay(6 * _SPEED)
            .duration(0.8 * _SPEED)
            .style('opacity', 0);
        d3.select('.lineG')
            .style('transform', 'translate(' + _ALING_RIGHT_PADDING + 'px,' + _ALIGN_TOP + 'px)');

        svg.append('linearGradient')
            .attr('id', 'line-gradient')
            .attr('gradientUnits', 'userSpaceOnUse')
            .attr('x1', 0).attr('y1', yScale(150))
            .attr('x2', 0).attr('y2', yScale(320))
            .selectAll('stop')
            .data([
                {
                    offset: '0%',
                    color: 'rgba(165,248,255,0.9)'
                  },
                {
                    offset: '100%',
                    color: '#0093c4'
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
        function drawLine() {
            var linePath = svg.select('.lineG')
                .selectAll('path')
                .data(lineData)
                .enter()
                .append('path')
                .attr('d', function (d) {
                    return line(d.values.slice(0, 9));
                })
                .style('stroke', 'url(#line-gradient)')
                .style('stroke-width', _RADIUS * 0.4)
                .style('fill', 'none')
                .style('stroke-linecap', 'round')
                .style('opacity', 0.9);
            var transitionEnded = false;
            var totalLength = linePath.node().getTotalLength();
            linePath
                .attr('stroke-dasharray', totalLength + ' ' + totalLength)
                .attr('stroke-dashoffset', totalLength)
                .transition()
                .delay(2 * _SPEED)
                .duration(2.5 * _SPEED)
                .ease(d3.easeLinear)
                .attr('stroke-dashoffset', 0)
                .transition()
                .delay(1 * _SPEED)
                .duration(1 * _SPEED)
                .style('opacity', 0)
                .on('end', function () {
                    if (transitionEnded) return;
                    transitionEnded = true;
                    smUpdate();
                });
        };
        drawLine();
    }
    //lineGraph ===================
    function smUpdate() {
        var GRID = {
            W: 3,
            H: 3
        };
        var wBand = d3.scaleBand()
            .domain(d3.range(GRID.W))
            .range([0, (_WIDTH - _MARGIN_LEFT - _MARGIN_RIGHT) / 2])
            .round(true)
            .paddingOuter(0.1)
            .paddingInner(0.2);
        var hBand = d3.scaleBand()
            .domain(d3.range(GRID.H))
            .range([0, (_HEIGHT - _MARGIN_TOP - _MARGIN_BOTTOM) * 0.9])
            .round(true)
            .paddingOuter(0.2)
            .paddingInner(0.2);
        var transitionEnded = false;
        appendG = d3.select('.arcsG')
        .selectAll('.arcG')
        .data(filtered_regionData.slice(0, 9));
        appendG.exit().remove();
        appendG
            .transition()
            .duration(1 * _SPEED)
            .style('transform', function (d, i) {
                var x = wBand(i % GRID.W) + ((_WIDTH) / 2);
                var y = hBand(Math.floor(i / GRID.W)) + 2.5 * _MARGIN_TOP;
                return 'translate(' + x + 'px, ' + y + 'px)';
            })
            .each(function (d, i) {
                d3.select(this)
                  .append('text')
                  .attr('x', -wBand.bandwidth()*0.25)
                  .attr('y',-hBand.bandwidth()*0.45)
                  .text(function(d){
                        return d.id;})
                  .style('text-anchor','start')
                  .style('font-size','1.1rem')
                  .style('opacity',0)
                  .transition()
                  .delay(0.5*_SPEED)
                  .duration(1.4*_SPEED)
                  .style('opacity', 0.68);
                var color = d3.scaleOrdinal()
                    .range(['#0093c4', '#8bf6ff', '#4fc3f7']);
                function largeTween(a) {
                    var i = d3.interpolate(this._current, a);
                    this._current = i(0);
                    return function (t) {
                        return largeRadius(i(t));
                    }
                }
                d3.select(this)
                    .selectAll('.arcPath')
                    .data(pie(d.properties.values))
                    .style('fill', function (d, i) {
                        return color(i);
                    })
                    .transition()
                    .delay(0.2 * _SPEED)
                    .duration(1.8 * _SPEED)
                    .attrTween('d', largeTween);
                var transitionEnded = false;
            })
            .style('opacity', 1)
            .transition()
            .delay(0.9 * _SPEED)
            .duration(2.5 * _SPEED)
            .style('opacity', 0.9)
            .on('end', function () {
                if (transitionEnded) return;
                transitionEnded = true;
                // draw(error, topology, region);
            });
    }
}
function ready(error, g, r) {
    if (error) throw error;
    topology = g;
    region = r;
    billingDraw();
}
