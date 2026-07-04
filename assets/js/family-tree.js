const container = document.getElementById("family-tree-chart");
const width = container.clientWidth || 800;
const radius = 8;

const minYear = 1622;
const maxYear = 2026;
const pxPerYear = 15;
const height = (maxYear - minYear) * pxPerYear;

const yScale = d3.scaleLinear()
    .domain([minYear, maxYear])
    .range([height, 0]);

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
             "Social Sciences",
             "Mathematics",
             "Physics",
             "Rhetoric and Moral Philosophy",
             "American Civilization",
             "Education",
             "Medicine",
             "History and Sociology of Science",
             "Sociology and Economics",
             "Public Policy",
             "Social Geography",
             "Celestial Mechanics",
             "Social Psychology",
             "History of Science"
            ])
    .range(["silver",
            "#4e9a4e",
            "#4a7abf",
            "#b5d44a",
            "#9b59b6",
            "#3db08a",
            "#e74c3c",
            "#16a085",
            "#4e9a4e",
            "#7d9e3a",
            "#1abc9c",
            "#16a085",
            "#3db08a",
            "#4a7abf",
            "#4a7abf",
            "#8e44ad",
            "#7d9e3a",
            "#e67e22",
            "#2980b9",
            "#c0392b",
            "#d35400",
            "#27ae60",
            "#8e44ad",
            "#2c3e50",
            "#7f8c8d",
            "#f39c12",
            "#e74c3c",
            "#1abc9c",
            "#95a5a6",
            "#d35400"
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

function parseYear(node) {
    const y = node.year_graduated;
    if (!y || y === "Unknown" || y === "") return null;
    const n = parseFloat(y);
    return isNaN(n) ? null : n;
}

function isChair(link) {
    return link.chair === "Chair" || link.chair === "chair";
}

// walk upward from a set of starting node ids
// following all links (or only chair links if chairOnly=true)
// returns a Set of all reachable node ids including the roots
function getLineageNodes(rootIds, links, chairOnly) {
    const visited = new Set(rootIds);
    const queue = [...rootIds];

    // build lookup: for each target, which sources point to it
    // (and optionally filter to chair links only)
    const sourcesOf = {};
    links.forEach(link => {
        const sourceId = typeof link.source === "object" ? link.source.id : link.source;
        const targetId = typeof link.target === "object" ? link.target.id : link.target;
        if (chairOnly && !isChair(link)) return;
        if (!sourcesOf[targetId]) sourcesOf[targetId] = [];
        sourcesOf[targetId].push(sourceId);
    });

    while (queue.length > 0) {
        const current = queue.shift();
        const sources = sourcesOf[current] || [];
        sources.forEach(sourceId => {
            if (!visited.has(sourceId)) {
                visited.add(sourceId);
                queue.push(sourceId);
            }
        });
    }

    return visited;
}

// --- svg ---
const svg = d3.select("#family-tree-chart")
    .append("svg")
    .attr("width", "100%")
    .attr("height", height);

// --- year axis grid lines every 20 years ---
const yearTicks = d3.range(
    Math.ceil(minYear / 20) * 20,
    maxYear + 1,
    20
);

yearTicks.forEach(year => {
    const y = yScale(year);

    svg.append("line")
        .attr("x1", 0)
        .attr("x2", "100%")
        .attr("y1", y)
        .attr("y2", y)
        .style("stroke", "#eee")
        .style("stroke-width", 1);

    svg.append("text")
        .attr("x", 4)
        .attr("y", y - 4)
        .style("font-size", "11px")
        .style("fill", "#bbb")
        .text(year);
});

// --- arrow markers ---
svg.append("defs").selectAll("marker")
    .data(["arrow-normal", "arrow-chair"])
    .enter()
    .append("marker")
    .attr("id", d => d)
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", radius + 10)
    .attr("refY", 0)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M0,-5L10,0L0,5")
    .attr("fill", d => d === "arrow-chair" ? "#555" : "#ccc");

d3.json("/assets/data/data.json").then(json => {

    const nodeById = {};
    json.nodes.forEach(d => nodeById[d.id] = d);

    // find the direct advisors of node 1 by type
    // these are the roots for each lineage walk
    function getRootsForType(forType) {
        return json.links
            .filter(l => {
                const targetId = typeof l.target === "object" ? l.target.id : l.target;
                return targetId === 1 && l.for === forType;
            })
            .map(l => typeof l.source === "object" ? l.source.id : l.source);
    }

    // set initial positions
    json.nodes.forEach(d => {
        d.x = width / 2 + (Math.random() - 0.5) * 200;
        const year = parseYear(d);
        if (year !== null) {
            d.y = yScale(year);
            d.fy = yScale(year);
        }
    });

    // estimate y for unknown-year nodes from neighbors
    for (let pass = 0; pass < 10; pass++) {
        json.nodes.forEach(d => {
            if (parseYear(d) !== null) return;

            const aboveYs = [];
            const belowYs = [];

            json.links.forEach(link => {
                const sourceId = typeof link.source === "object" ? link.source.id : link.source;
                const targetId = typeof link.target === "object" ? link.target.id : link.target;

                if (sourceId === d.id && nodeById[targetId] && nodeById[targetId].y !== undefined) {
                    aboveYs.push(nodeById[targetId].y);
                }
                if (targetId === d.id && nodeById[sourceId] && nodeById[sourceId].y !== undefined) {
                    belowYs.push(nodeById[sourceId].y);
                }
            });

            if (aboveYs.length > 0 || belowYs.length > 0) {
                const minY = aboveYs.length > 0 ? Math.min(...aboveYs) : 0;
                const maxY = belowYs.length > 0 ? Math.max(...belowYs) : height;
                if (minY < maxY) {
                    d.y = (minY + maxY) / 2;
                } else {
                    const allYs = [...aboveYs, ...belowYs];
                    d.y = allYs.reduce((a, b) => a + b, 0) / allYs.length;
                }
            } else {
                d.y = height - 100;
            }
        });
    }

    const simulation = d3.forceSimulation(json.nodes)
        .force("charge", d3.forceManyBody().strength(-80))
        .force("link", d3.forceLink(json.links).id(d => d.id).distance(80))
        .force("x", d3.forceX(width / 2).strength(0.05))
        .force("collision", d3.forceCollide(radius + 6));

    const link = svg.selectAll(".link")
        .data(json.links)
        .enter()
        .append("line")
        .attr("class", "link")
        .attr("marker-end", d => isChair(d) ? "url(#arrow-chair)" : "url(#arrow-normal)")
        .style("stroke", d => isChair(d) ? "#555" : "#ccc")
        .style("stroke-width", d => isChair(d) ? 2 : 1);

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
        json.nodes.forEach(d => {
            d.x = Math.max(radius, Math.min(width - radius, d.x));
            if (parseYear(d) === null) {
                d.y = Math.max(radius, Math.min(height - radius, d.y));
            }
        });

        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node.attr("transform", d => `translate(${d.x},${d.y})`);
    });

    // --- filter state ---
    let highlightPrimary = false;
    let showPhd = false;
    let showMasters = false;
    let showUndergrad = false;
    let showPhdChairs = true;
    let showSociology = false;

    // compute which nodes are visible based on checkbox state
    // always include node 1 (you)
    function getVisibleSet() {
        const visible = new Set([1]);

        // get the raw link data (before simulation mutates source/target)
        // by the time this runs, source/target are objects
        // so we use the helper that handles both cases

        if (showPhd) {
            const roots = getRootsForType("phd");
            roots.forEach(id => visible.add(id));
            getLineageNodes(roots, json.links, false)
                .forEach(id => visible.add(id));
        }

        if (showMasters) {
            const roots = getRootsForType("masters");
            roots.forEach(id => visible.add(id));
            getLineageNodes(roots, json.links, false)
                .forEach(id => visible.add(id));
        }

        if (showUndergrad) {
            const roots = getRootsForType("undergrad");
            roots.forEach(id => visible.add(id));
            getLineageNodes(roots, json.links, false)
                .forEach(id => visible.add(id));
        }

        if (showPhdChairs) {
            // only follow chair links within phd lineage roots
            const roots = getRootsForType("phd").filter(id => {
                // only chair links from node 1
                return json.links.some(l => {
                    const sourceId = typeof l.source === "object" ? l.source.id : l.source;
                    const targetId = typeof l.target === "object" ? l.target.id : l.target;
                    return targetId === 1 && sourceId === id && isChair(l);
                });
            });
            roots.forEach(id => visible.add(id));
            getLineageNodes(roots, json.links, true)
                .forEach(id => visible.add(id));
        }

        if (showSociology) {
            const roots = json.links
                .filter(l => {
                    const targetId = typeof l.target === "object" ? l.target.id : l.target;
                    return targetId === 1 && l.sociology === "yes";
                })
                .map(l => typeof l.source === "object" ? l.source.id : l.source);
            roots.forEach(id => visible.add(id));
            getLineageNodes(roots, json.links, false)
                .forEach(id => visible.add(id));
        }

        return visible;
    }

    // compute highlighted set (primary advisors) within visible set
    function getHighlightSet(visibleSet) {
        // same as old chair lineage logic but constrained to visible nodes
        const inDegree = {};
        json.links.forEach(link => {
            const targetId = typeof link.target === "object" ? link.target.id : link.target;
            const sourceId = typeof link.source === "object" ? link.source.id : link.source;
            if (!visibleSet.has(targetId) || !visibleSet.has(sourceId)) return;
            inDegree[targetId] = (inDegree[targetId] || 0) + 1;
        });

        const chairSources = {};
        json.links.forEach(link => {
            const targetId = typeof link.target === "object" ? link.target.id : link.target;
            const sourceId = typeof link.source === "object" ? link.source.id : link.source;
            if (!visibleSet.has(targetId) || !visibleSet.has(sourceId)) return;
            const effectiveChair = isChair(link) || inDegree[targetId] === 1;
            if (effectiveChair) {
                if (!chairSources[targetId]) chairSources[targetId] = [];
                chairSources[targetId].push(sourceId);
            }
        });

        const highlightSet = new Set([1]);
        const queue = [1];
        while (queue.length > 0) {
            const current = queue.shift();
            const sources = chairSources[current] || [];
            sources.forEach(sourceId => {
                if (!highlightSet.has(sourceId)) {
                    highlightSet.add(sourceId);
                    queue.push(sourceId);
                }
            });
        }

        return highlightSet;
    }

    function applyFilter() {
        const visibleSet = getVisibleSet();
        const highlightSet = highlightPrimary ? getHighlightSet(visibleSet) : null;

        // show/hide nodes
        node.style("display", d => visibleSet.has(d.id) ? null : "none");

        // show/hide links - both ends must be visible
        link.style("display", d => {
            const sourceId = typeof d.source === "object" ? d.source.id : d.source;
            const targetId = typeof d.target === "object" ? d.target.id : d.target;
            return visibleSet.has(sourceId) && visibleSet.has(targetId) ? null : "none";
        });

        // apply highlight dimming if active
        if (highlightSet) {
            node.style("opacity", d => highlightSet.has(d.id) ? 1 : 0.3);
            node.selectAll("text").style("display", function() {
                const d = d3.select(this.parentNode).datum();
                if (!visibleSet.has(d.id)) return "none";
                return highlightSet.has(d.id) ? null : "none";
            });
            link.style("opacity", d => {
                const sourceId = typeof d.source === "object" ? d.source.id : d.source;
                const targetId = typeof d.target === "object" ? d.target.id : d.target;
                if (!visibleSet.has(sourceId) || !visibleSet.has(targetId)) return 0;
                return highlightSet.has(sourceId) && highlightSet.has(targetId) ? 1 : 0.3;
            });
        } else {
            node.style("opacity", 1);
            node.selectAll("text").style("display", function() {
                const d = d3.select(this.parentNode).datum();
                return visibleSet.has(d.id) ? null : "none";
            });
            link.style("opacity", 1);
        }
    }

    // --- controls ---
    const highlightButton = d3.select("#chair-toggle");
    highlightButton.on("click", () => {
        highlightPrimary = !highlightPrimary;
        highlightButton.text(highlightPrimary ? "Show All" : "Highlight Primary Advisors");
        applyFilter();
    });

    d3.select("#show-phd").on("change", function() {
        showPhd = this.checked;
        applyFilter();
    });

    d3.select("#show-masters").on("change", function() {
        showMasters = this.checked;
        applyFilter();
    });

    d3.select("#show-undergrad").on("change", function() {
        showUndergrad = this.checked;
        applyFilter();
    });

    d3.select("#show-phd-chairs").on("change", function() {
        showPhdChairs = this.checked;
        applyFilter();
    });

    d3.select("#show-sociology").on("change", function() {
        showSociology = this.checked;
        applyFilter();
    });

    // apply initial filter state
    applyFilter();

    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        if (parseYear(d) === null) d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        if (parseYear(d) === null) d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        if (parseYear(d) === null) d.fy = null;
    }

}).catch(error => {
    console.error("Error loading data:", error);
});