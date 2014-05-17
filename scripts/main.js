(function(){
  /* globals d3, _ */
  'use strict';

  window.NewsReadsYou = window.NewsReadsYou || {};

  window.NewsReadsYou.sankey = function(selector, data){
  var margin = {top: 1, right: 1, bottom: 6, left: 1},
      width = 960 - margin.left - margin.right,
      height = 1000 - margin.top - margin.bottom;

    var formatNumber = d3.format(',.0f'),
      format = function(d) { return formatNumber(d); },
      color = d3.scale.category20();

    var svg = d3.select(selector).append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    var sankey = d3.sankey()
      .nodeWidth(30)
      .nodePadding(10)
      .size([width, height]);

    var type_colors = {
      'ads': '#F2C48D',
      'track': '#F25050',
      'social': '#67BFAD',
      'cdn': '#1D3C42'
    };

    var legal_colors = {
      'us': '#F25050',
      'eu': '#F2EC99',
      'de': '#1D3C42'
    };

    var path = sankey.link();

    var nodes = [], node_names = [], links = [], link_names = [];
    var node_index = 0;
    _.each(data.sites, function(e, n) {
      if (node_names.indexOf(n) == -1) {
        //console.log(e);
        nodes.push({'name': e.SiteName + ' (' + e.num + ')',
          'color': e.Color,
          'id': node_index++,
          'url': e.SiteURL
        });
        node_names.push(n);
      }
      var src = node_names.indexOf(n);
      _.each(e.links, function(ni) {
        var netw = data.networks[ni];
        var remoteComp = netw.company_name || 'Others';
        //console.log(netw);
        if (netw.num > 2) {
          if (node_names.indexOf(ni) == -1) {
            //nodes.push({'name': ni, 'color': type_colors[netw.net_type] || '#666'});
            nodes.push({'name': ni, 'color': '#ddd', 'id': node_index++});
            node_names.push(ni);
          }
          if (node_names.indexOf(remoteComp) == -1) {
            nodes.push({'name': remoteComp,
              'color': legal_colors[netw.legal_env] || '#666',
              'id': node_index++,
              'url': netw.company_website_url
              });
            node_names.push(remoteComp);
          }
          var tgt = node_names.indexOf(ni);
          links.push({source: src, target: tgt, value: 1});  
          var tgt2 = node_names.indexOf(remoteComp);
          //var link_name = tgt + '->' + tgt2;
          //if (link_names.indexOf(link_name) == -1) {
            links.push({source: tgt, target: tgt2, value: 1});
          //  link_names.push(link_name);
          //}
          
        }
        
      });

    });

    //console.log(links);
    //return;

    var energy = {'nodes': nodes, 'links': links};

    //console.log(energy);

    sankey
      .nodes(energy.nodes)
      .links(energy.links)
      .layout(32);

    var link = svg.append('g').selectAll('.link')
      .data(energy.links)
    .enter().append('path')
      .attr('class', 'link')
      .attr('d', path)
      .style('stroke-width', function(d) { return Math.max(1, d.dy); })
      .sort(function(a, b) { return b.dy - a.dy; });

    link.append('title')
      .text(function(d) { return d.source.name + ' → ' + d.target.name; });

    var node = svg.append('g').selectAll('.node')
      .data(energy.nodes)
    .enter().append('g')
      .attr('class', 'node')
      .attr('transform', function(d, i) {
        //console.log(i);
        return 'translate(' + d.x + ',' + d.y + ')';
      })
    /*.call(d3.behavior.drag()
      .origin(function(d) { return d; })
      .on('dragstart', function() { this.parentNode.appendChild(this); })
      .on('drag', dragmove))*/;

    node.append('rect')
      .attr('height', function(d) { return d.dy; })
      .attr('width', sankey.nodeWidth())
      .style('fill', function(d) { return d.color = d.color || color(d.name.replace(/ .*/, '')); })
      .style('stroke', function(d) { return '#000'; })
      .on('mouseover', function(d) {
        var seen = [];
        link.filter(function(e) {
            var matching = (d.sourceLinks.indexOf(e) != -1 || d.targetLinks.indexOf(e) != -1);
            //var matching = false;
            d.sourceLinks.forEach(function(x) {
              if (!matching) {
                matching = x.target.sourceLinks.indexOf(e) != -1;
              }
            });
            d.targetLinks.forEach(function(x) {
              if (!matching) {
                matching = x.source.targetLinks.indexOf(e) != -1;
              }
            });
            if (matching) {
              var k = (10000 * e.source.id) + e.target.id;
              if (seen.indexOf(k) != -1) {
                matching = false;
                //console.log(e.source.id, e.target.id);
              }
              seen.push(k);
            }
            return matching;
          })
          .classed('active', true);
      })
      .on('mouseout', function(d) {
        link.classed('active', false);
      })
      .on('click', function(d) {
        if (d.url) {
          window.location.href = d.url;
        }
      })
    .append('title')
      .text(function(d) { return d.name + '\n' + format(d.value); });

    node.append('text')
      .attr('x', -6)
      .attr('y', function(d) { return d.dy / 2; })
      .attr('dy', '.35em')
      .attr('text-anchor', 'end')
      .attr('transform', null)
      .text(function(d) { return d.name; })
    .filter(function(d) { return d.x < width / 2; })
      .attr('x', 6 + sankey.nodeWidth())
      .attr('text-anchor', 'start');

    function dragmove(d) {
      d3.select(this).attr('transform', 'translate(' + d.x + ',' + (d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))) + ')');
      sankey.relayout();
      link.attr('d', path);
    }
  };

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
      destroy: function(){}
    };

  };
}());
