// Responsive function
function makeResponsive() {
    var svgArea = d3.select("body").select("svg");

    // clear svg is not empty
    if (!svgArea.empty()) {
        svgArea.remove();
    }

    var svgWidth = 800;
    var svgHeight = 500;

    var margin = {
        top: 20,
        right: 40,
        bottom: 80,
        left: 100
    };

    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;

    // Create an SVG wrapper, append an SVG group that will hold the chart,
    // and shift the latter by left and top margins.
    var svg = d3
        .select("#scatter")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

    // Append an SVG group
    var chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Initial Params
    var chosenXAxis = "poverty";
    var chosenYAxis = "healthcare";

    // function used for updating x-scale when clicked
    function xScale(data, chosenXAxis) {
        // create scales
        var xLinearScale = d3.scaleLinear()
            .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
                d3.max(data, d => d[chosenXAxis]) * 1.2
            ])
            .range([0, width]);

        return xLinearScale;
    }

    // function used for updating y-scale when clicked
    function yScale(data, chosenYAxis) {
        // create scales
        var yLinearScale = d3.scaleLinear()
            .domain([d3.min(data, d => d[chosenYAxis]) * 0.8,
                d3.max(data, d => d[chosenYAxis]) * 1.2
            ])
            .range([height, 0]);

        return yLinearScale;
    }

    // function used for updating x-axis when clicked
    function renderXAxes(newXScale, xAxis) {
        var bottomAxis = d3.axisBottom(newXScale);
        xAxis.transition()
            .duration(1000)
            .call(bottomAxis);

        return xAxis;
    }

    // function used for updating y axis when clicked
    function renderYAxes(newYScale, yAxis) {
        var leftAxis = d3.axisLeft(newYScale);
        yAxis.transition()
            .duration(1000)
            .call(leftAxis);

        return yAxis;
    }

    // function used to render and update circles when clicked
    function renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis) {
        circlesGroup.transition()
            .duration(1000)
            .attr("cx", d => xLinearScale(d[chosenXAxis]))
            .attr("cy", d => yLinearScale(d[chosenYAxis]));
        return circlesGroup;
    }

    // updating text inside circles
    function renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis) {
        textGroup.transition()
            .duration(1000)
            .attr("x", d => xLinearScale(d[chosenXAxis]))
            .attr("y", d => yLinearScale(d[chosenYAxis]));
        return textGroup;
    }

    // function used for updating circles group with new tooltip
    function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

        if (chosenXAxis === "poverty" && chosenYAxis === "healthcare") {
            var labelX = "Poverty: ";
            var labelY = "Healthcare: ";
        } else if (chosenXAxis === "poverty" && chosenYAxis === "smokes") {
            var labelX = "Poverty: ";
            var labelY = "Smokes: ";
        } else if (chosenXAxis === "poverty" && chosenYAxis === "obesity") {
            var labelX = "Poverty: ";
            var labelY = "Obesity: ";
        } else if (chosenXAxis === "age" && chosenYAxis === "healthcare") {
            var labelX = "Age: ";
            var labelY = "Healthcare: ";
        } else if (chosenXAxis === "age" && chosenYAxis === "smokes") {
            var labelX = "Age: ";
            var labelY = "Smokes: ";
        } else if (chosenXAxis === "age" && chosenYAxis === "obesity") {
            var labelX = "Age: ";
            var labelY = "Obesity: ";
        } else if (chosenXAxis === "income" && chosenYAxis === "healthcare") {
            var labelX = "income: ";
            var labelY = "Healthcare: ";
        } else if (chosenXAxis === "income" && chosenYAxis === "smokes") {
            var labelX = "Income: ";
            var labelY = "Smokes: ";
        } else {
            var labelX = "Income: ";
            var labelY = "Obesity: ";
        }

        var toolTip = d3.tip()
            .attr("class", "tooltip")
            .offset([80, -60])
            .html(function(d) {
                return (`${d.state}<br>${labelX}${d[chosenXAxis]}${labelX === "Age: "?"":"%"}<br>${labelY}${d[chosenYAxis]}%`);
            });

        circlesGroup.call(toolTip);

        circlesGroup.on("mouseover", function(data) {
                toolTip.show(data);
            })
            // onmouseout event
            .on("mouseout", function(data, index) {
                toolTip.hide(data);
            });

        return circlesGroup;
    }

    // Retrieve data from the CSV file and execute everything below
    d3.csv("assets/data/data.csv").then(function(healthData, err) {
        if (err) throw err;

        // parse data
        healthData.forEach(function(data) {
            data.poverty = +data.poverty;
            data.age = +data.age;
            data.income = +data.income;
            data.healthcare = +data.healthcare;
            data.obesity = +data.obesity;
            data.smokes = +data.smokes;
        });

        // xLinearScale function above csv import
        var xLinearScale = xScale(healthData, chosenXAxis);

        // Create y scale function
        var yLinearScale = yScale(healthData, chosenYAxis);

        // Create initial axis functions
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        // append x axis
        var XAxis = chartGroup.append("g")
            .classed("x-axis", true)
            .attr("transform", `translate(0, ${height})`)
            .call(bottomAxis);

        // append y axis
        var YAxis = chartGroup.append("g")
            .classed("y-axis", true)
            .attr("transform", `rotate(-90, ${width})`)
            .call(leftAxis);

        // append initial circles, radius size
        var circlesGroup = chartGroup.selectAll("circle")
            .data(healthData)
            .enter()
            .append("circle")
            .attr("cx", d => xLinearScale(d[chosenXAxis]))
            .attr("cy", d => yLinearScale(d[chosenYAxis]))
            .attr("r", 14)
            .attr("fill", "light blue")
            .attr("class", "stateCircle");

        // append text in circles
        var textGroup = chartGroup.selectAll("div")
            .data(healthData)
            .enter()
            .append("text")
            .text(function(d) { return d.abbr; })
            .attr("x", d => xLinearScale(d[chosenXAxis]))
            .attr("y", d => yLinearScale(d[chosenYAxis]))
            .attr("dy", "0.3em")
            .attr("class", "stateText")
            .attr("Font-size", "12px");

        // Create group for 3 x-axis labels
        var xlabelsGroup = chartGroup.append("g")
            .attr("transform", `translate(${width / 2}, ${height + 20})`);

        var povertyLabel = xlabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("value", "poverty")
            .classed("active", true)
            .text("In Poverty (%)");

        var ageLabel = xlabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 40)
            .attr("value", "age")
            .classed("inactive", true)
            .text("Age (Median)");

        var incLabel = xlabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 59)
            .attr("value", "age")
            .classed("inactive", true)
            .text("Household Income (Median)");

        // Create group for  3 y-axis labels
        var ylabelsGroup = chartGroup.append("g")
            .attr("transform", `translate(-90, ${height / 2})`);

        var obesityLabel = ylabelsGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", 0)
            .attr("y", 2)
            .attr("value", "obesity")
            .classed("inactive", true)
            .text("Obese (%)");

        var smokesLabel = ylabelsGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", 0)
            .attr("y", 22)
            .attr("value", "smokes")
            .classed("inactive", true)
            .text("Smokes (%)");

        var healthLabel = ylabelsGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", 0)
            .attr("y", 40)
            .attr("value", "smokes")
            .classed("active", true)
            .text("Lacks Healthcare (%)");

        // updateToolTip to active circles
        var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // x axis labels event listener
        xlabelsGroup.selectAll("text")
            .on("click", function() {
                // get value of selection
                var value = d3.select(this).attr("value");
                if (value !== chosenXAxis) {

                    // replaces chosenXAxis with value
                    chosenXAxis = value;

                    // console.log(chosenXAxis)
                    // updates x scale for new data
                    xLinearScale = xScale(healthData, chosenXAxis);

                    // updates x axis with transition
                    xAxis = renderXAxes(xLinearScale, xAxis);

                    // updates circles with new x values
                    circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                    textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                    // updates tooltips with new info
                    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                    // changes classes to change bold text
                    if (chosenXAxis === "poverty") {
                        povertyLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        ageLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        incLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    } else if (chosenXAxis === "age") {
                        povertyLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        ageLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        incLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    } else {
                        povertyLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        ageLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        incLabel
                            .classed("active", true)
                            .classed("inactive", false);
                    }
                }
            });

        // y axis labels event listener
        yLabelsGroup.selectAll("text")
            .on("click", function() {
                // get value of selection
                var value = d3.select(this).attr("value");
                if (value !== chosenYAxis) {

                    // replaces chosenYAxis with value
                    chosenYAxis = value;

                    // console.log(choseYAxis)
                    // updates y scale for new data
                    yLinearScale = yScale(healthData, chosenYAxis);

                    // updates y axis with transition
                    yAxis = renderYAxes(yLinearScale, yAxis);

                    // updates circles with new y values
                    circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                    textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                    // updates tooltips with new info
                    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                    // changes classes to change bold text
                    if (chosenYAxis === "healthcare") {
                        healthLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        smokesLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        obesityLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    } else if (chosenXAxis === "smokes") {
                        healthLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        smokesLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        obesityLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    } else {
                        healthLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        smokesLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        obesityLabel
                            .classed("active", true)
                            .classed("inactive", false);
                    }
                }
            });
    }).catch(function(error) {
        console.log(error);
    });
}
// When browser loads, makeResponsive() is called
makeResponsive();

// When browser window is resized, makeResponsive() is called
d3.select(window).on("resize", makeResponsive);