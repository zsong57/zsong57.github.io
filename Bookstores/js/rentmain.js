
window.onload = setMap();

//set up choropleth map
function setMap(){
    // map frame dimensions
    var margin = {top: 5, left: 10, bottom: 5, right: 1}
    var width = parseInt(d3.select('#mapcontainer2').style('width'))
    width = width - margin.left - margin.right
    var mapRatio = .6
    var height = width * mapRatio;

    //create new svg container for the map
    var map2 = d3.select("#mapcontainer2")
        .append("svg")
        .attr("class", "map2")
        .attr("width", width)
        .attr("height", height);

    //Set the projection
      var projection = d3.geo.albersUsa()
    // no center because it's already centered on the US as part of the projection code
        .scale(width)
        .translate([width / 2.1, height / 2.2]); // keeps map centered in the svg container

    // creating a path generator to draw the projection
    var path = d3.geo.path()
        .projection(projection);  
        d3.select(window).on('resize', resize)
         function resize(){
        // adjust things when the window size changes
    width = parseInt(d3.select('#mapcontainer2').style('width'));
    width = width - margin.left - margin.right;
    height = width * mapRatio;

    // update projection
    projection
        .translate([width / 2.1, height / 2.2])
        .scale(width);

    // resize the map container
    map
        .style('width', width)
        .style('height', height);

    // resize the map
    map.selectAll('.countries2').attr('d', path);
    }  

    //use queue.js to parallelize asynchronous data loading
    var q = d3_queue.queue();
    q
        .defer(d3.json, "data2/States2.topojson") //load background spatial data
        .defer(d3.json, "data/citiesrent.json") //load attributes from csv
         .await(callback);

   function callback(error, world2,csvData){
     var worldCountries2 = topojson.feature(world2, world2.objects.States).features;

     var length = csvData.features.length;
    var pops = [];
    for (var mug=0; mug<length; mug++) {
        var pop = csvData.features[mug].properties.average;
        pops.push(Number(pop));
    }
    var min = Math.min.apply(Math, pops);
    var max = Math.max.apply(Math, pops);
    
    var radius = d3.scale.sqrt()
        .domain([min, max])
        .range([8, 45]);

        var countries2 = map2.selectAll(".countries2")
            .data(worldCountries2)
            .enter()
            .append("path")
            .attr("class", function(d){
                return "countries2 " + d.properties.STATE_ABBR;
            })
            .attr("d", path)
        .style("fill","#CBC9CF" );

       var circles = map2.selectAll(".circles")
        .data(csvData.features)
        .enter().append('path')
        .attr('class', 'cities')
        .attr('d', path.pointRadius(function(d) { return radius(d.properties.average); }))
         .attr("fill", "#A92E43")
        .attr("fill-opacity", 0.8)
        .attr("cursor", "pointer")
        .on("mouseover", highlight)
        .on("mouseout", dehighlight);
        CreateTotalLegend();

    };
};// end of setMap()


function dehighlight(d) {

      d3.select(this).attr("stroke", null);
       d3.select(".infolabel2")
        .remove(); 
};


function highlight(d){
     d3.select(this).attr("stroke", "white")
        .attr("stroke-width", 4)
        .attr("stroke-opacity",0.5);

var labelName = d.properties.City;
var cityrent = d.properties.average;
 var labelAttribute = labelName +"<br>"+"Average Rent is " + "<b> $"+ cityrent +"</b>"+ " per sq ft annually";
  var infolabel = d3.select("#infoPanel2")
        .append("text")
       .attr("class", "infolabel2")
        .html(labelAttribute);
};

function CreateTotalLegend(){
    var legend = d3.selectAll("#legend2").append("svg")
        .attr("width", 200)
        .attr("height", 200)
        .attr("class", "legendTotal")


    var legendDetails = legend.append("circle")
        .attr("r", 39.1)
        .attr("cx", 40)
        .attr("cy", 160)
        .style("fill", "none")
        .style("stroke", "#545454")
        .style("stroke-width", "1.5")

    var legendDetails2 = legend.append("circle")
        .attr("r", 19.5)
        .attr("cx", 40)
        .attr("cy", 180)
        .style("fill", "none")
        .style("stroke", "#545454")
        .style("stroke-width", "1.5")

  legend.append("text")
      .text("$60")
      .attr("x", 90)
      .attr("y", 130)
      .style("fill", "#545454")

//adding text to legend
  legend.append("text")
      .text("$30")
      .attr("x", 90)
      .attr("y", 170)
       .style("fill", "#545454")

};


