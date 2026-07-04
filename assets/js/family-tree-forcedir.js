const container = document.getElementById("family-tree-chart");
const width = container.clientWidth || 800;
const height = 900;
const radius = 8;

const color = d3.scaleOrdinal()
    .domain(["Unknown",
             "Sociology",
             "English",
             "Economics",
             "Philosophy",
             "Political Science",
             "Computer Science",
             "History",
             "Sociology and Anthropology",
             "Demography and Sociology",
             "Anthropology",
             "United States History",
             "Political Theory",
             "Literature",
             "Comparative Literature",
             "Classical Studies",
             "Social Sciences"
            ])
    .range(["silver",
            "green",
            "blue",
            "greenyellow",
            "darkorchid",
            "lightgreen",
            "red",
            "teal",
            "green",
            "olivedrab",
            "turquoise",
            "teal",
            "lightgreen",
            "blue",
            "blue",
            "slateblue",
            "lightgreen"
           ]);

// --- tooltip ---
const tooltip = d3.select("body")
    .append("div")
    .attr("id", "ft-tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background", "#fff")
    .style("border", "1px solid #ccc")
    .style("border-radius", "4px")
    .style("padding", "10px 14px")
    .style("font-size", "13px")
    .style("line-height", "1.6")
    .style("box-shadow", "0 2px 6px rgba(0,0,0,0.15)")
    .style("max-width", "260px")
    .style("pointer-events", "none");

function showTooltip(event, d) {
    const dissertation = (d.dissertation_title && d.dissertation_title !== "Unknown" && d.dissertation_title !== "")
        ? `<div><span style="color:#666">Dissertation:</span> <em>${d.dissertation_title}</em></div>`
        : "";

    const year = (d.year_graduated && d.year_graduated !== "Unknown" && d.year_graduated !== "")
        ? d.year_graduated
        : "Unknown";

    const university = (d.university && d.university !== "Unknown" && d.university !== "")
        ? d.university
        : "Unknown";

    const department = (d.department && d.department !== "Unknown" && d.department !== "")
        ? d.department
        : "Unknown";

    tooltip.html(`
        <div style="font-weight:bold; font-size:14px; margin-bottom:4px">${d.name}</div>
        <div><span style="color:#666">University:</span> ${university}</div>
        <div><span style="color:#666">Year:</span> ${year}</div>
        <div><span style="color:#666">Field:</span> ${department}</div>
        ${dissertation}
    `);

    // flip tooltip left if near right edge
    const tipWidth = 260;
    const x = event.pageX + 12;
    const flipped = x + tipWidth > window.innerWidth;

    tooltip
        .style("visibility", "visible")
        .style("left", flipped ? (event.pageX - tipWidth - 12) + "px" : x + "px")
        .style("top", (event.pageY - 28) + "px");
}

function moveTooltip(event) {
    const tipWidth = 260;
    const x = event.pageX + 12;
    const flipped = x + tipWidth > window.innerWidth;

    tooltip
        .style("left", flipped ? (event.pageX - tipWidth - 12) + "px" : x + "px")
        .style("top", (event.pageY - 28) + "px");
}

function hideTooltip() {
    tooltip.style("visibility", "hidden");
}

// --- svg ---
const svg = d3.select("#family-tree-chart")
    .append("svg")
    .attr("width", "100%")
    .attr("height", height);

// --- arrow markers ---
// one for normal links, one for chair links
svg.append("defs").selectAll("marker")
    .data(["arrow-normal", "arrow-chair"])
    .enter()
    .append("marker")
    .attr("id", d => d)
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", radius + 10)   // offset so arrow doesn't overlap node circle
    .attr("refY", 0)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M0,-5L10,0L0,5")
    .attr("fill", d => d === "arrow-chair" ? "#555" : "#ccc");

const simulation = d3.forceSimulation()
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("charge", d3.forceManyBody())
    .force("link", d3.forceLink().id(d => d.id));

