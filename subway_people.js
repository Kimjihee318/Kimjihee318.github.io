var dataSet = [];
var stopNested = [];
var stopNames = [];
var stopsI = [];
var colors = ['#191c72', '#23993b', '#ffa636', '#0070b8',
  '#951a79', '#ba8e66', '#6e8d47', '#f61e82',
  '#8d4b00', '#8d4b00', '#1d7fe8', '#191c72',
  '#7dc4a5', '#7dc4a5', '#191c72', '#28a97f',
  '#5db7e9', '#0070b8', '#eeb217', '#eeb217',
  '#191c72', '#c7c100', '#fb5e2d', '#191c72', '#7dc4a5'
];
d3.csv('data/SUBWAY_MONTH_201711.csv', function(err, data) {
    var format = d3.timeFormat('%Y %m %d %a');
    var parse = d3.timeParse('%Y%m%d');
  data.forEach(function(row, i) {
    row['사용일자'] = format(parse(row['사용일자']));
    row['노선명'] = row['노선명'];
    row['역명'] = row['역명'];
    row['승차총승객수'] = +row['승차총승객수'];
    row['하차총승객수'] = +row['하차총승객수'];
    delete row['역ID'];
    delete row['등록일자'];
  });
  data.sort(function(a, b) {
      return d3.ascending(a['사용일자'], b['사용일자']);
    })
    .sort(function(a, b) {
      return d3.ascending(a['노선명'], b['노선명']);
    });
  dataSet = data;
  
  stopNested.push(d3.nest().key(function(d) {
    return d['노선명'];
  }).key(function(d) {
    return d['역명'];
  }).entries(
    data
  ));

  var nested = d3.nest().key(function(d) {
      return d['사용일자'];
    }).key(function(d) {
      return d['노선명'];
    }).entries(
      data
    )
    .sort(function(a, b) {
      return d3.ascending(a.key, b.key);
    });

  var options = d3.select('#date').selectAll('option').data(nested);

  options.enter()
    .append('option')
    .merge(options)
    .attr('value', function(d, i) {
      return d.key;
    })
    .text(function(d, i) {
      return d.key;
    });
  options.exit().remove();

  d3.select('#date').on('change', function() {
    render(nested);
  });
  render(nested);
});

