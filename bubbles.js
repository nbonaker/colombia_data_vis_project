export class BubbleChart {
    constructor(svg_id, width, height) {
        // set the dimensions and margins of the graph
        this.width = width
        this.height = height

// append the svg object to the body of the page
        this.svg = d3.select(svg_id)
            .append("svg")
            .attr("width", this.width)
            .attr("height", this.height)

        let sectors = ["Severe Insecurity", "Moderate Insecurity",  "Marginal Security", "Secure"]

        let xScale = d3
            .scaleBand()
            .domain(sectors)
            .range([0, this.width]);
        var x_axis = d3.axisBottom()
            .scale(xScale);
        var xAxisTranslate = this.height-100;
        this.svg.append("g")
            .attr("transform", "translate(0, " + xAxisTranslate  +")")
            .call(x_axis)

    }
    initialize_nodes(data) {
    // A scale that gives a X target position for each group
        var x_centers = d3.scaleOrdinal()
            .domain([4, 3, 2, 1])
            .range([this.width/10, this.width*3.5/10, this.width*6.5/10, this.width*9/10])

    // A color scale
        var color_cari = d3.scaleOrdinal()
            .domain([4, 3, 2, 1])
            .range(["#910b00", "#ff1200", "#24c6f3", "#0443a6"])

        let householdSize = d3.extent(data.map((d) => +d["size"]));
        let size = d3.scaleSqrt().domain(householdSize).range([3, 15]);

        var bubble_stroke_width = 1.5

        function radius_size(d){
            return Math.max(5, Math.sqrt(d.size)*4)
        }

        // Initialize the circle: located at the center of each group area
        var node = this.svg.append("g")
            .selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("r", (d) => size(d["size"]))
            .attr("cx", this.width / 2)
            .attr("cy", this.height / 2)
            .style("fill", function (d) {
                    return color_cari(d.group)
            })
            .style("fill-opacity", 0.8)
            .attr("stroke", "black")
            .style("stroke-width", bubble_stroke_width)
        // .call(d3.drag() // call specific function when circle is dragged
        //     .on("start", dragstarted)
        //     .on("drag", dragged)
        //     .on("end", dragended));

// Features of the forces applied to the nodes:
        this.simulation = d3.forceSimulation()
            .force("x", d3.forceX().strength(0.15).x(function (d) {
                return x_centers(d.group)
            }.bind(this)))
            .force("y", d3.forceY().strength(0.1).y(function (d) {
                    return this.height / 2

            }.bind(this)))
            // .force("center", d3.forceCenter().x(this.width / 2).y(this.height / 2)) // Attraction to the center of the svg area
            .force("charge", d3.forceManyBody().strength(0.5)) // Nodes are attracted one each other of value is > 0
            .force("collide", d3.forceCollide().strength(0.5).radius(function (d){
                return size(d["size"]) + bubble_stroke_width/2;
            }).iterations(2)) // Force that avoids circle overlapping

// Apply these forces to the nodes and update their positions.
// Once the force algorithm is happy with positions ('alpha' value is low enough), simulations will stop.
        this.simulation
            .nodes(data)
            .on("tick", function (d) {
                node
                    .attr("cx", function (d) {
                        return d.x;
                    })
                    .attr("cy", function (d) {
                        return d.y;
                    })
            });

        function dragstarted(d) {
            if (!d3.event.active) simulation.alphaTarget(.03).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }

        function dragended(d) {
            if (!d3.event.active) simulation.alphaTarget(.03);
            d.fx = null;
            d.fy = null;
        }
    }

}