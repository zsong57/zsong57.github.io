
(function(){

//pseudo-global variables
var attrArray = ["Population exposed to PM2.5 air pollution", "Cigarettes consumptions", "Diabetes prevalence", "Access to improved water source", "Life expentancy at birth"];
var expressed = attrArray[0]; //initial attribute
var squareWidth = 10; //width of rects in chart (in pixels)
var squareHeight = 25;
var currentColors = [];
var minmax = [];
var chartLabels = [];
var descriptionDiv = [];
var title_Cigarettes = "CIGARETTES CONSUMPTION";
var title_PM = "PM2.5 AIR POLLUTION";
var title_Water = "IMPROVED WATER SOURCE, % OF RURAL POPULATION WITH ACCESS";
var title_Diabetes = "DIABETES PREVALENCE";
var title_Life = "LIFE EXPECTANCY, YEARS";


var desc_Cigarettes = "This variable shows the number of cigarettes smoked per person per year: age ≥ 15. About 80% of lung cancer deaths are caused by smoking, and smoking is a very unhealthy lifestyle.<sup>[1]</sup>";
var desc_PM = "This variable shows the portion of a country’s population living in places where mean annual concentrations of PM2.5 are greater than 10 micrograms per cubic meter.";
var desc_Water = "The improved drinking water source includes piped water on premises, and other improved drinking water sources (public taps or standpipes, tube wells or boreholes, protected dug wells, protected springs, and rainwater collection)";
var desc_Diabetes = "Diabetes is one of the top 10 deadliest diseases, and its prevalence refers to the percentage of people ages 20-79 who have type 1 or type 2 diabetes.";
var desc_Life = "Life expectancy at birth indicates the number of years a newborn infant would live if prevailing patterns of mortality at the time of its birth were to stay the same throughout its life.";


    //chart frame dimensions
var  chartWidth = 1000; //width of chart (in pixels)
chartHeight = (squareHeight*5)+5
        leftPadding = 40,
        rightPadding = 8,
        topBottomPadding = 8,
        chartInnerWidth = chartWidth - leftPadding - rightPadding,
        chartInnerHeight = chartHeight - topBottomPadding * 4,
        translate = "translate(" + leftPadding + "," + topBottomPadding + ")";
    //create a scale to size bars proportionally to frame
    var yScale = d3.scale.linear()
        .range([450,0])
        .domain([0, 3]);

//begin script when window loads
window.onload = setMap();

//set up choropleth map
function setMap(){
    // map frame dimensions
    var width = window.innerWidth * 0.66,
        height = 650;

    //create new svg container for the map
    var map = d3.select("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);

    var pageTitle = d3.select("body")
        .append("text")
        .attr("class", "pageTitle")
        .html("Do you live in a healthy place?");



    //Set the projection
    var projection = d3.geo.fahey()
	.center([-30, 26])
        .scale(200)
        .translate([width / 3, height / 2.2])
        .precision(.1);

    var path = d3.geo.path()
        .projection(projection);    

    //use queue.js to parallelize asynchronous data loading
    var q = d3_queue.queue();
    q
        .defer(d3.csv, "data/lab2data.csv") //load attributes from csv
        .defer(d3.json, "data/Worlddata.topojson") //load background spatial data
         .await(callback);

   function callback(error, csvData, world){
  
   
	   var worldCountries = topojson.feature(world, world.objects.Worlddata).features;          

        //join csv data to GeoJSON enumeration units
        worldCountries = joinData(worldCountries, csvData);

        //create the color scale
        var colorScale = makeColorScale(csvData);

        //add enumeration units to the map
        setEnumerationUnits(worldCountries, map, path, colorScale);
        //add coordinated visualization to the map
        setChart(csvData, colorScale);
        createDropdown(csvData);
        createDescriptions(csvData);
        about();
        
    };
};

function joinData(worldCountries, csvData){
    //variables for data join
    var attrArray = ["Population exposed to PM2.5 air pollution", "Cigarettes consumptions","Diabetes prevalence", "Access to improved water source",  "Life expentancy at birth"];
   
    //loop through csv to assign each set of csv attribute values to geojson region
    for (var i=0; i<csvData.length; i++){
        var csvRegion = csvData[i]; //the current region
        var csvKey = csvRegion.COUNAME; //the CSV primary key

         //loop through geojson regions to find correct region
        for (var a=0; a<worldCountries.length; a++){
            var geojsonProps = worldCountries[a].properties; //the current region geojson properties
            var geojsonKey = geojsonProps.COUNAME; //the geojson primary key

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
        "#edf8e9",
        "#bae4b3",
        "#74c476",
        "#31a354",
        "#006d2c"
    ];
var colorClasses2 =[
    "#fee5d9",
    "#fcae91",
    "#fb6a4a",
    "#de2d26",
    "#a50f15"
            ];
if (expressed == "Life expentancy at birth" || expressed == "Access to improved water source") {
        currentColors = colorClasses;} 
else
    {currentColors = colorClasses2;
   }

   //create color scale generator
    var colorScale = d3.scale.threshold()
        .range(currentColors);

    for (var i in data) {
        //if the data is ordinal, just add the string to the current array
        if (expressed == "Cigarettes consumptions" ) {
            minmax = [0.05, 0.25, 0.5, 1, 3]; 
        } else if (expressed == "Population exposed to PM2.5 air pollution") { //else, convert data to number and add to current array
            minmax = [20, 50, 70, 90, 100];
        } else if (expressed == "Diabetes prevalence") {
            minmax = [5, 10, 15, 20, 25];
        } else if (expressed == "Access to improved water source") {
            minmax = [50, 65, 80, 90, 100];
        } else if (expressed == "Life expentancy at birth") {
            minmax = [50, 60, 70, 80, 90];
        };
    };


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
                return "countries " + d.properties.COUNAME;
            })
            .attr("d", path)
        .style("fill", function(d){
            // return colorScale(d.properties[expressed]);
            return choropleth(d.properties, colorScale)

        })
         .on("mouseover", function(d){
            highlight(d.properties);
        })
         .on("mouseout", function(d){
            dehighlight(d.properties);
        })
         .on("mousemove", moveLabel)
            var countriesColor = countries.append("desc")
                .text(function(d) {
                    return choropleth(d.properties, colorScale);
                });

};

//function to test for data value and return color
function choropleth(props, colorScale){
    //make sure attribute value is a number
    var val = parseFloat(props[expressed]);
    //if attribute value exists, assign a color; otherwise assign gray
    if (val && val != NaN){
        return colorScale(val);
    } else {
        return "#CCC";
    };

};

//function to create coordinated bar chart
function setChart(csvData, colorScale){


    //create a second svg element to hold the bar chart
    var chart = d3.select("body")
        .append("svg")
        .attr("width", chartWidth)
        .attr("height", chartHeight)
        .attr("class", "chart");
   
    chartLabels = d3.select("body")
        .append("div")
        .attr("class", "chartLabels");


    var squares = chart.selectAll(".square")
        .data(csvData)
        .enter()
        .append("rect")
        .attr("class", function(d){
            return "square " + d.COUNAME;
        })
                .attr("width", squareWidth+"px")
        .attr("height", squareHeight+"px");
         updateChart(squares, csvData.length, colorScale);
         
	
  
};

function updateChart(squares, n, colorScale){
    var xValue = 0; 
    var yValue = 0;
    var colorObjectArray = [];
        for (i = 0; i < currentColors.length; i++) {
        var colorObject = {"color": currentColors[i],"count":0} ;
        colorObjectArray.push(colorObject);         
    }

    var chartLabel = chartLabels.html(function(d) {
        if (expressed == "Cigarettes consumptions") {
            return minmax[0]+"<br>"
            +minmax[1]+"<br>"
            +minmax[2]+"<br>"
            +minmax[3]+"<br>"
            +minmax[4]+"<br>";
        } else if (expressed == "Population exposed to PM2.5 air pollution") {
          return minmax[0]+"%"+"<br>"
            +minmax[1]+"%"+"<br>"
            +minmax[2]+"%"+"<br>"
            +minmax[3]+"%"+"<br>"
            +minmax[4]+"%"+"<br>";
        } else if (expressed == "Diabetes prevalence") {
            return minmax[0]+"%"+"<br>"
            +minmax[1]+"%"+"<br>"
            +minmax[2]+"%"+"<br>"
            +minmax[3]+"%"+"<br>"
            +minmax[4]+"%"+"<br>";            
        } else if (expressed == "Access to improved water source") {
            return minmax[0]+"%"+"<br>"
            +minmax[1]+"%"+"<br>"
            +minmax[2]+"%"+"<br>"
            +minmax[3]+"%"+"<br>"
            +minmax[4]+"%"+"<br>";    
        } else if (expressed == "Life expentancy at birth") {
            return minmax[0]+"<br>"
            +minmax[1]+"<br>"
            +minmax[2]+"<br>"
            +minmax[3]+"<br>"
            +minmax[4]+"<br>";
        }
    });


    var squareColor = squares.style("fill", function(d){
            return choropleth(d, colorScale);
        })
    .on("mouseover", highlight)
    .on("mouseout", dehighlight)
    .on("mousemove", moveLabel)
.transition() //add animation
.duration(500)
       .attr("x", function(d,i) {
            color = choropleth(d, colorScale);
            //for loop arranges each class so that the squares are contiguous horizontally
            for (i = 0; i < colorObjectArray.length; i++) {
                if (colorObjectArray[i].color == color) {
                    xValue = colorObjectArray[i].count*(squareWidth+1);
                    colorObjectArray[i].count+=1;
                }
                else if (color == "#CCC") {
                    xValue = -100000;
                }
            }
            return xValue;
        })
       .attr("y", function(d,i) {
            color = choropleth(d, colorScale);
            // var xLocation = Parse(this);
            if (color == currentColors[0]) {
                return 0
            } else if (color == currentColors[1]) {
                return (squareHeight+1);
            } else if (color == currentColors[2]) {
                return (squareHeight+1)*2;
            } else if (color == currentColors[3]) {
                return (squareHeight+1)*3;
            } else if (color == currentColors[4]) {
                return (squareHeight+1)*4;
            } else if (color == currentColors[5]) {
                return (squareHeight+1)*5;
            }
        });

    };

function createDropdown(csvData){
    //add select element
    var dropdown = d3.select("body")
        .append("select")
        .attr("class", "dropdown")
        .on("change", function(){
            changeAttribute(this.value, csvData)
        });

    //add initial option
    var titleOption = dropdown.append("option")
        .attr("class", "titleOption")
        .attr("disabled", "true")
        .text("Pick a health varible :)");

    //add attribute name options
    var attrOptions = dropdown.selectAll("attrOptions")
        .data(attrArray)
        .enter()
        .append("option")
        .attr("value", function(d){ return d })
        .text(function(d){ return d });
};

function changeAttribute(attribute, csvData){
    //change the expressed attribute
    expressed = attribute;

    //recreate the color scale
    var colorScale = makeColorScale(csvData);

    //recolor enumeration units
   var countries = d3.selectAll(".countries")
   .transition()
        .duration(1000)
        .style("fill", function(d){
            return choropleth(d.properties, colorScale)
        })
        .select("desc")
                .text(function(d) {
                    return choropleth(d.properties, colorScale);
                });
    var squares = d3.selectAll(".square");
    updateChart(squares, csvData.length, colorScale);
    updateDescriptions(csvData);
};

//function to highlight enumeration units and bars
function highlight(props){
    //change stroke
    var selected = d3.selectAll("." + props.COUNAME)
        .style(
            "fill", "#FFC42A"
        );
        setLabel(props);
};

function dehighlight(props) {
     var selection = d3.selectAll("."+props.COUNAME);

    var fillColor = selection.select("desc").text();
    selection.style("fill", fillColor); 
    d3.select(".infolabel")
        .remove(); 
};

//function to create dynamic label
function setLabel(props,csvData){
    //label content
   

    var labelAttribute = "<p1>" + props[expressed] +
        "</p1>" + "<br>"+expressed;
    

    var labelName = props.admin;
    
    

    if (Boolean(props[expressed]) == true) {
        if (expressed == "Population exposed to PM2.5 air pollution") {
            labelAttribute = Math.round(props[expressed])+"% people are exposed of PM2.5"
        } else if (expressed == "Cigarettes consumptions") {
            labelAttribute = props[expressed]+" cigarettes are consumed per person"
        } else if (expressed == "Diabetes prevalence") {
            labelAttribute = Math.round(props[expressed])+"% people are with Diabetes"
        } else if (expressed == "Access to improved water source") {
            labelAttribute = Math.round(props[expressed])+"% people have access to improved water source"
        } else if (expressed == "Life expentancy at birth") {
            labelAttribute = "People are expected to live to "+Math.round(props[expressed])
        };
    } else { //if no data associated with selection, display "No data"
        labelAttribute = "No data";
    };


   //create info label div
    var infolabel = d3.select("body")
        .append("div")
        .attr("class", "infolabel")
        .html(props.admin);


    var regionName = infolabel.append("div")
       .attr({
            "class": "aaa",
            "id": props.COUNAME + "_label"
        })
        .html(labelAttribute);
       
};

function moveLabel(csvData){
    //use coordinates of mousemove event to set label coordinates
      var x = d3.event.clientX < window.innerWidth - 245 ? d3.event.clientX+10 : d3.event.clientX-210; 
    //vertical label coordinate
    var y = d3.event.clientY < window.innerHeight - 100 ? d3.event.clientY-75 : d3.event.clientY-175;

    d3.select(".infolabel")
        .style({
            "left": x + "px",
            "top": y + "px"
        });
};

function createDescriptions(csvData) {

    descriptionDiv = d3.select("body")
        .append("div")
        .attr("class", "descriptionDiv");

    updateDescriptions(csvData);
};

function updateDescriptions(csvData) {

 var descriptionTitle = descriptionDiv.html(function(d) {
            if (expressed == "Population exposed to PM2.5 air pollution") { return title_PM+"<br>" ;}
            else if (expressed == "Cigarettes consumptions") { return title_Cigarettes+"<br>"; }
            else if (expressed == "Life expentancy at birth") { return title_Life+"<br>"; }
            else if (expressed == "Diabetes prevalence") { return title_Diabetes+"<br>"; }
            else if (expressed == "Access to improved water source") { return title_Water+"<br>"; } 
        })
        .attr("class", "descriptionTitle");

    var description = descriptionDiv.append("text")
        .html(function(d) { 
            if (expressed == "Population exposed to PM2.5 air pollution") { return desc_PM; }
            if (expressed == "Cigarettes consumptions") { return desc_Cigarettes; }
            if (expressed == "Life expentancy at birth") { return desc_Life; } 
            if (expressed == "Diabetes prevalence") { return desc_Diabetes; }
            if (expressed == "Access to improved water source") { return desc_Water; } 
        })
        .attr("class", "description");
};

function about() {

    var about = d3.select("body")
        .append("div")
        .attr("class", "about")
       
        .append("div")
        .html(
            "This is a map showing health situations by countries. I picked five variables to depict health.")
        .attr("class", "aboutText");

    var sources = d3.select(".about")
        .append("text")
        .html(
            "<sup>[1]</sup>Data for cigarettes consumptions is from the <a href='http://www.tobaccoatlas.org/topic/cigarette-use-globally/'>The Tobacco Atlas</a>. "+" All other data is from the <a href='http://data.worldbank.org/indicator' target='_blank'>World Bank</a>"+"<br> This project is inspired by <a href = 'http://tolomaps.com/motherhood/'>Modern Motherhood</a> created by  Robin Tolochko.")
        .attr("class", "sources")
};



})();