var _CDN_WIDTH = 1500,
  _CDN_HEIGHT = 760,
  _CDN_SPEED = 500,
  _CDN_MARGIN_LEFT = _CDN_WIDTH * 0.03,
  _CDN_MARGIN_RIGHT = _CDN_WIDTH * 0.03,
  _CDN_MARGIN_TOP = _CDN_WIDTH * 0.03,
  _CDN_MARGIN_BOTTOM = _CDN_WIDTH * 0.035,
  _CDN_ALIGN_RIGHT = (_CDN_WIDTH - _CDN_MARGIN_RIGHT - _CDN_MARGIN_LEFT) / 11,
  _CDN_ALIGN_TOP = 3 * _CDN_MARGIN_TOP,
  _CDN_ALING_RIGHT_PADDING = _CDN_ALIGN_RIGHT * 6;

var cdn_svg = d3.select('#cdn')
  .attr('width', (_CDN_WIDTH - _CDN_MARGIN_LEFT - _CDN_MARGIN_RIGHT))
  .attr('height', _CDN_HEIGHT - _CDN_MARGIN_TOP - _CDN_MARGIN_BOTTOM);
//make map scale ===============
var cdn_projection = d3.geoMercator()
  .scale(_CDN_WIDTH / 13)
  .translate([_CDN_ALIGN_RIGHT * 7.5, _CDN_HEIGHT / 1.9]);
//make map svg line ===============
var cdn_mapPath = d3.geoPath()
  .projection(cdn_projection);
var cdnTopology;
var cdnPoint;

//data_queue ===============
queue()
  .defer(d3.json, 'data/world_50m.json')
  .defer(d3.json, 'data/cdn_point.json')
  .await(ready);
//function draw svg ===============
function cdnDraw() {
  d3.selectAll('#CDN g.CDN_map, #CDN g.CDN_marker')
      .html('');

  d3.select('.CDN_map')
    .selectAll('path')
    .data(topojson.object(cdnTopology, cdnTopology.objects.countries)
      .geometries)
    .enter()
    .append('path')
    .attr('class', function(d,i){return 'cdn-mapPaths map'+i })
    .attr('d', cdn_mapPath);

  var filtered_cdnData = cdnPoint.features;

  var sortedData = filtered_cdnData.sort(function(a, b) {
    return d3.descending(a.geometry.coordinates[0], b.geometry.coordinates[0]);
  });

  var cdn_lineData = d3.nest()
    .key(function(d) {
      return d.a;
    })
    .entries(sortedData.map(function(d, i) {
      var xy = cdn_projection(d.geometry.coordinates);
      return {
        x: xy[0],
        y: xy[1]
      }
    }));

  var Gradient = d3.select('.CDN_marker').append('g')
    .attr('class', 'gradient_circle').selectAll('circle').data(sortedData);

  var cdn_xScale = d3.scaleLinear()
    .domain(d3.extent(sortedData, function(d) {
      return d.geometry.coordinates[0];
    }))
    .range([_CDN_WIDTH, 0]);

  var cdn_yScale = d3.scaleLinear()
    .domain(d3.extent(sortedData, function(d) {
      return d.geometry.coordinates[1];
    }))
    .range([_CDN_HEIGHT, 0]);

  cdn_svg.append('linearGradient')
    .attr('id', 'cdn_gradient')
    .attr('gradientUnits', 'userSpaceOnUse')
    .attr('x1', cdn_xScale(-70)).attr('y1', cdn_yScale(-10))
    .attr('x2', cdn_xScale(-30)).attr('y2', cdn_yScale(15))
    .selectAll('stop')
    .data([
      {
        offset: '0%',
        color: '#0093c4'
      },
      {
        offset: '50%',
        color: '#4fc3ff'
      },
      {
        offset: '100%',
        color: 'rgba(97,199,246,0.7)'
      }
    ])
    .enter()
    .append('stop')
    .attr('offset', function(d) {
      return d.offset;
    })
    .attr('stop-color', function(d) {
      return d.color;
    });

    Gradient
        .enter()
        .append('circle')
        .attr('class', function(d, i) {
          return 'circle' + i;
        })
        .attr('cx', function(d, i) {
          var xy = cdn_projection(d.geometry.coordinates);
          return xy[0];
        })
        .attr('cy', function(d, i) {
          var xy = cdn_projection(d.geometry.coordinates);
          return xy[1];
        })
        .attr('r', '3px')
        .style('fill', 'url(#cdn_gradient)')
        .style('opacity', 0.5)
        .sort(function(a, b){
          return Math.random();
        })
        .transition()
        .delay(function(d, i) {
          return i * (_CDN_SPEED) * 0.45 + 200;
        })
        .duration(_CDN_SPEED*6)
        .style('opacity', 0)
        .attr('r', '35px')
        .transition()
        .duration(_CDN_SPEED*4)
        .style('opacity', 0)
        .expOut;

  Gradient
    .enter()
    .append('circle')
    .attr('class', function(d, i) {
      return 'pointCircle' + i;
    })
    .attr('cx', function(d, i) {
      var xy = cdn_projection(d.geometry.coordinates);
      return xy[0];
    })
    .attr('cy', function(d, i) {
      var xy = cdn_projection(d.geometry.coordinates);
      return xy[1];
    })
    .attr('r', '5.5px')
    .style('fill', 'url(#cdn_gradient)')
    .style('opacity', 0.9);

}

function ready(error, t, p) {
  if (error) throw error;
  cdnTopology = t;
  cdnPoint = p;
  cdnDraw();
}
