d3.csv('/static/datasets/wordfreq1.csv', function (err, data) {
    data.forEach(function (d) {
        d.freq = +d.freq;
    });

    render(data);

    window.addEventListener('resize', function() {
        render(data);
    });
});

function render(data) {
    var W = window.innerWidth;
    var H = window.innerHeight;
    var L = 15, R = 15, T = 30, B = 30;

    var root = d3.select('svg')
        .attr('width', W)
        .attr('height', H);
    var x = d3.scaleLog()
        .domain(d3.extent(data, function (d) { return d.freq; }))
        .range([0, W - L - R]);
    var xAxis = d3.axisBottom()
        .ticks(10, '.0s')
        .scale(x);
    root.select('.axis')
        .style('transform', 'translate(' + L + 'px, ' + (H - B) + 'px)')
        .call(xAxis);

    var sim = d3.forceSimulation(data)
        .force('y', d3.forceY((H - T - B) * 0.5))
        .force('x', d3.forceX(function (d) { return x(d.freq); }).strength(1.0))
        .force('c', d3.forceCollide(4))
        .stop();
    for (var i = 0; i < 120; i++) sim.tick();

    var parts = d3.voronoi()
        .extent([[-L, -T], [W, H]])
        .x(function (d) { return d.x; })
        .y(function (d) { return d.y; })
        .polygons(data);

    if(root.select('.data .cell').empty()) {
        var cells = root.select('.data')
            .style('transform', 'translate(' + L + 'px, ' + T + 'px)')
            .selectAll('g.cell')
            .data(data)
            .enter()
            .append('g')
            .attr('class', 'cell');

        cells.append('circle')
            .attr('r', 3);
        cells.append('path');
        cells.append('title')
            .text(function (d) { return d.word; });
    }

    var cells = root.select('.data')
        .selectAll('g.cell');

    cells.select('path')
        .attr('d', function(d, i) {
            return 'M' + parts[i].join('L') + 'Z';
        });
    cells.select('circle')
        .attr('cx', function (d) { return d.x; })
        .attr('cy', function (d) { return d.y; })
}
