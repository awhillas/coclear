window.log = function f(){ log.history = log.history || []; log.history.push(arguments); if(this.console) { var args = arguments, newarr; args.callee = args.callee.caller; newarr = [].slice.call(args); if (typeof console.log === 'object') log.apply.call(console.log, console, newarr); else console.log.apply(console, newarr);}};
(function(a){function b(){}for(var c="assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn".split(","),d;!!(d=c.pop());){a[d]=a[d]||b;}})
(function(){try{console.log();return window.console;}catch(a){return (window.console={});}}());

// Get the JSON Data

$.getJSON('/data.json', function(json) {
//log(json.feed);

	// Clean data: make sure all rows have a 
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

	var w = 10,	// width of a bar/column
		l = data.length,
		h = 300
	;
	// Base element
	var chart = d3.select("body").append("svg")
		.attr("class", "chart")
		.attr("width", w * l - 1)
		.attr("height", h)
	;
	// Scales
	var x = d3.scale.linear()
		.domain([0, 1])
		.range([0, w])
	;
	var y = d3.scale.sqrt()
		.domain([0, d3.max(data)])
		.range([0, h])
	;
	// Axis'
	chart.selectAll("line")
		.data(y.ticks(10))
	.enter().append("line")
		.attr("y1", y)
		.attr("y2", y)
		.attr("x1", 0)
		.attr("x2", w * l)
		.style("stroke", "#ddd")
	;

	// create the bars
	chart.selectAll("rect")
		.data(data)
	.enter().append("rect")
		.attr("x", function(d,i) { return x(i) - 0.5 })
		.attr("y", function(d) { return h - y(d) - 0.5 })
		.attr("width", w)
		.attr("height", function(d) { return y(d) })
	;
})


