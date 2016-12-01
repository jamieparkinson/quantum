var h_stack = 90; // SVG canvas size
var w_stack = 580;
var y_origin = 44; // What we will use as the origin for the y-axis

var w_tip = 35; // Tooltip dimensions
var h_tip = 17;

var needle_idx = 7; // Default

var n_circs = Math.pow(2, n_bits); // N
var circ_dat = new Array(n_circs).fill(0);
var circ_r = 13;

// Helper for translating groups
function gpos(x, y) {
  return "translate(" + x + "," + y + ")";
}

// Create canvas
var svg = d3.select("#fig1").attr("width", w_stack).attr("height", h_stack);

drawMyAxis(w_stack, y_origin, svg, 4);
d3.select("#fig1 > #axis").selectAll("line").style("opacity", 0.25).style("stroke", "gray");

/// Create our 3 main components: the circes, their text, and the tooltip
var circs = svg.append("g").attr("id", "circs").selectAll("circle").data(circ_dat).enter().append("circle");
var labels = svg.append("g").attr("id", "circ-labels").selectAll("text")
                .data(circ_dat).enter().append("text").attr("class", "circ-label");
var tooltip = svg.append("g").attr("id", "tooltip")
                .style("opacity", 0)
                .attr("transform", gpos(-w_tip - 1, 0));
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
  .attr("r", function(val, i) { return (i != needle_idx) ? circ_r : (circ_r + 3); })
  .attr("fill", function(val, i) { return (i != needle_idx) ? "black" : "gray"; })
  .classed("chosen-circ", function(val, i) { return i == needle_idx; })
  .attr("opacity", 0.85)
  .on("mouseover", function(val, i) {
    d3.select(this)
      .transition()
      .duration(100)
      .attr("cy", y_origin - 5) // Move up
      .attr("r", circ_r + 3); // Grow slightly
    d3.select(labels[0][i])
      .transition()
      .duration(100)
      .attr("y", y_origin); // Move label as well

    d3.select("#tooltip text").html(dec2bin(i)); // Change tooltip text to binary representation of this bit
  
    d3.select("#tooltip")
      .attr("transform", gpos(circX(i) - 0.5*w_tip, 0)) // Move tooltip
      .transition()
      .duration(100)
      .style("opacity", 1); // Show tooltip
  })
  .on("mouseout", function(val, i) { // Note that these transitions are slower than their inverse (mouseover)
    d3.select(this)
      .transition()
      .duration(200)
      .attr("cy", y_origin) // Move back down
      .attr("r", function() { return i == needle_idx ? circ_r + 3 : circ_r; }); // Return to original size
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
    if (last_step <=2) {
      needle_idx = i;
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
    } else {
      d3.select(this)
        .transition("err")
        .duration(100)
        .style("fill", "red")
        .transition("err")
        .delay(200)
        .duration(250)
        .style("fill", "black");
    }
  });

labels.text(function(val, i) { return i; }) // Put the labels in the right place
  .attr("text-anchor", "middle")
  .attr("x", function(val, i) { return circX(i); })
  .attr("y", y_origin + 4);