function getChairLineage(rootId, nodes, links) {
    const chairSet = new Set();
    chairSet.add(rootId);

    // count how many sources each target has
    const inDegree = {};
    links.forEach(link => {
        const targetId = typeof link.target === "object" ? link.target.id : link.target;
        inDegree[targetId] = (inDegree[targetId] || 0) + 1;
    });

    // a link is "effectively chair" if explicitly marked Chair,
    // or if it is the only advisor for that target
    const chairSources = {};
    links.forEach(link => {
        const targetId = typeof link.target === "object" ? link.target.id : link.target;
        const sourceId = typeof link.source === "object" ? link.source.id : link.source;
        const effectiveChair = link.chair === "Chair" || inDegree[targetId] === 1;
        if (effectiveChair) {
            if (!chairSources[targetId]) chairSources[targetId] = [];
            chairSources[targetId].push(sourceId);
        }
    });

    // breadth-first walk
    const queue = [rootId];
    while (queue.length > 0) {
        const current = queue.shift();
        const sources = chairSources[current] || [];
        sources.forEach(sourceId => {
            if (!chairSet.has(sourceId)) {
                chairSet.add(sourceId);
                queue.push(sourceId);
            }
        });
    }

    return chairSet;
}

d3.json("/assets/data/data.json").then(json => {

    simulation.nodes(json.nodes);
    simulation.force("link").links(json.links);

    const link = svg.selectAll(".link")
        .data(json.links)
        .enter()
        .append("line")
        .attr("class", "link")
        .attr("marker-end", d => d.chair === "Chair" ? "url(#arrow-chair)" : "url(#arrow-normal)")
        .style("stroke", d => d.chair === "Chair" ? "#555" : "#ccc")
        .style("stroke-width", d => d.chair === "Chair" ? 2 : 1);

    const node = svg.selectAll(".node")
        .data(json.nodes)
        .enter()
        .append("g")
        .attr("class", "node")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended))
        .on("mouseover", showTooltip)
        .on("mousemove", moveTooltip)
        .on("mouseout", hideTooltip);

    node.append("circle")
        .attr("r", radius)
        .attr("fill", d => color(d.department));

    node.append("text")
        .attr("dx", 12)
        .attr("dy", ".35em")
        .style("font", "10px sans-serif")
        .style("pointer-events", "none")
        .text(d => d.name);

    simulation.on("tick", () => {
    // clamp nodes to stay within bounds
    json.nodes.forEach(d => {
        d.x = Math.max(radius, Math.min(width - radius, d.x));
        d.y = Math.max(radius, Math.min(height - radius, d.y));
    });

    link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

    node.attr("transform", d => `translate(${d.x},${d.y})`);
});

    // --- toggle logic ---
    let showChairOnly = false;
    const button = d3.select("#chair-toggle");

    button.on("click", () => {
        showChairOnly = !showChairOnly;
        button.text(showChairOnly ? "Show All" : "Show Chairs Only");
        applyFilter(showChairOnly, json.nodes, json.links);
    });

    function applyFilter(chairOnly, nodes, links) {
        if (!chairOnly) {
            node.style("opacity", 1);
            node.selectAll("text").style("display", null);
            link.style("opacity", 1);
        } else {
            const chairSet = getChairLineage(1, nodes, links);

            node.style("opacity", d => chairSet.has(d.id) ? 1 : 0.3);

            node.selectAll("text")
                .style("display", function() {
                    const d = d3.select(this.parentNode).datum();
                    return chairSet.has(d.id) ? null : "none";
                });

            link.style("opacity", d => {
                const sourceId = typeof d.source === "object" ? d.source.id : d.source;
                const targetId = typeof d.target === "object" ? d.target.id : d.target;
                return chairSet.has(sourceId) && chairSet.has(targetId) ? 1 : 0.3;
            });
        }
    }

}).catch(error => {
    console.error("Error loading data:", error);
});

function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
}

function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}
