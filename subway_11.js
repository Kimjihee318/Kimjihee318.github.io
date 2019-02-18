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

  data.forEach(function(row, i) {
    row['사용일자'] = +(row['사용일자']);
    row['노선명'] = row['노선명'];
    row['역명'] = row['역명'];
    row['승차총승객수'] = +row['승차총승객수'];
    row['하차총승객수'] = +row['하차총승객수'];
    delete row['역ID'];
    delete row['등록일자'];
  });
  data
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
  });
  var maxdatas = d3.max(dataSet, function(d) {
    return d['승차총승객수'];
  });

  var smWidth = window.innerWidth * 0.76,
    smHeight = window.innerHeight * 5,
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
    .paddingInner(0.25)
    .paddingOuter(0.1);
  var hBand = d3.scaleBand()
    .domain(d3.range(GRID.H))
    .range([0, smHeight + T + B])
    .round(true)
    .paddingInner(0.7)
    .paddingOuter(0.3);
  var cellSel = d3.select('svg')
    .attr('width', smWidth + L + R)
    .attr('height', smHeight + T + B)
    .selectAll('g.cell')
    .data(data[0].values, function(d) {
      return
    });
  cellSel.enter()
    .append('g')
    .attr('class', 'cell')
    .attr('transform', function(d, i) {
      var x = wBand(i % GRID.W);
      var y = hBand(Math.floor(i / GRID.W));
      return 'translate(' + x + ', ' + y + ')';
    })
    .each(function(d, i) {
      console.log(d);
      stopNames = d3.set(d.values.map(function(d) {
        return d['역명'];
      })).values();
      for (var i = 0; i < data[0].values.length; i++) {
        stopsI.push(data[0].values[i].key);
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
          return +d;
        })
        .ticks(4)
        .tickSize(-wBand.bandwidth());
      d3.select(this)
        .append('g')
        .attr('class','xAxis')
        .style('transform', 'translate(' + 0 + 'px,' + hBand.bandwidth() + 'px)')
        .call(xAxis)
        .selectAll('text')
        .attr('class', function(d, i) {
          return 't' + i;
        });
        d3.select(this)
          .append('g')
          .attr('class','yAxis')
          .call(yAxis)
          .selectAll('text')
          .attr('class', function(d, i) {
            return 'p' + i;
          });
      d3.select(this)
        .append('text')
        .text(function(d) {
          return d.key;
        })
        .attr('dx', -39)
        .attr('dy', -20)
        .style('font-size','2rem')
        .style('font-weight','bold');
    })
    .merge(cellSel)
    .each(function(d) {
      stopNames = d3.set(d.values.map(function(d) {
        return d['역명'];
      })).values();
      var xScale = d3.scalePoint()
        .domain(stopNames)
        .range([0, wBand.bandwidth()]);
      var yScale = d3.scaleLinear()
        .domain([0, maxdatas])
        .range([hBand.bandwidth(), 0]);
        // var parts = d3.voronoi()
        //     .extent([[-L, -T], [W, H]])
        //     .x(function (d) {
        //         return d.x;
        //     })
        //     .y(function (d) {
        //         return d.y;
        //     })
        //     .polygons(data);
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
        d3.select(this)
          .append('path')
          .attr('d', line(d.values))
          .style('fill', 'none')
          .style('stroke', function(d, i) {
            return colorScale(d.key);
          })
          .style('stroke-width', 2);
      // var gradientRadial = d3.select(this).append("defs").selectAll("radialGradient")
      //   .data(data[0].values)
      //   .enter().append("radialGradient")
      //   .attr("id", function(d,i) {
      //     return "gradient-" + d.key;
      //   })
      //   .attr("cx", "50%")
      //   .attr("cy", "50%")
      //   .attr("r", "50%");
      // gradientRadial.append("stop")
      //   .attr("offset", "0%")
      //   .attr("stop-color", function(d) {
      //     return  d3.rgb(colorScale(d.key)).brighter(4);
      //   });
      // gradientRadial.append("stop")
      //   .attr("offset", "70%")
      //   .attr("stop-color", function(d) {
      //     return colorScale(d.key);
      //   });
      // gradientRadial.append("stop")
      //   .attr("offset", "100%")
      //   .attr("stop-color", function(d,i) {
      //     return d3.rgb(colorScale(d.key));
      //   });
      d3.select(this)
        .selectAll('.data')
        .data(d.values)
        .enter()
        .append('circle')
        .attr('class', function(d) {
          return 'data'
        })
        .attr('cx', function(d) {
          return xScale(d['역명']);
        })
        .attr('r', function(d, i) {
          return 2;
        })
        .attr('cy', function(d) {
          return yScale(d['승차총승객수']);
        })
        .on('mouseover', function(d, i) {
          d3.select(this.parentNode.querySelector(".t" + i))
            .style('opacity', 1);
        })
        .on('mouseout', function(d, i) {
          d3.select(this.parentNode.querySelector(".t" + i))
            .style('opacity', null);
        })
        .style('opacity', function(){})
        // .style("fill", function(d) {
        //   return "url(#gradient-" + d['노선명']+ ")";
        // })
        .transition()
        .delay(200)
        .duration(2500)
        .attr('r', function(d, i) {
          return d['승차총승객수'] * 0.0003;
        })
        .expOut;
    });
  cellSel.exit()
    .remove();

}
