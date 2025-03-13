// Load the data
const socialMedia = d3.csv("socialMedia.csv");

// Once the data is loaded, proceed with plotting
socialMedia.then(function(data) {

    // Convert string values to numbers
    data.forEach(function(d) {
        d.Likes = +d.Likes;
    });

    // Define the dimensions and margins for the SVG
    const margin = {top: 50, right: 10, bottom: 50, left: 75},
        width = 700 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // Create the SVG container
    const svg = d3.select("#boxplot")
        .append("svg" )
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append ("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Set up scales for x and y axes
    // You can use the range 0 to 1000 for the number of Likes, or if you want, you can use
    // d3.min(data, d => d.Likes) to achieve the min value and
    // d3.max(data, d => d.Likes) to achieve the max value
    // For the domain of the xscale, you can list all four platforms or use
    // [...new Set(data.map(d => d.Platform))] to achieve a unique list of the platform

    // Add scales
    const xScale = d3.scaleBand()
        .domain([...new Set(data.map (d => d.Platform))])
        .range([0, width])
        .padding (0.5);

    const yScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.Likes), d3.max(data, d => d. Likes)])
        .nice()
        .range([height, 0]);

    // Add x-axis label
    const xAxis = d3.axisBottom(xScale);

    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis);

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .style("text-anchor", "middle")
        .text("Platform");

    // Add y-axis label
    const yAxis = d3.axisLeft(yScale);

    svg.append("g")
        .call(yAxis);

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 10)
        .attr("x", -height / 2)
        .style("text-anchor", "middle")
        .text("Likes");


    const rollupFunction = function(groupData) {
        const values = groupData.map(d => d.Likes).sort(d3.ascending);
        const min = d3.min(values); 
        const q1 = d3.quantile(values, 0.25);
        const median = d3.quantile(values, 0.50);
        const q3 = d3.quantile(values, 0.75);
        return {min, q1, median, q3};
    };

    // group data by Platform and calculate the quantiles using the rollupFunction
    const quantilesByGroups = d3.rollup(data, rollupFunction, d => d.Platform);

    // iterate over each Platform and its corresponding calculated quantiles
    quantilesByGroups.forEach((quantiles, Platform) => {
        
        // use xScale to determine the coordinate for x and the box width
        const x = xScale(Platform);
        const boxWidth = xScale.bandwidth();

        // Draw vertical lines
        svg.append("line")
            .attr("x1", x + boxWidth / 2)  
            .attr("x2", x + boxWidth / 2)  
            .attr("y1", yScale(quantiles.min))  
            .attr("y2", yScale(quantiles.max)) 
            .attr("stroke", "black")         
            .attr("stroke-width", 1);               

        // Draw box
        svg.append("rect")
            .attr("x", x)                     
            .attr("y", yScale(quantiles.q3))   
            .attr("width", boxWidth)            
            .attr("height", yScale(quantiles.q1) - yScale(quantiles.q3))
            .attr("fill", "lightblue")         
            .attr("stroke", "black")            
            .attr("stroke-width", 1);  

        // Draw median line
        svg.append("line")
            .attr("x1", x)                      
            .attr("x2", x + boxWidth)           
            .attr("y1", yScale(quantiles.median)) 
            .attr("y2", yScale(quantiles.median))
            .attr("stroke", "red")              
            .attr("stroke-width", 2);   
    });
});

// Prepare you data and load the data again.
// This data should contains three columns, platform, post type and average number of likes.
const socialMediaAvg = d3.csv("socialMediaAvg.csv");

