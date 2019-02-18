var cNames = [];
d3.csv('data/bigMac.csv', function(err, data) {

  data.forEach(function(d) {
    d.dollar_price = +d.dollar_price;
  });

  var mapD = data.map(function(d) {
    return {
      country: d.Country,
      bigMacPrice: d.dollar_price
    }
  });

  var sortD = mapD.sort(function(a, b) {
    return d3.descending(a.bigMacPrice, b.bigMacPrice);
  }).slice(0, 30);

  cNames = d3.set(sortD.map(function(d) {
    return d.country;
  })).values();

  render(sortD);

});

function render(data) {

  var svg = d3.select('svg');
  var W = window.innerWidth * 2.5,
    H = window.innerHeight * 0.65,
    T = 50,
    B = 100,
    L = 100,
    R = 100;

  svg.attr('width', W + 100).attr('height', H + 50).style('transform', 'translate(' + 0 + 'px,' + T + 'px)');
  var xScale = d3.scaleBand()
    .domain(cNames)
    .range([0, W]);

  var yScale = d3.scaleLinear()
    .domain([d3.max(data, function(d) {
      return d.bigMacPrice + 1;
    }), 0])
    .range([0, H]);

  var xAxis = d3.axisBottom().scale(xScale).tickSize(0).tickPadding(15);
  var yAxis = d3.axisLeft().scale(yScale);

  svg.append('g')
    .attr('class', 'xAxis')
    .style('transform', 'translate(' + L + 'px,' + (H) + 'px)')
    .style('font-size', '1.3rem')
    .style('font-weight', 'bold')
    .call(xAxis)
    .selectAll('text')
    .attr('class', function(d, i) {
      return 't' + i;
    });

  svg.append('g').attr('class', 'yAxis')
    .style('transform', 'translate(' + L + 'px,' + 0 + 'px)')
    .call(yAxis);

  d3.select('.bImg')
    .attr('width', 0)
    .transition()
    .delay(500)
    .attr('width', 400);

  d3.select('.Stext')
    .style('opacity', 0)
    .transition()
    .delay(1500)
    .style('opacity', 1);

  d3.select('.burgers')
    .transition()
    .delay(2000)
    .style('opacity', 0);

  var imageData = svg.select('.imgG').data(data);
  var imageUpdate = imageData.selectAll('image').data(data);
  var imageEnter = imageUpdate.enter();

  var moneies = imageEnter
    .append('g')
    .attr('class', 'innerG')
    .style('transform', 'translate(' + L + 'px,' + 0 + 'px)');
  moneies
    .append('image')
    .attr('x', function(d) {
      return xScale(d.country) - xScale.bandwidth() / 2;
    })
    .attr('y', H)
    .attr('width', 0)
    .on('mouseover', function(d, i) {
      d3.select(this.parentNode.parentNode.parentNode.querySelector(".t" + i))
        .style('font-size', '1.5rem')
        .style('font-weight', '900')
        .style('opacity', '1');

      d3.select(this.parentNode.querySelector('text'))
        .transition()
        .duration(100)
        .style('fill', 'yellow')
        .transition()
        .duration(100)
        .style('fill', '#fcbc05');
    })
    .on('mouseout', function(d, i) {
      d3.select(this.parentNode.parentNode.parentNode.querySelector(".t" + i))
        .style('font-size', null)
        .style('font-weight', null)
        .style('opacity', null);
    })
    .transition()
    .delay(function(d, i) {
      return i * 200 + 3000;
    })
    .attr('y', function(d) {
      return yScale(d.bigMacPrice);
    })
    .attr('width', function(d) {
      return d.bigMacPrice * 54 + 'px';
    })
    .attr('xlink:href', 'images/dollar_mini.png');

  moneies
    .append('text')
    .style('transform', 'translate(' + L + 'px,' + 0 + 'px)')
    .text(function(d) {
      return d.bigMacPrice + "$";
    })
    .attr('x', function(d) {
      return xScale(d.country);
    })
    .attr('y', function(d) {
      return yScale(d.bigMacPrice);
    })
    .style('font-size', '2rem')
    .style('alignment-baseline', 'center')
    .style('text-anchor', 'end')
    .style('font-weight', 'bold')
    .style('fill', '#fcbc05')
    .style('opacity', 0)
    .transition()
    .delay(function(d, i) {
      return i * 200 + 3000;
    })
    .style('opacity', 1);
}
