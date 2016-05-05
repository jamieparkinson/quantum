var h_algplot = 200; // SVG canvas size
var w_algplot = 580;
var origin_algplot = h_algplot / 2.0; // x-axis position

var noiseOn = true; // Whether to include noise
var noiseSigma = 0.02; // Strength of noise

var n_bars = Math.pow(2, n_bits);

var last_step = 0; // Which step was last performed
var val_R = 0; // How many grover iterations have been performed

var bar_heights = new Array(n_bars).fill(1.0 / Math.sqrt(n_bars)); // Initialize bars to equal superposition;


// Create a scale for taking amplitudes to graphable values
var bar_scale = d3.scale.linear()
                  .domain([-1.0, 1.0])
                  .range([-100, 100]);

var bar_padding = 12; // Padding between bars
var rect_width = (w_algplot / n_bars) - bar_padding; // Caulculate width of each bar

var noise = function() { return noiseOn ? d3.random.normal(0.0, noiseSigma)() : 0 }; // Noise function gives normally distributed noise if turned on
bar_heights = bar_heights.map(function(clean) { return clean + noise(); }); // Apply noise to the amplitudes

var svg = d3.select("svg#fig2").attr("width", w_algplot).attr("height", h_algplot); // Create SVG object
drawMyAxis(w_algplot, origin_algplot, svg, 5); // Draw x-axis
d3.select("#fig2 > #axis").selectAll("line").style("opacity", 0.65).style("stroke", "gray");

// Reset button
svg.append("image").attr("id", "resetBtn")
                   .attr("width", 25)
                   .attr("height", 25)
                   .attr("x", w_algplot - 30)
                   .attr("y", h_algplot - 30)
                   .attr("xlink:href", "replay.svg")
                   .attr("opacity",0.3)
                   .on("mouseover", function() {
                      d3.select(this).attr("opacity", 0.6);
                   })
                   .on("mouseout", function() {
                      d3.select(this).attr("opacity", 0.3);
                   })
                   .on("click", function() { reset(); });

var rects = svg.append("g").attr("id", "rects") // Add the bars (but don't draw them)
                .selectAll("rect")
                .data(bar_heights)
                .enter()
                .append("rect");

rects.attr("width", rect_width) // "Draw" bars but with zero height now
     .each(function(h) { d3.select(this).attr(makeBar(0)); })
     .attr("x", bar_padding / 2.0)
     .classed("graph-rect", true); 

graphScroll().graph(d3.select("#fig2-container"))
             .container(d3.select("#steps-container"))
             .sections(d3.selectAll("#steps-list > li"));

function reset() {
  bar_heights = new Array(n_bars).fill(1.0 / Math.sqrt(n_bars)); // Initialize bars to equal superposition;
  bar_heights = bar_heights.map(function(clean) { return clean + noise(); }); // Apply noise to the amplitudes
  rects.data(bar_heights);
  rects.each(function(h) { d3.select(this).attr(makeBar(0)); })
       .attr("x", bar_padding / 2.0)
       .classed({"graph-rect" : true,
               "needle-rect" : function(h,i) { return (i == needle_idx); } }) // Add a class to the needle bar
       .style("fill", "black");

  last_step = 0;
  val_R = 0;

  d3.selectAll(".info-div").style("opacity", 0);
  oracleDot.attr("cx", -1.5*r_dot);
}

/* Helper function for dealing with negative values
 *
 * SVG uses the top left corner of rectangles and doesn't allow negative heights.
 * So, we use |height| but set the y coordinate to either 0 or the "usual" value depending
 * on whether the height is negative or positive, respectively.
 *
*/
function makeBar(h) {
  return {
    "y" : origin_algplot - ((h < 0) ? bar_scale(0) : Math.abs(bar_scale(h))),
    "height" : Math.abs(bar_scale(h))
  };
}

// Gets probability of measuring the needle to 2 dp
function probMeasure() {
  return Math.min(1.00, Math.pow(bar_heights[needle_idx], 2).toFixed(2));
}

// Pulses the play button with given ID red 
function errPulse(btnID) {
  d3.select(btnID)
    .transition("err")
    .duration(100)
    .style("color", "red")
    .transition("err")
    .delay(200)
    .duration(250)
    .style("color", "black");
}

// First step of the algorithm: \ket{0}^{\otimes n}
function doGroundState() {
  if (last_step == 0) {
    rects.each(function (h) {
      d3.select(this)
        .transition("groundstate")
        .duration(400)
        .ease("quad")
        .attr(makeBar(h)); // Give the bars height
    });
    last_step = 1;
  } else {
    errPulse("#groundStateBtn");
  }
}

// Second step of the algorithm: equal superposition (I know I said I already did that, but now we can see it)
function doHadamard() {
  if (last_step == 1) {
    rects.transition("hadamard")
         .duration(350)
         .ease("quad")
         .attr("x", function(h, i) { // Space the bars out correctly
            return i * (w_algplot / n_bars) + 0.5*bar_padding;
         });

    d3.select("#prob-val").html(probMeasure()) // Update the probability
    d3.select("#prob-div").transition()
                          .duration(150)
                          .style("opacity", 1);

    last_step = 2;
  } else {
    errPulse("#hadamardBtn");
  }
}

