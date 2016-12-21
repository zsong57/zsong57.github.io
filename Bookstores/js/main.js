
(function(){

//pseudo-global variables
var attrArray = ["Independent", "Chain", "Bigbox", "Total", "Permillion"];
var expressed = attrArray[4]; //initial attribute

//begin script when window loads
window.onload = setMap();

//set up choropleth map
function setMap(){
    // map frame dimensions
     var margin = {top: 5, left: 1, bottom: 5, right: 1}
    var width = parseInt(d3.select('#mapcontainer1').style('width'))
    width = width - margin.left - margin.right
    var mapRatio = .6
    var height = width * mapRatio;
// d3.select(window)
//             .on("resize", sizeChange);
    //create new svg container for the map
    var map = d3.select("#mapcontainer1")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height)
        .append("g");

    //Set the projection
      var projection = d3.geo.albersUsa()
    // no center because it's already centered on the US as part of the projection code
        .scale(750)
        .translate([width / 2.1, height / 2.2]); // keeps map centered in the svg container

    // creating a path generator to draw the projection
    var path = d3.geo.path()
        .projection(projection);    
d3.select(window).on('resize', resize)
 function resize(){
        // adjust things when the window size changes
    width = parseInt(d3.select('#mapcontainer1').style('width'));
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
    map.selectAll('.countries').attr('d', path);
    }
    //use queue.js to parallelize asynchronous data loading
    var q = d3_queue.queue();
    q
        .defer(d3.csv, "data/books.csv") //load attributes from csv
        .defer(d3.json, "data/States.topojson") //load background spatial data
         .await(callback);

   function callback(error, csvData, world){
     //place graticule on the map
        
   
	   var worldCountries = topojson.feature(world, world.objects.States).features;          

        //join csv data to GeoJSON enumeration units
        worldCountries = joinData(worldCountries, csvData);

        //create the color scale
        var colorScale = makeColorScale(csvData);

        //add enumeration units to the map
        setEnumerationUnits(worldCountries, map, path, colorScale);
        //add coordinated visualization to the map
       
        
    };
};// end of setMap()



function joinData(worldCountries, csvData){
    //variables for data join
    var attrArray = ["Independent", "Chain", "Bigbox", "Total", "Permillion"];
   
    //loop through csv to assign each set of csv attribute values to geojson region
    for (var i=0; i<csvData.length; i++){
        var csvRegion = csvData[i]; //the current region
        var csvKey = csvRegion.STATE_ABBR; //the CSV primary key

         //loop through geojson regions to find correct region
        for (var a=0; a<worldCountries.length; a++){
            var geojsonProps = worldCountries[a].properties; //the current region geojson properties
            var geojsonKey = geojsonProps.STATE_ABBR; //the geojson primary key

            //where primary keys match, transfer csv data to geojson properties object
            if (geojsonKey == csvKey){

                //assign all attributes and values
                attrArray.forEach(function(attr){
                    var val = parseFloat(csvRegion[attr]); //get csv attribute value
                    geojsonProps[attr] = val; //assign attribute and value to geojson properties
                });
            };
        };
    };

    return worldCountries;
};

function makeColorScale(data){
    var colorClasses = [
    "#DAB3B2",
        "#C18080",
        "#A84E4E",
        "#961B1E",
        "#741112"
       
    ];

   //create color scale generator
    var colorScale = d3.scale.quantile()
        .range(colorClasses);

    //build two-value array of minimum and maximum expressed attribute values
    var minmax = [
        d3.min(data, function(d) { return parseFloat(d[expressed]); }),
        d3.max(data, function(d) { return parseFloat(d[expressed]); })
    ];
    //assign two-value array as scale domain
    colorScale.domain(minmax);

    return colorScale;
};

function setEnumerationUnits(worldCountries, map, path, colorScale){

    //add France regions to map
    var countries = map.selectAll(".countries")
            .data(worldCountries)
            .enter()
            .append("path")
            .attr("class", function(d){
                return "countries " + d.properties.STATE_ABBR;
            })
            .attr("d", path)
        .style("fill", function(d){
            // return colorScale(d.properties[expressed]);
            return choropleth(d.properties, colorScale);
        })
      
          .on("mouseover", function(d) {
             highlight(d.properties); 
  })
  .on("mouseout", function(d) {
     dehighlight(d.properties);
    
  })
  .on("mousemove", moveLabel)
            var countriesColor = countries.append("desc")
                .text(function(d) {
                    return choropleth(d.properties, colorScale);
                });
};
function moveLabel(csvData){
    //use coordinates of mousemove event to set label coordinates
  console.log("aa")
};

function dehighlight(props) {
    //  var selection = d3.selectAll("."+props.STATE_ABBR)
    //  .transition().duration(100)
    // .style("opacity", 0.8);
 
    // d3.select(".infolabel")
    //     .remove(); 

        var selection = d3.selectAll('.countries.'+props.STATE_ABBR);

    var fillColor = selection.select("desc").text();
    selection.style("fill", fillColor); 
    d3.select(".infolabel1")
        .remove(); 
};


function highlight(props){
    //change stroke
    var selected = d3.selectAll('.countries.'+props.STATE_ABBR)
        .style(
              "fill", "#EDEDED"
        );
        setLabel(props);
};
function setLabel(props,csvData){
    //label content
      
    var labelName = props.NAME;
    var total = "Total";
    var chain = "Chain";
    var independent = "Independent";
    var bigbox = "Bigbox"
    

     //if no data associated with selection, display "No data"
        var labelAttribute = labelName + "<br>"+"Bookstores per million people: " + "<b>"+props[expressed]+ "</b>"+"<br>" + "Total Chain Bookstores: " + props[chain]+ "<br>" + "Total Big-box Bookstores: "+ props[bigbox]+"<br>"+"Total Independent Bookstores: "+ props[independent];
   

   //create info label div
    var infolabel = d3.select("#infoPanel1")
        .append("text")
        .attr({"class":"infolabel1",
             "id": props.NAME + "_label"
         }
            )
        .html(labelAttribute);

       
};


//function to test for data value and return color
function choropleth(props, colorScale){
    //make sure attribute value is a number
    var val = parseFloat(props[expressed]);
    //if attribute value exists, assign a color; otherwise assign gray
    if (val && val != NaN){
        return colorScale(val);
    } else {
        console.log("lol")
    };
};
    function sizeChange() {
        d3.select("g").attr("transform", "scale(" + $("#mapcontainer1").width()/1000 + ")");
        $("svg").height($("#mapcontainer1").width()*0.75);
    }

})();