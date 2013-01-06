window.log = function f(){ log.history = log.history || []; log.history.push(arguments); if(this.console) { var args = arguments, newarr; args.callee = args.callee.caller; newarr = [].slice.call(args); if (typeof console.log === 'object') log.apply.call(console.log, console, newarr); else console.log.apply(console, newarr);}};
(function(a){function b(){}for(var c="assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn".split(","),d;!!(d=c.pop());){a[d]=a[d]||b;}})
(function(){try{console.log();return window.console;}catch(a){return (window.console={});}}());

// Get the JSON Data

$.getJSON('/data.json', function(json) {
//log(json.feed);


	// Clean data - - - - - - - - - - - - - - - - - - - - - - - - //
	// make sure all rows have a stage
	var stages_list = [], 
		current = 0
	;
	for(i in json.feed.entry) {
		var stage = json.feed.entry[i]["gsx$thesecolumnsarefilledduringhw04parta"]["$t"];
		if(stage) {
			current = stages_list.push(stage);
		} else {
			json.feed.entry[i]["gsx$thesecolumnsarefilledduringhw04parta"]["$t"] = stages_list[current - 1];
		}
	}
	stages_list.shift(); // remove some junk.
	// JSONPath to get the data we want
	var data = jsonPath(json, "$.feed.entry..[1:].gsx$_cssly.$t");
	for(i in data) data[i] = parseFloat(data[i]); 	// scrub-a-dub-dub: clean data
log(data);


	// Draw SVG Chart - - - - - - - - - - - - - - - - - - - - - //

	var margin = {top: 10, right: 0, bottom: 30, left: 40},
		width = 800 - margin.left - margin.right,
		bar_width = Math.round(width / data.length),
		height = 400 - margin.top - margin.bottom
		ticks = 10
	;
	// Scale functions
	var x = d3.scale.linear()
		.domain([0, data.length])
		.range([0, width])
	;
	var y = d3.scale.log().clamp(true)
		.domain([0.1, d3.max(data)]) // bottom value must be > 0 for log() scale
//		.range([0, height])
		.range([height, 0])
	;
	// var xAxis = d3.svg.axis()
	// 	.scale(x)
	// 	.orient("bottom")
	// ;
	var formatInt = d3.format("d");
	var yAxis = d3.svg.axis()
		.scale(y)
		.orient("left")
		.ticks(ticks, function(d, i) { return formatInt(d) })
	;
	
	// SVG element
	var chart = d3.select("body").append("svg")
		.attr("class", "chart")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
	;
	chart.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
//		.call(xAxis)
	;
	chart.append("g")
		.attr("class", "y axis")
		.call(yAxis)
	;
	//grid lines
	chart.selectAll(".grid")
		.data(y.ticks(ticks))
	.enter().append("line")
		.attr("class", "grid")
		.attr("y1", y)
		.attr("y2", y)
		.attr("x1", 0)
		.attr("x2", width)
		.style("stroke", "#ddd")
	;
	// .. labels
	
	// Bars
	
	// have to reverse this as the axis labels use it the other way around
	y.range([0, height]); 	
	
	chart.selectAll("rect")
		.data(data)
	.enter().append("rect")
		.attr("x", function(d,i) { return x(i) - 0.5 })
		.attr("y", function(d) { return height - y(d) - 0.5})
		.attr("width", bar_width)
		.attr("height", function(d) { return y(d) })
	;
})


