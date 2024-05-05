const url = "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json";

let kickstaterData;

//Selecting the colors to use 
const colors = [
    '#1f77b4',
    '#aec7e8',
    '#ff7f0e',
    '#ffbb78',
    '#2ca02c',
    '#98df8a',
    '#d62728',
    '#ff9896',
    '#9467bd',
    '#c5b0d5',
    '#8c564b',
    '#c49c94',
    '#e377c2',
    '#f7b6d2',
    '#7f7f7f',
    '#c7c7c7',
    '#bcbd22',
    '#dbdb8d',
    '#17becf'
]

const canvas = d3.select("#canvas");
const tooltip = d3.select("#tooltip");

//Creating the treemap diagram
const drawMap = () => {
    //scaleOrdinal is used to map data values to colors
    const colorScale = d3.scaleOrdinal()
        .domain(kickstaterData.children.map((d) => d.name)) //Extracting the names of the children data
        .range(colors);

    //Creating a hierarchy using kickstarterData as the roos node and a function to specify how to acces the children of each node
    const hierarchy = d3.hierarchy(kickstaterData, (node) => node.children)
        .sum((node) => node.value) //Using the value property of each node to calculate the size of the tiles
        .sort((node1, node2) => node2.value - node1.value); //Sorting the nodes in descending order based on their values

    //Initializing the treemap layout and setting its size
    const createTreeMap = d3.treemap()
        .size([1000, 600]);

    //Applying the treemap layout to the hierarchy
    createTreeMap(hierarchy);

    //Extracting the leaf nodes of the hierarchy, each one represent the individual tiles in the treemap
    const kickstarterTiles = hierarchy.leaves();

    const block = canvas.selectAll("g")
        .data(kickstarterTiles)
        .enter()
        .append("g")
        .attr("transform", (d) => "translate(" + d.x0 + ", " + d.y0 + ")")
        .on("mouseover", (event, d) => {
            tooltip.transition()
                .attr("data-value", d.value)
                .duration(200)
                .style("opacity", 0.9);
            tooltip.html(`Name: ${d.data.name}<br>Category: ${d.data.category}<br>Value: ${d.value}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", () => {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        })

    block
        .append("rect")
        .attr("id", (d) => d.data.id)
        .attr("class", "tile")
        .attr("width", (d) => d.x1 - d.x0)
        .attr("height", (d) => d.y1 - d.y0)
        .attr("data-name", (d) => d.data.name)
        .attr("data-category", (d) => d.data.category)
        .attr("data-value", (d) => d.value)
        .attr("fill", (d) => colorScale(d.data.category))
    
    block
        .append("text")
        .attr("class", "tile-text")
        .selectAll("tspan")
        .data((d) => {
            //Splitting the text into words based on first uppercase letter of each word
            return d.data.name.split(/(?=[A-Z][^A-Z])/g);
        })
        .enter()
        .append("tspan")
        .attr("x", 4)
        .attr("y", (d, i) => 13 + i * 10)
        .text((d) => d)
};

const legend = d3.select("#legend");

//Creating the legend
const createLegend = () => {
    const legendWidth = 23;
    const legendHeight = 23;
    const legendX = 50;
    const legendY = 650; 
    const padding = 75;
    const paddingLeft = 40;
    const itemsPerRow = 10;

    legend
        .append("g")
        .attr("transform", "translate(" + legendX + ", " + legendY + ")")

    //Adding color rectangles to the element
    legend
        .selectAll("rect")
        .data(colors)
        .enter()
        .append("rect")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => {
            //Placing the elements in two rows
            const row = Math.floor(i / itemsPerRow);
            const col = i % itemsPerRow;
            return "translate(" + (paddingLeft + col * (legendWidth + padding)) + ", " + (row * legendHeight) * 2.5 + ")";
        })
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .attr("fill", (d) => d);
    
    const legendTextData = kickstaterData.children.map((d) => d.name);

    //Adding text labels for identifying the colors
    legend
        .selectAll(".legend-item-text")
        .data(legendTextData)
        .enter()
        .append("text")
        .attr("class", "legend-item-text")
        .attr("x", (d, i) => {
            //Placing the text of the elements in two rows
            const col = i % itemsPerRow;
            return (paddingLeft + col * (legendWidth + padding)) + legendWidth / 2;
        })
        .attr("y", (d, i) => legendHeight + 15 + (Math.floor(i / itemsPerRow) * legendHeight) * 2.5)
        .text((d) => d)
        .style("font-size", "12px")
        .style("text-anchor", "middle")
};

//Fetching JSON data
d3.json(url)
    .then((data) => {
        kickstaterData = data,
        drawMap(),
        createLegend();
    })
    .catch((error) => {
        console.error("Error fetching data:", error);
    });