socialMediaAvg.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.AvgLikes = +d.AvgLikes;
    });

    // Define the dimensions and margins for the SVG
    const margin = {top: 50, right: 10, bottom: 50, left: 75},
        width = 700 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // Create the SVG container
    const svg = d3.select("#barplot")
        .append("svg" )
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append ("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Define four scales
    // Scale x0 is for the platform, which divide the whole scale into 4 parts
    const x0 = d3.scaleBand()
        .domain([...new Set(data.map(d => d.Platform))])
        .range([0, width])
        .padding(0.2);

    // Scale x1 is for the post type, which divide each bandwidth of the previous x0 scale into three part for each post type
    const x1 = d3.scaleBand()
        .domain([...new Set(data.map(d => d.PostType))])
        .range([0, x0.bandwidth()])
        .padding(0.05);

    // Recommend to add more spaces for the y scale for the legend
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.AvgLikes)])
        .nice()
        .range([height, 0]);

    // Also need a color scale for the post type
    const color = d3.scaleOrdinal()
        .domain([...new Set(data.map(d => d.PostType))])
        .range(["#1B9AAA", "#EF476F", "#FFC43D"]);

    // Add scales x0 and y
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x0));

    svg.append("g")
        .call(d3.axisLeft(y));

    // Add x-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .style("text-anchor", "middle")
        .text("Platform");

    // Add y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 10)
        .attr("x", -height / 2)
        .style("text-anchor", "middle")
        .text("Average Likes");


  // Group container for bars
    const barGroups = svg.selectAll(".bar-group")
      .data(d3.groups(data, d => d.Platform))
      .enter()
      .append("g")
      .attr("class", "bar-group")
      .attr("transform", d => `translate(${x0(d[0])},0)`);

  // Draw bars
    barGroups.selectAll("rect")
        .data(d => d[1])
        .enter()
        .append("rect")
        .attr("x", d => x1(d.PostType))
        .attr("y", d => y(d.AvgLikes))
        .attr("width", x1.bandwidth())
        .attr("height", d => height - y(d.AvgLikes))
        .attr("fill", d => color(d.PostType));


    // Add the legend
    const legend = svg.append("g")
      .attr("transform", `translate(${width - 100}, ${margin.top-100})`);

    const types = [...new Set(data.map(d => d.PostType))];

    types.forEach((type, i) => {
        legend.append("rect")
            .attr("x", 0)
            .attr("y", i * 20)
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", color(type));
        legend.append("text")
            .attr("x", 20)
            .attr("y", i * 20 + 12)
            .text(type)
            .attr("alignment-baseline", "middle");
  });

});

// Prepare you data and load the data again.
// This data should contains two columns, date (3/1-3/7) and average number of likes.

const socialMediaTime = d3.csv("socialMediaTime.csv");

socialMediaTime.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.Date = new Date(d.Date);
        d.AvgLikes = +d.AvgLikes;
    });

    // Define the dimensions and margins for the SVG
    const margin = {top: 50, right: 10, bottom: 50, left: 75},
        width = 700 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // Create the SVG container
    const svg = d3.select("#lineplot")
        .append("svg" )
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append ("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Set up scales for x and y axes
    const xScaleTime = d3.scaleTime()
        .domain(d3.extent(data, d => d.Date))
        .range([0, width]);

    const yScaleTime = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.AvgLikes)])
        .nice()
        .range([height, 0]);


    // Draw the axis, you can rotate the text in the x-axis here
    const xAxisTime = d3.axisBottom(xScaleTime)
        .ticks(d3.timeDay.every(1))  // Use one tick per day
        .tickFormat(d3.timeFormat("%m/%d/%Y"));

    svg.append("g")
        .call(xAxisTime)
        .attr("transform", `translate(0,${height})`)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("transform", "rotate(-15)");

    const yAxisTime = d3.axisLeft(yScaleTime);

    svg.append("g")
        .call(yAxisTime);

    // Add x-axis label
     svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .style("text-anchor", "middle")
        .text("Date");

    // Add y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 10)
        .attr("x", -height / 2)
        .style("text-anchor", "middle")
        .text("Average Likes");

    // Draw the line and path. Remember to use curveNatural.
    const line = d3.line()
        .x(d => xScaleTime(d.Date))
        .y(d => yScaleTime(d.AvgLikes))
        .curve(d3.curveNatural);

    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#177E89")
        .attr("stroke-width", 2.5)
        .attr("d", line);
});
