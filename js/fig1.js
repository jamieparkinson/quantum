var h_stack = 90; // SVG canvas size
var w_stack = 580;
var y_origin = 40; // What we will use as the origin for the y-axis

var w_tip = 35; // Tooltip dimensions
var h_tip = 17;

var n_circs = Math.pow(2, n_bits); // N
var circ_dat = new Array(n_circs).fill(0);
var chosen = -1; // Haven't picked a circle yet
var circ_r = 13;

// Helper for drawing straight lines
function myLine(svgHandle, startCoord, endCoord) {
  svgHandle.append("line").style("stroke", "gray")
    .attr("x1", startCoord[0]).attr("y1", startCoord[1])
    .attr("x2", endCoord[0]).attr("y2", endCoord[1])
    .attr("opacity", 0.25);
}

// Helper for translating groups
function gpos(x, y) {
  return "translate(" + x + "," + y + ")";
}

// Create canvas
var svg = d3.select("#fig1").attr("width", w_stack).attr("height", h_stack);

// Draw some "axis" lines 
myLine(svg, [0.5, y_origin], [w_stack - 0.5, y_origin]);
myLine(svg, [0.5, y_origin + 4], [0.5, y_origin - 4]);
myLine(svg, [w_stack - 0.5, y_origin + 4], [w_stack - 0.5, y_origin - 4]);

/// Create our 3 main components: the circes, their text, and the tooltip
var circs = svg.append("g").attr("id", "circs").selectAll("circle").data(circ_dat).enter().append("circle");
var labels = svg.append("g").attr("id", "circ-labels").selectAll("text")
                .data(circ_dat).enter().append("text").attr("class", "circ-label");
var tooltip = svg.append("g").attr("id", "tooltip")
                .style("opacity", 0)
                .attr("transform", gpos(-w_tip - 1, y_origin + h_tip));
tooltip.append("rect")
        .attr("width", w_tip)
        .attr("height", h_tip)
        .attr("rx", 3)
        .attr("ry", 3)
        .style("fill", "lightgrey")
tooltip.append("text")
        .text("000")
        .attr("text-anchor", "middle")
        .attr("x", (w_tip / 2.0) - 0.5)
        .attr("y", h_tip - 4);

// Given a base-10 number, returns a string of the binary representation
function dec2bin(dec) {
  var bitstring = "";
  var pad = new Array(n_bits).fill(0).join('');
  while (dec > 0) {
    var bit = dec % 2;
    var quot = Math.floor(dec / 2);
    bitstring = bit.toString() + bitstring;
    dec = quot;
  }
  return pad.substring(0, n_bits - bitstring.length) + bitstring;
}

// Calculates the coordinate of the centre of a circle (evenly spaced)
function circX(i) {
  var spacing = (w_stack - 3*circ_r) / (n_circs - 1);
  return i*spacing + 1.5*circ_r;
}

// Set up circles
circs.attr("cx", function(val, i) { return circX(i); })
  .attr("cy", y_origin)
  .attr("r", circ_r)
  .attr("fill", "black")
  .attr("opacity", 0.85)
  .on("mouseover", function(val, i) {
    d3.select(this)
      .transition()
      .duration(100)
      .attr("cy", y_origin - 8) // Move up
      .attr("r", circ_r + 3); // Grow slightly
    d3.select(labels[0][i])
      .transition()
      .duration(100)
      .attr("y", y_origin - 3); // Move label as well

    d3.select("#tooltip text").html(dec2bin(i)); // Change tooltip text to binary representation of this bit
  
    d3.select("#tooltip")
      .attr("transform", gpos(circX(i) - 0.5*w_tip, y_origin + h_tip)) // Move tooltip
      .transition()
      .duration(100)
      .style("opacity", 1); // Show tooltip
  })
  .on("mouseout", function(val, i) { // Note that these transitions are slower than their inverse (mouseover)
    d3.select(this)
      .transition()
      .duration(200)
      .attr("cy", y_origin) // Move back down
      .attr("r", function() { return i == chosen ? circ_r + 3 : circ_r; }); // Return to original size
    d3.select(labels[0][i])
      .transition()
      .duration(200)
      .attr("y", y_origin + 5); // Move back down

    d3.select("#tooltip")
      .transition()
      .duration(200)
      .style("opacity", 0); // Hide tooltip again
  })
  .on("click", function(val, i) { // Make the clicked circle grey
    chosen = i;
    d3.select(".chosen-circ") // Un-grey any previously clicked circle
      .transition()
      .duration(100)
      .attr("class", "")
      .style("fill", "black")
      .attr("r", circ_r);
    d3.select(this)
      .transition()
      .duration(100)
      .attr("class", "chosen-circ")
      .style("fill", "gray");
  });

labels.text(function(val, i) { return i; }) // Put the labels in the right place
  .attr("text-anchor", "middle")
  .attr("x", function(val, i) { return circX(i); })
  .attr("y", y_origin + 4);