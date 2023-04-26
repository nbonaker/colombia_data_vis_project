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

    }
    initialize_nodes(data) {
    // A scale that gives a X target position for each group
        var x_centers = d3.scaleOrdinal()
            .domain([1, 2, 3, 4])
            .range([this.width/10, this.width*3.5/10, this.width*6.5/10, this.width*9/10])

    // A color scale
        var color_cari = d3.scaleOrdinal()
            .domain([1, 2, 3, 4])
            .range(["#d52719", "#ffd813", "#0443a6", "#5bc4e7"])

        var color_aid = d3.scaleOrdinal()
            .domain([0, 1])
            .range(["#d52719", "#0443a6"])

        var bubble_stroke_width = 4

        function radius_size(d){
            return Math.max(5, Math.sqrt(d.size)*4)
        }

        // Initialize the circle: located at the center of each group area
        var node = this.svg.append("g")
            .selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("r", radius_size)
            .attr("cx", this.width / 2)
            .attr("cy", this.height / 2)
            .style("fill", function (d) {
                if (document.getElementById('color_select').value == "cari"){
                    return color_cari(d.group)
                } else {
                    return color_aid(d.aid == 1)
                }

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
                if (document.getElementById('color_select').value == "cari") {
                    return this.height / 2
                } else {
                    if (d.aid == 1) {
                        return this.height * 4 / 9
                    } else {
                        return this.height * 5 / 9
                    }
                }
            }.bind(this)))
            // .force("center", d3.forceCenter().x(this.width / 2).y(this.height / 2)) // Attraction to the center of the svg area
            .force("charge", d3.forceManyBody().strength(0.5)) // Nodes are attracted one each other of value is > 0
            .force("collide", d3.forceCollide().strength(0.5).radius(function (d){
                return radius_size(d) + bubble_stroke_width/2
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