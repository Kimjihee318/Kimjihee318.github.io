var _SEALING_WIDTH = 1500,
  _SEALING_HEIGHT = 760,
  _SEALING_SPEED = 500,
  _SEALING_MARGIN_LEFT = _SEALING_WIDTH * 0.03,
  _SEALING_MARGIN_RIGHT = _SEALING_WIDTH * 0.03,
  _SEALING_MARGIN_TOP = _SEALING_WIDTH * 0.03,
  _SEALING_MARGIN_BOTTOM = _SEALING_WIDTH * 0.035,
  _SEALING_ALIGN_RIGHT = (_SEALING_WIDTH - _SEALING_MARGIN_RIGHT - _SEALING_MARGIN_LEFT) / 11,
  _SEALING_ALIGN_TOP = 3 * _SEALING_MARGIN_TOP,
  _SEALING_ALING_RIGHT_PADDING = _SEALING_ALIGN_RIGHT * 6;

var sealing_svg = d3.select('#sealing')
  .attr('width', (_SEALING_WIDTH - _SEALING_MARGIN_LEFT - _SEALING_MARGIN_RIGHT))
  .attr('height', _SEALING_HEIGHT - _SEALING_MARGIN_TOP - _SEALING_MARGIN_BOTTOM);

d3.select('.images')
  .style('transform', 'translate(' + _SEALING_ALIGN_RIGHT * 6.8 + 'px, ' + _SEALING_MARGIN_TOP*1.5 + 'px)')

d3.select('.images')
  .append('image')
  .attr('x', '0')
  .attr('y', '0')
  .attr('width', '290px')
  .attr('xlink:href', 'images/iphone_mock2.png');

var sealing_defs = sealing_svg.append("defs");
var sealing_linearGradient = sealing_defs.append("linearGradient")
  .attr("id", "animate-gradient")
  .attr("x1", "0%")
  .attr("y1", "0%")
  .attr("x2", "100%")
  .attr("y2", "0")
  .attr("spreadMethod", "reflect");

var sealing_colours = ["#b5e6fc", "#4fc3ff","#039be5"];

sealing_linearGradient
  .selectAll(".stop")
  .data(sealing_colours)
  .enter()
  .append("stop")
  .attr("offset", function(d, i) {
    return i / (sealing_colours.length - 1);
  })
  .attr("stop-color", function(d) {
    return d;
  });

sealing_linearGradient
  .append("animate")
  .attr("attributeName", "x1")
  .attr("values", "0%;200%")
  .attr("dur", "10s")
  .attr("repeatCount", "indefinite");

sealing_linearGradient
  .append("animate")
  .attr("attributeName", "x2")
  .attr("values", "100%;300%")
  .attr("dur", "10s")
  .attr("repeatCount", "indefinite");

function sealingDraw() {

  d3.selectAll('#sealing g.images')
      .html('');

d3.select('.images')
  .append('image')
  .attr('x', '0')
  .attr('y', '0')
  .attr('width', '290px')
  .attr('xlink:href', 'images/iphone_mock2.png');

  d3.select('.images').append("rect")
    .attr("x", 31)
    .attr("y", 75)
    .attr("width", 223)
    .attr("height", 395)
    .style('opacity','0')
    .transition()
    .delay(_SEALING_SPEED*0.8)
    .duration(_SEALING_SPEED*2)
    .style("fill", "url(#animate-gradient)")
    .style('opacity','0.6');

var shield = d3.select('.images')
  .append('image')
  .attr('x', 80)
  .attr('y', 175)
  .attr('width', '130px')
  .style('opacity',0)
  .transition()
  .delay(_SEALING_SPEED*0.8)
  .duration(_SEALING_SPEED*2.2)
  .attr('xlink:href', 'images/shield.png')
  .style('opacity',0.98)
  .polyInOut;
}
