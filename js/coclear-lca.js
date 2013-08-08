/*
	CoClear LCA visualisations

	Required: d3.js, underscore.js, jQuery.js
*/
(function( CC, $, undefined) {

	// Partition data for Starburts tree diagram.
	CC.prtnData = false;

	// Page specific initialisation
	CC.pageInit = function() {

		$("#TABS").tabs({ active: 0 });

		CC.prtnData = CC.partitionData(CC.cleanData);
//log(CC.prtnData);
		// Render the various tabs...
		listView();
		fullLCA();
		$( "#LIST-VIEW" ).accordion({ heightStyle: "content", collapsible: true, active: false });
		
		starBurstChart(d3.select("#PIE-CHART"), CC.prtnData);
		emissionsFactorChart(d3.select("#EF-CHART"), CC.cleanData);
//		pieChart(d3.select("#PIE-CHART"), CC.prtnData);
//		emissonsChart(d3.select("#EMISSIONS-CHART"), CC.cleanData);
	};

	// Render the List view chart via Mustache
	function listView(){
		var   data = CC.prtnData
			, template = $("#listViewTemplate").html()
			, rendering = Mustache.to_html(template, data)
		;
		$("#LIST-VIEW").html(rendering);
	}

	function fullLCA(){
		var data = CC.prtnData
			, template = $("#fullLCA").html()
			, rendering = Mustache.to_html(template, data);
		$("#FULL-LCA").html(rendering);
	}

	// HTML version of the legend.
	// Since the Stage names are long and we need word wrapping
	function htmlLegend(id) {
		var data = CC.prtnData
			, template = $("#legendTemplate").html()
			, rendering = Mustache.to_html(template, data)
		;
		$(id).append(rendering);
	}

	/*
		see: http://bl.ocks.org/mbostock/4063423
	*/
	function starBurstChart(chart, data) {
		var width = 650,
			height = width,
			box_width = 200,
			box_height = 200,
			radius = Math.min(width, height) / 2.5,
			color = CC.colours, //d3.scale.category20c(),
			duration = 1000,
			padding = 5
		;
		var x = d3.scale.linear()
			.range([0, 2 * Math.PI])
		;
		var y = d3.scale.sqrt()
			.range([0, radius])
		;
		var svg = chart
			.append("svg")
				.attr("width", width)
				.attr("height", height)
				.attr("class", "Pie")
			.append("g")
			    .attr("transform", "translate(" + radius + "," + height * .52 + ")");
		;
		var partition = d3.layout.partition()
			.sort(null)
			.value(function(d) { return d.data["GHG [gram CO2e]"]; })
		;
		var arc = d3.svg.arc()
			.startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
			.endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
			.innerRadius(function(d) { return Math.max(0, y(d.y)); })
			.outerRadius(function(d) { return Math.max(0, y(d.y + d.dy)); })
		;
		var path = svg.selectAll("path").data(partition.nodes(data))
			.enter().append("path")
				.attr("d", arc)
				.style("fill", function(d) { return color((d.children ? d : d.parent).name); })
				.on("click", click)
				.on("mouseover", function(d){ show("#PIE-TOOLTIP", event, d) })
				.on("mouseout", function(){ d3.select("#PIE-TOOLTIP").style("visibility", "hidden") })
				.on("mousemove", function(){ d3.select("#PIE-TOOLTIP").style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px") })
		;
		d3.select(self.frameElement).style("height", height + "px");
		// Center white
		jQuery("#PIE-CHART.Chart svg g path:first-child").css("fill", "#fff");		

		function click(d) {
			path.transition()
				.duration(duration)
				.attrTween("d", arcTween(d));

		}		
		// Interpolate the scales!
		function arcTween(d) {
			var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
				yd = d3.interpolate(y.domain(), [d.y, 1]),
				yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius])
			;
			return function(d, i) {
				return i
					? function(t) { return arc(d); }
					: function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); return arc(d); };
			};
		}
		function show(id, event, d) {
			// TODO: The totals/sum should be the same at all levels
			if(!d.parent) {
				// Shallow copy
				var display = jQuery.extend({}, d.totals);
				display.title = "LCA Totals"
			} else if(d.stageName) {
				var display = jQuery.extend({}, d.sum);
				display.title = d.stageName
			} else {
				var display = {
					title: d.name,
					expense: d.data.cost,
					ghg: d.data["GHG [gram CO2e]"]
				}
			}
			populateToolTip(id, event, display);
		}
		htmlLegend("#PIE-CHART");	
	}

	function emissionsFactorChart(chart, data) {	
		var width = 650,
			height = 500,
			pad = 20,
			left_pad = 100,
			ticks = 50,
			color = CC.colours,
			lower_limit = 0.001,
			tooltip = d3.select("#EF-TOOLTIP")
		;
		// Sort Data. Big ones first by cost.
		data.sort(function(a,b) { return b.cost - a.cost });

		// Scale functions
		var x = d3.scale.log()
			.domain([lower_limit, d3.max(data, function(d){ return d['EF'] })])
			.range([left_pad, width - pad])
		;
		var y = d3.scale.log()
			// bottom value must be > 0 for log() scale
			//.domain([0.001, d3.max(data, function(d){ return d['GHG [gram CO2e]'] })]) 
			.domain([d3.max(data, function(d){ return d['GHG [gram CO2e]'] }), lower_limit]) 
			.range([pad, height - pad * 2])
		;
		var cost = d3.scale.linear()
			.domain([lower_limit, d3.max(data, function(d){ return d['cost'] })])
			.range([1, 50])	// 50 seems good. Perhaps should be a % of total area.

		//Create SVG element
		var svg = chart
			.append("svg")
			.attr("width", width)
			.attr("height", height)
		;
		
		// Axis' - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
		
		var formatInt = d3.format("d");
		var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(20, function(d, i) { return formatInt(d) }),
		    yAxis = d3.svg.axis().scale(y).orient("left").ticks(10, function(d, i) { return formatInt(d) });
		var axisX = svg.append("g")
			.attr("class", "axis")
			.attr("transform", "translate(0, "+(height - pad)+")")
			.call(xAxis);
		var axisY = svg.append("g")
			.attr("class", "axis")
			.attr("transform", "translate("+(left_pad - pad)+", 0)")
			.call(yAxis);
		// Lables (see: http://stackoverflow.com/questions/11189284/d3-axis-labeling)
		svg.append("text")
			.attr("class", "X Label")
			.attr("text-anchor", "end")
			.attr("x", "70%")
			.attr("y", height + pad)
			.text("Emmisions Factor [kg CO2/Unit]");
		svg.append("text")
			.attr("class", "Y Label")
			.attr("text-anchor", "end")
			.attr("x", "-20%")
			.attr("y", pad)
			.attr("dy", ".75em")
			.attr("transform", "rotate(-90)")
			.text("GHG [gram CO2e]");

		// Data - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
		
		svg.selectAll("circle")
		   .data(data)
		   .enter()
			   .append("circle")
					.attr("cx",	function(d) { return x(d['EF']); })
					.attr("cy",	function(d) { return y(d['GHG [gram CO2e]']) })
					.attr("r",	function(d) { return cost(d.cost) })
					.attr("fill", function(d,i) { return CC.colours(d.stage.substr(1)) })
					.on("mouseover", function(d){ show("#EF-TOOLTIP", event, d) })
					.on("mouseout", function(){ tooltip.style("visibility", "hidden") })
					.on("mousemove", function(){ tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px") })					
		;

		// Translate the data, d, into standard interface for the tooltip
		function show(id, event, d) {
			var display = {
				title: d.Contribution,
				expense: d.cost,
				ghg: d["GHG [gram CO2e]"],
				stage: d.stage,
				ef: d.EF
			}
			populateToolTip(id, event, display);
		}
		htmlLegend("#EF-CHART");
	}
	// Tooltip: Fill in the given details for the given tool tip id
	function populateToolTip(id, event, d) {
		var tooltip = d3.select(id)
			.style("visibility", "visible")
			.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px")
		;
		for(var i in d) {
			d3.select(id + " ." + capitaliseFirstLetter(i) + " .Value").text(isNumber(d[i]) ? CC.round(d[i]) : d[i]);
		}
	}
	function capitaliseFirstLetter(string)
	{
		return string.charAt(0).toUpperCase() + string.slice(1);
	}
	function isNumber(n) {
		return !isNaN(parseFloat(n)) && isFinite(n);
	}
	function findCenter(path) {
		var bbox = p.getBBox(); // Get bounding Box
		var x = Math.floor(bbox.x + bbox.width/2.0); 
		var y = Math.floor(bbox.y + bbox.height/2.0);
		return {"x": x, "y": y};
	}

}( window.CC = window.CC || {}, jQuery));
