---
layout: default
title: Academic Family Tree
---

## Academic Family Tree

I started looking up advising relationships in 2017 and things... got out of hand. Here's a mediocre, interactive visualization of my academic advising lineages. Most links are thanks to information in the Proquest dissertations database. Others draw on biographies, obituaries, CVs, and other such miscellany. My masters lineage through [Gary Weiss](https://storm.cis.fordham.edu/~gweiss/lineage.html) is thanks to the work of his advisor, Haym Hirsh. Some links are missing where I could not find information, or where I was pulled away from this silly hobby project. 

<div style="margin-bottom: 1rem;">
    <button id="chair-toggle">Highlight Primary Advisors</button>
</div>

<div style="margin-bottom: 1rem; display: flex; gap: 1.5rem; flex-wrap: wrap;">
    <label>
        <input type="checkbox" id="show-phd-chairs" checked>
        PhD chairs only
    </label>
    <label>
        <input type="checkbox" id="show-phd">
        PhD full lineage
    </label>
    <label>
        <input type="checkbox" id="show-masters">
        Masters lineages
    </label>
    <label>
        <input type="checkbox" id="show-undergrad">
        Undergrad lineage
    </label>
    <label>
        <input type="checkbox" id="show-sociology">
        Sociology full lineage
    </label>
</div>

<div id="family-tree-chart" style="width: 100%;"></div>

<script src="https://cdn.jsdelivr.net/npm/d3@7"></script>
<script src="/assets/js/family-tree.js"></script>