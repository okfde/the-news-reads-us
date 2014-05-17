(function(){
  /* globals d3 */
  'use strict';

  window.NewsReadsYou = window.NewsReadsYou || {};
  window.NewsReadsYou.trackAttack = function(selector, trackers, options) {
    options = options || {};

    var w = options.width || 960,
        h = options.height || 800;

    var allNodes = [{
      radius: 20,
      px: 0,
      py: 0,
      fixed: true
    }];
    var nodes = allNodes.slice();
    for (var key in trackers) {
      trackers[key].width = 120;
      trackers[key].height = 50;
      trackers[key].radius = 30;
      trackers[key].px = trackers[key].x = Math.random() > 0.5 ? w : 0;
      trackers[key].py = trackers[key].y = Math.random() > 0.5 ? h : 0;
      allNodes.push(trackers[key]);
    }

    var force = d3.layout.force()
        .gravity(0.0)
        .nodes(nodes)
        .links([])
        .charge(function(d, i) { return i ? 0 : -500; })
        .size([w, h]);

    var root = allNodes[0];
    var nodeIndex = 1;

    var svg = d3.select(selector).append('svg:svg')
        .attr('width', w)
        .attr('height', h)
        .attr('class', 'tracking-svg');

    var node = svg.selectAll('.logo');

    var addNode = function(index) {
      nodes.push(allNodes[index]);

      force.start();
      node = node.data(nodes.slice(1));

      var svgXmlns = 'http://www.w3.org/2000/svg';

      node.enter()
        .append(function(d){
          if (d.company_logo_url) {
            return document.createElementNS(svgXmlns, 'image');
          } else {
            return document.createElementNS(svgXmlns, 'text');
          }
        })
        .attr('class', 'logo')
        .attr('x', function(d){
          return d.x;
        })
        .attr('y', function(d){
          return d.y;
        })
        .attr('width', function(d){
          return d.width;
        })
        .attr('height', function(d){
          return d.height;
        })
        .attr('xlink:href', function(d){
          return d.company_logo_url || '#';
        })
        .text(function(d){
          if (!d.company_logo_url) {
            return d.domain;
          }
        });
    };

    addNode(nodeIndex);

    var interval;
    window.setTimeout(function(){
      interval = window.setInterval(function(){
        if (nodeIndex >= allNodes.length - 1) {
          window.clearInterval(interval);
        }
        addNode(nodeIndex);
        nodeIndex += 1;
      }, options.interval || 200);
    }, options.delay || 0);

    force.on('tick', function(e) {

      var k = e.alpha;
      var kg = k * 0.04;

      var q = d3.geom.quadtree(nodes),
          i = 0,
          n = nodes.length;

      nodes.forEach(function(a, i) {
        // Apply gravity forces.
        if (i === 0) { return; }
        a.x += (root.px - a.x) * kg;
        a.y += (root.py - a.y) * kg;
      });

      while (++i < n) {
        q.visit(collide(nodes[i]));
      }

      node
        .attr('x', function(d) {
          d.x = Math.max(0, Math.min(w - 60, d.x));
          return d.x;
        })
        .attr('y', function(d) {
          d.y = Math.max(0, Math.min(h - 60, d.y));
          return d.y;
        });
    });

    d3.select('body').on('mousemove', function() {
      var offset = $(selector).offset();
      root.px = d3.event.x + $('body').scrollLeft() - offset.left;
      root.py = d3.event.y + $('body').scrollTop() - offset.top;
      force.start();
    });

    function collide(node) {
      var r = node.radius + 16,
          nx1 = node.x - r,
          nx2 = node.x + r,
          ny1 = node.y - r,
          ny2 = node.y + r;
      return function(quad, x1, y1, x2, y2) {
        if (quad.point && (quad.point !== node)) {
          var x = node.x - quad.point.x,
              y = node.y - quad.point.y,
              l = Math.sqrt(x * x + y * y),
              r = node.radius + quad.point.radius;
          if (l < r) {
            l = (l - r) / l * .5;
            node.x -= x *= l;
            node.y -= y *= l;
            quad.point.x += x;
            quad.point.y += y;
          }
        }
        return x1 > nx2
            || x2 < nx1
            || y1 > ny2
            || y2 < ny1;
      };
    }

    var collideRectangles = function(){
      // http://bl.ocks.org/ilyabo/2585241
      var spaceAround = 0.0;

      nodes.forEach(function(a, i) {
        // Apply gravity forces.
        if (i === 0) { return; }
        a.x += (root.px - a.x) * kg;
        a.y += (root.py - a.y) * kg;

        a.overlapCount = 0;

        nodes.slice(i + 1).forEach(function(b) {
          var dx =  (a.x - b.x);
          var dy =  (a.y - b.y);


          var adx = Math.abs(dx);
          var ady = Math.abs(dy);

          var mdx = (1 + spaceAround) * (a.width + b.width) / 2;
          var mdy = (1 + spaceAround) * (a.height + b.height) / 2;

          if (adx < mdx  &&  ady < mdy) {
            var l = Math.sqrt(dx * dx + dy * dy);

            var lx = (adx - mdx) / l * k;
            var ly = (ady - mdy) / l * k;

            // choose the direction with less overlap
            if (lx > ly  &&  ly > 0) {
              lx = 0;
            }
            else if (ly > lx  &&  lx > 0) {
              ly = 0;
            }

            dx *= lx;
            dy *= ly;
            a.x -= dx;
            a.y -= dy;
            b.x += dx;
            b.y += dy;

            a.overlapCount++;
          }
        });
      });
    };

    return {

    };

  };
}());