function render(data) {
  var targetDate = d3.select('#date').property('value');

  var data = data.filter(function(d) {
    return d.key === targetDate;
  })[0];
  var maxdatas = d3.max(dataSet, function(d) {
    return d['승차총승객수'];
  });

  var smWidth = window.innerWidth * 0.76,
    smHeight = window.innerHeight * 4.4,
    L = 50,
    R = 50,
    T = 100,
    B = 200;

  var GRID = {
    W: 2,
    H: 13
  };
  var wBand = d3.scaleBand()
    .domain(d3.range(GRID.W))
    .range([0, smWidth])
    .round(true)
    .paddingInner(0.3)
    .paddingOuter(0.1);

  var hBand = d3.scaleBand()
    .domain(d3.range(GRID.H))
    .range([0, smHeight + T + B])
    .round(true)
    .paddingInner(0.6)
    .paddingOuter(0.2);

  var cellSel = d3.select('svg')
    .attr('width', smWidth + L + R)
    .attr('height', smHeight + T + B)
    .selectAll('g.cell')
    .data(data.values);

  cellSel.enter()
    .append('g')
    .attr('class', 'cell')
    .attr('transform', function(d, i) {
      var x = wBand(i % GRID.W);
      var y = hBand(Math.floor(i / GRID.W));
      return 'translate(' + x + ', ' + y + ')';
    })
    .each(function(d, i) {
      stopNames = d3.set(d.values.map(function(d) {
        return d['역명'];
      })).values();
      for (var i = 0; i < data.values.length; i++) {
        stopsI.push(data.values[i].key);
      }
      var colorScale = d3.scaleOrdinal()
        .domain(stopsI)
        .range(colors);
      d3.select(this).style('fill', function(data, i) {
        return colorScale(d.key);
      });
      var length = stopNames.length;
      var xScale = d3.scalePoint()
        .domain(stopNames)
        .range([0, wBand.bandwidth()]);
      var yScale = d3.scaleLinear()
        .domain([0, maxdatas])
        .range([hBand.bandwidth(), 0]);
      var xAxis = d3.axisBottom()
        .scale(xScale)
        .tickSize(0)
        .ticks(2)
        .tickPadding(15);
      var yAxis = d3.axisLeft()
        .scale(yScale)
        .tickFormat(function(d) {
          if (d > 1) {
            return d / 10000 + "만명";
          } else {
            return d / 10000;
          }
        })
        .tickValues([0, 40000, 80000, 120000])
        .tickPadding(15)
        .tickSize(-wBand.bandwidth());
      d3.select(this)
        .append('g')
        .attr('class', 'axisG');
      d3.select(this)
        .select('.axisG')
        .append('g')
        .attr('class', 'xAxis')
        .style('transform', 'translate(' + 0 + 'px,' + hBand.bandwidth() + 'px)')
        .call(xAxis)
        .selectAll('text')
        .attr('class', function(d, i) {
          return 't' + i;
        });
      d3.select(this)
        .select('.axisG')
        .append('g')
        .attr('class', 'yAxis')
        .call(yAxis)
        .selectAll('text')
        .attr('class', function(d, i) {
          return 'p' + i;
        })
        .style('font-size', '0.8rem');
      d3.select(this)
        .select('.axisG')
        .append('text')
        .text(function(d) {
          return d.key;
        })
        .attr('dx', -50)
        .attr('dy', -30)
        .style('font-size', '1.8rem')
        .style('font-weight', 'bold');
      d3.select(this)
        .append('g')
        .attr('class', 'circleG');
      d3.select(this)
        .append('g')
        .attr('class', 'pathG')
        .append('path')
        .attr('class', 'dataline');
      d3.select(this)
        .append('g')
        .attr('class', 'voronoiG');
    })
    .merge(cellSel)
    .each(function(d, i) {
      stopNames = d3.set(d.values.map(function(d) {
        return d['역명'];
      })).values();
      var xScale = d3.scalePoint()
        .domain(stopNames)
        .range([0, wBand.bandwidth()]);
      var yScale = d3.scaleLinear()
        .domain([0, maxdatas])
        .range([hBand.bandwidth(), 0]);
      var colorScale = d3.scaleOrdinal()
        .domain(stopsI)
        .range(colors);
      var line = d3.line()
        .x(function(d) {
          return xScale(d['역명'])
        })
        .y(function(d) {
          return yScale(d['승차총승객수'])
        })
        .curve(d3.curveCardinal);
      var colorScale = d3.scaleOrdinal()
        .domain(stopsI)
        .range(colors);
      d3.select(this).select('path.dataline')
        .attr('d', line(d.values))
        .style('fill', 'none')
        .style('stroke', function(d, i) {
          return colorScale(d.key);
        })
        .style('stroke-width', 2.5);
      var parts = d3.voronoi()
        .extent([
          [0, 0],
          [wBand.bandwidth(), hBand.bandwidth()]
        ])
        .x(function(d) {
          return xScale(d['역명']);
        })
        .y(function(d) {
          return yScale(d['승차총승객수']);
        })
        .polygons(d.values); //픽셀 좌표가 아니라서 안되는것, 스케일을 적용해서 픽셀좌표로 바꿔줘라.
      // console.log(parts);
      var voronoiUpdate = d3.select(this)
        .select('.voronoiG')
        .selectAll('.voronoiPath')
        .data(parts);

      var voronoiEnter = voronoiUpdate.enter();
      voronoiEnter.append('path')
        .attr('class', 'voronoiPath')
        .attr('d', function(d, i) {
          return 'M' + parts[i].join('L') + 'Z';
        })
        .style('fill', 'rgba(0,0,0,0)')
        .style('stroke', 'none')
        .on('mouseover', function(d, i) {
          d3.select(this.parentNode.parentNode.querySelector(".t" + i))
            .style('opacity', 1);
        })
        .on('mouseout', function(d, i) {
          d3.select(this.parentNode.parentNode.querySelector(".t" + i))
            .style('opacity', null);
        });
      var updateCircle = d3.select(this)
        .select('.circleG')
        .selectAll('.data')
        .data(d.values);
      var endterCircle = updateCircle.enter();
      endterCircle.append('circle')
        .attr('class', function(d) {
          return 'data'
        })
        .attr('cx', function(d) {
          return xScale(d['역명']);
        })
        .attr('r', function(d, i) {
          return 2;
        })
        .style('opacity', 0.7)
        .merge(updateCircle)
        .attr('cy', function(d) {
          return yScale(d['승차총승객수']);
        })
        .transition()
        .delay(200)
        .duration(2000)
        .attr('r', function(d, i) {
          return d['승차총승객수'] * 0.0003;
        })
        .expOut;
      updateCircle.exit().remove();
    });
  cellSel.exit()
    .remove();
}