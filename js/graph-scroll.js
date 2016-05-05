function graphScroll() {
  var windowHeight,
      dispatch = d3.dispatch("scroll", "active"),
      sections = d3.select('null'),
      i = NaN,
      sectionPos = [],
      n,
      graph = d3.select('null'),
      isFixed = null,
      isBelow = null,
      container = d3.select('body'),
      containerStart = 0,
      slideOffset = -1,
      belowStart,
      eventId = Math.random()

  function reposition(){
    var i1 = 0
    sectionPos.forEach(function(d, i){
      if (d < pageYOffset - containerStart + 200) i1 = i
    })
    i1 = Math.min(n - 1, i1)
    if (i != i1){
      sections.classed('graph-scroll-active', function(d, i){ return i === i1 })

      dispatch.active(i1)

      i = i1
    }

    var isBelow1 = pageYOffset > (belowStart - 0.3*window.innerHeight);
    if (isBelow != isBelow1){
      isBelow = isBelow1
      graph.classed('graph-scroll-below', isBelow)
      if (isBelow) {
        graph.style("right", null);
      }
    }
    var isFixed1 = !isBelow && pageYOffset > (containerStart - 0.3*window.innerHeight)
    if (isFixed != isFixed1){
      isFixed = isFixed1      
      graph.classed('graph-scroll-fixed', isFixed);
      if (isFixed) {
        graph.style("right", 0.5*(window.innerWidth - 1300) - 14.5  + "px");
      }
    }

    // My additions to move the <ol> of algorithm steps
    var containerTopMovey = pageYOffset - containerStart + 0.8*window.innerHeight;
    
    var moveLeft = slideOffset;
    var moveVelocity = 0.8;

    if (containerTopMovey > 0 && moveVelocity*containerTopMovey < moveLeft) {
      container.style("left", "-" + moveVelocity*containerTopMovey + "px");
      resize();
      graph.style("opacity", Math.min(moveVelocity*containerTopMovey/(0.75*moveLeft), 1));
    } else if (containerTopMovey > 0) {
      graph.style("opacity", 1);
      container.style("left", "-" + moveLeft + "px");
    } else if (containerTopMovey < 0) {
      container.style("left", null);
      graph.style("opacity", 0);
    }

  }

  function resize(){
    sectionPos = []
    var startPos
    sections.each(function(d, i){
      if (!i) startPos = this.getBoundingClientRect().top
      sectionPos.push(this.getBoundingClientRect().top -  startPos) })

    var containerBB = container.node().getBoundingClientRect()
    var graphBB = graph.node().getBoundingClientRect()

    containerStart = containerBB.top + pageYOffset
    belowStart = containerBB.bottom - graphBB.height  + pageYOffset
    if (slideOffset == -1) { 
      slideOffset = container.node().getBoundingClientRect().left - 0.5*(window.innerWidth - 1300);
    }
  }

  function keydown() {
    if (!isFixed) return
    var delta
    switch (d3.event.keyCode) {
      case 39: // right arrow
      if (d3.event.metaKey) return
      case 40: // down arrow
      case 34: // page down
      delta = d3.event.metaKey ? Infinity : 1 ;break
      case 37: // left arrow
      if (d3.event.metaKey) return
      case 38: // up arrow
      case 33: // page up
      delta = d3.event.metaKey ? -Infinity : -1 ;break
      case 32: // space
      delta = d3.event.shiftKey ? -1 : 1
      ;break
      default: return
    }

    var i1 = Math.max(0, Math.min(i + delta, n - 1))
    d3.select(document.documentElement)
        .interrupt()
      .transition()
        .duration(500)
        .tween("scroll", function() {
          var i = d3.interpolateNumber(pageYOffset, sectionPos[i1] + containerStart)
          return function(t) { scrollTo(0, i(t)) }
        })

    d3.event.preventDefault()
  }


  var rv ={}

  rv.container = function(_x){
    if (!_x) return container

    container = _x
    return rv
  }

  rv.graph = function(_x){
    if (!_x) return graph

    graph = _x
    return rv
  }

  rv.eventId = function(_x){
    if (!_x) return eventId

    eventId = _x
    return rv
  }

  rv.sections = function (_x){
    if (!_x) return sections

    sections = _x
    n = sections.size()

    d3.select(window)
        .on('scroll.gscroll'  + eventId, reposition)
        .on('resize.gscroll'  + eventId, resize)
        //.on('keydown.gscroll' + eventId, keydown) Disabled for my purposes
    
    resize()
    d3.timer(function() {
      reposition()
      return true
    })

    return rv
  }

  d3.rebind(rv, dispatch, "on")

  return rv
}