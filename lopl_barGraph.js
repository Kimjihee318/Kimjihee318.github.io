 dataSet = [];
 d3.csv('data/coffee_data.csv', function (err, rows) {
     console.log(row)
     rows.forEach(function (row) {

         row['평균방문횟수'] = +row['평균방문횟수'];
         row['최초방문'] = +row['최초방문'].slice(0, -1);
         row['재방문'] = +row['재방문'].slice(0, -1);
         row['1회'] = +row['1회'].slice(0, -1);
         row['2회'] = +row['2회'].slice(0, -1);
         row['3회'] = +row['3회'].slice(0, -1);
         row['4회'] = +row['4회'].slice(0, -1);
         row['단일브랜드'] = +row['단일브랜드'].slice(0, -1);
         row['복수브랜드'] = +row['복수브랜드'].slice(0, -1);
     });
     dataSet = rows;

     d3.selectAll('input').on('change', function () {
         redraw(this.value.split(','));
     });
     redraw(['평균방문횟수']);
 });

 var redraw = function (metrics) {
     var width = 400;
     var height = 400;
     MARGIN = {
         TOP: 40,
         LEFT: 100,
         RIGHT: 500,
         BOTTOM: 50
     };

     var metric = metrics[0];
     var stackedData = d3.layout.stack()(metrics.map(function (metric) {
         return dataSet.map(function (d) {
             return {
                 x: d['매장명'],
                 y: d[metric]
             };
         })
     }));

     var svg = d3.select('svg')
         .attr('width', width + MARGIN.LEFT + MARGIN.RIGHT)
         .attr('height', height + MARGIN.TOP + MARGIN.BOTTOM);

     var storeNames = dataSet.map(function (d) {
         return d['매장명'];
     });

     var maxValue = d3.max(
         stackedData[stackedData.length - 1],
         function (d) {
             return d.y0 + d.y;
         }
     );
     var xScale = d3.scale.linear()
         .domain([0, maxValue])
         .range([0, width]);
     var yScale = d3.scale.ordinal()
         .domain(storeNames)
         .rangeRoundBands([0, height], 0.17);
     var zScale =
         d3.scale.ordinal().range(['#fec84e', '#e6a237', '#cd7d20', '#b35806']);

     var xAxis = d3.svg.axis()
         .scale(xScale)
         .orient('top')
         .tickSize(0)
         .tickPadding(8);
     var yAxis = d3.svg.axis()
         .scale(yScale)
         .orient('left')
         .tickPadding(10)
         .tickSize(0);

     var Chart = d3.select('#chart');
     Chart.selectAll('.layers').data([0]).enter()
         .append('g')
         .attr('class', 'layers')
         .attr('transform', 'translate(' + MARGIN.LEFT + ', ' + MARGIN.TOP + ')');

     var layers = Chart.selectAll('.layers').selectAll('.layer').data(stackedData);
     layers.enter()
         .append('g')
         .attr('class', 'layer');
     layers.exit().remove();

     var bars = layers.selectAll('.bar').data(function (d) {
         return d;
     });
     bars.enter().append('rect')
         .attr('class', 'bar')
         .attr('y', function (d) {
             return yScale(d.x);
         })
         .attr('height', yScale.rangeBand());
     bars
         .attr('x', function (d) {
             return xScale(d.y0);
         })
         .attr('width', function (d) {
             return xScale(d.y);
         })
         .style('fill', function (d, i, j) {
             return zScale(j);
         })
         .on('mouseover', function (d) {
             var query = '.tooltip.shop-' + d.x.replace(' ', '-');
             layers.selectAll(query).attr('opacity', 1);
             var boxQuery = '.box-' + d.x.replace(' ', '-');
             layers.selectAll(boxQuery).attr('opacity', 1);
         })
         .on('mouseout', function (d) {
             var query = '.tooltip.shop-' + d.x.replace(' ', '-');
             layers.selectAll(query).attr('opacity', 0);
             var boxQuery = '.box-' + d.x.replace(' ', '-');
             layers.selectAll(boxQuery).attr('opacity', 0);
         });
     bars.exit().remove();

     var tooltips = layers.selectAll('.tooltip').data(function (d) {
         return d;
     });
     tooltips.enter().append('text')
         .attr('class', function (d) {
             console.log(d.x);
             console.log(d);
             return 'tooltip shop-' + d.x.replace(' ', '-');
         })
         .attr('y', function (d) {
             return yScale(d.x) + yScale.rangeBand() - 7;
         })
         .attr('opacity', 0);
     tooltips
         .attr('x', function (d, i, j) {
             return xScale(d.y + d.y0) - 3;
         })
         .text(function (d, i, j) {
             return d.y;
         })
         .style('text-anchor', 'end')
         .style('padding', '10px')
         .style('font-size', '15px');
     tooltips.exit().remove();

     Chart.selectAll('g.y.axis').data([0])
         .enter()
         .append('g')
         .attr('class', 'y axis')
         .attr('transform', 'translate( ' + MARGIN.LEFT + ',' + MARGIN.TOP + ')')
         .call(yAxis)
         .style('text-anchor', 'end')
         .style('font-weight', '400');

     var xAxisGroup = Chart.selectAll('g.x.axis').data([0]);

     xAxisGroup.enter()
         .append('g')
         .attr('class', 'x axis')
         .attr('transform', 'translate(' + MARGIN.LEFT + ', ' + MARGIN.TOP + ')')
         .style('text-anchor', 'start');
     xAxisGroup
         .call(xAxis);

     var smallBar = Chart.selectAll('.smallbar').data(stackedData);

     smallBar
         .enter()
         .append('rect')
         .attr('class', 'smallbar')
         .attr('x', function (d, i, j) {
             return +(i * 90) + 608;
         }).attr('heigth', 10);
     smallBar.attr('y', MARGIN.TOP + 53)
         .attr('width', 15)
         .style('fill', function (d, i, j) {
             return zScale(i);
         });
     smallBar.exit().remove();

     var smallTooltip = Chart.selectAll('.smallTooltip').data(stackedData);
     smallTooltip
         .enter()
         .append('text')
         .attr('class', 'smallTooltip')
         .style('font-size', 13);
     smallTooltip
         .text(function (d, i, j) {
             return metrics[i];
         })
         .attr('x', function (d, i, j) {
             return +(i * 90) + 630;
         })
         .attr('y', MARGIN.TOP + 65);
     smallTooltip.exit().remove();
 };