// Draw a red dot to symbolize the action of the oracle
var r_dot = 3;
var oracleDot = svg.append("circle")
                   .attr("cx", -1.5*r_dot)
                   .attr("cy", origin_algplot)
                   .attr("r", r_dot)
                   .style("fill", "red");

// First part of grover iteration: flip the phase of the needle
function doOracle() {
  if (last_step == 2 || last_step == 4) {
    var totalTime = 1300; // How long the oracle pass takes
    var scaleFactor = 1.35; // How big to make the needle when we pulse it

    // Show the div with the value of R
    if (val_R == 0) {
      console.log("here");
      d3.select("#R-val").html(0);
      d3.select("#R-div")
        .transition()
        .duration(150)
        .style("opacity", 1);
    }

    var dotOffset = 0.5 * w_algplot / n_bars // Starting position of the dot
    oracleDot.attr("cx", dotOffset);
    oracleDot.transition() // Move the dot
             .duration(totalTime)
             .ease("sin-in-out")
             .attr("cx", w_algplot + r_dot);

    rects.classed("needle-rect", function(h,i) { return (i == needle_idx); }); // Update needle class

    rects.transition("oracle") // This gets complex. Flash along the bars.
         .duration(totalTime / n_bars)
         .delay(function(h,i) { // Stagger flashes
            var easy = d3.ease("sin-out-in"); // Take the easing function, don't fully understand why it needs to be out-in rather than in-out
            return easy(i / (n_bars - 1)) * totalTime;
         })
         .style("fill", "gray") // The flash colour
         .each("start", function(h) { // Called at the start of each flash
            thisRec = d3.select(this);
            thisNoise = 0.75*noise(); // Oracle-induced noise is weaker, I've decided

            thisRec.transition() // Draw the effect of the noise
                   .duration(100)
                   .attr(makeBar(h + thisNoise));

            thisRec.datum(h + thisNoise); // Update the internal data

            if (thisRec.attr("class").indexOf("needle-rect") == -1) { // If it's not the needle then unflash it
              thisRec
              .transition()
              .delay(120)
              .duration(200)
              .style("fill", "black");
            } else { // If it is the needle...
              thisRec
              .transition("pulse") // Pulse it (inflation phase)
                .duration(250)
                .ease("exp")
                .attr("width", scaleFactor*rect_width)
                .attr("x", needle_idx * (w_algplot / n_bars) + 0.5*bar_padding + 0.5*rect_width*(1 - scaleFactor))
                .attr(makeBar(scaleFactor*(h + thisNoise)))
              .transition("pulse")
                .ease("linear") // Pulse it (relaxation phase)
                .delay(250 + 20)
                .duration(250)
                .attr("width", rect_width)
                .attr("x", needle_idx * (w_algplot / n_bars) + 0.5*bar_padding)
                .attr(makeBar(h + thisNoise))
              .transition("flip") // Flip it down to 0
                .delay(250 + 20 + 250 + 300)
                .duration(300)
                .ease("cubic-in")
                .attr(makeBar(0))
                .transition() // And then past zero
                .duration(300)
                .ease("cubic-out")
                .attr(makeBar(-(h + thisNoise)));

              bar_heights[needle_idx] *= -1; // Update internal data re flip
              rects.data(bar_heights);
            }
         });
    last_step = 3;
  } else {
    errPulse("#oracleBtn");
  }
}

// Second part of Grover iteration: inversion about the mean
function doMean() {
  if (last_step == 3) {
    var mean_height = d3.mean(bar_heights); // Calculate mean amplitude
    var mean_y = makeBar(mean_height)["y"]; // And mean coordinate
    var meanLine = myLine(svg, [-1, mean_y], [-1, mean_y]); // Start off the mean marking line
    meanLine.attr("class", "mean-line");

    meanLine.transition("meanline") // Draw the line across the graph
      .duration(750)
      .ease("quad")
      .attr("x2", w_algplot + 1);

    bar_heights = bar_heights.map(function(old) { // Perform the actual inversion about the mean
      return 2*mean_height - old;
    });
    rects.data(bar_heights); // Update internal data

    rects.transition("meanInversion") // Draw the inversion
         .duration(1200)
         .delay(750 + 300)
         .attr("y", function(h) { return makeBar(h)["y"]; })
         .attr("height", function(h) { return makeBar(h)["height"]; });

    val_R++;
    setTimeout(function(){ d3.select("#prob-val").html(probMeasure()); }, 750+300+1200); // Update the measurement probability
    setTimeout(function(){ d3.select("#R-val").html(val_R); }, 750+300+1200); // Update number of iterations

    meanLine.transition("disappearLine") // Remove the mean marker
      .duration(750)
      .delay(750 + 300 + 1200 + 200)
      .ease("quad")
      .attr("x1", w_algplot + 1);

    last_step = 4;
  } else {
    errPulse("#meanBtn");
  }
}