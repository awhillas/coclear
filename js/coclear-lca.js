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

		pieChart(d3.select("#PIE-CHART"), CC.prtnData);
		emissonsChart(d3.select("#EMISSIONS-CHART"), CC.cleanData);
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

	function legend(chart, data, width) {
		
		var legend = chart.append("g")
			.attr("class", "legend")
			.attr("x", 0)
			.attr("y", 0)
			.attr("height", 100)
			.attr("width", 100)
			.attr("stroke", "black")
		;
		legend.selectAll('g').data(data)
			.enter().append('g')
				.each(function(d, i) {
					var g = d3.select(this);
					g.append("rect")
						.attr({
							x: width - 65,
							y: i * 20,
							width: 10,
							height: 10,
							fill: CC.colours(i)
						}) 
					;
					g.append("text")
						.attr("x", width - 50)
						.attr("y", i * 20 + 10)
						.attr("height", 14)
						.attr("width", 100)
						.style("fill", "black")
						.text(function(d,i){ return d.stageName });
				});
		return legend
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

	// Draw Pie Chart
	function pieChart(chart, data) {

		var width = 700,
			height = width,
			radius = Math.min(width, height) / 2.5,
			color = CC.colours; //d3.scale.category20c(),
			duration = 1000;
		// Tooltip(s)
		var tooltip = d3.select("body").append("div")
			.attr("class", "Tooltip")
			.style("opacity", 0);

		var svg = chart.append("svg")
			.attr("width", width)
			.attr("height", height)
			.attr("class", "Pie")
		;
		
		var pie = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height * .52 + ")");

		var partition = d3.layout.partition()
			.sort(null)
			.size([2 * Math.PI, radius * radius])
		;
		var arc = d3.svg.arc()
			.startAngle(function(d) { return d.x; })
			.endAngle(function(d) { return d.x + d.dx; })
			.innerRadius(function(d) { return Math.sqrt(d.y); })
			.outerRadius(function(d) { return Math.sqrt(d.y + d.dy); })
		;
		var path = pie.datum(data).selectAll("path")
				.data(partition.nodes)
			.enter().append("path")
				.attr("display", function(d) { return d.depth ? null : "none"; }) // hide inner ring
				.attr("d", arc)
//				.attr("class", (d.children ? d : d.parent).name)	// no working?
				.style("stroke", "#fff")
				.style("fill", function(d) {
					var index = (d.children ? d : d.parent).name.substr(1);
					if( CC.isNumber(index) ) {
						return color(index);
					}
				})
				.style("fill-rule", "evenodd")
				// Tooltips...
				.on("mouseover", function(d) {
					var text = "";
					// Tooltips text...
					if(d.stageName) {
						text = "LCA Stage: " + d.stageName + "<br>"
							+ "GHG total: " + CC.round(d.sum.ghg) + "g CO2e/unit (" + CC.round(d.sum.ghg / d.parent.totals.ghg * 100) + "% g CO2e)"
						;
					} else if(d.name !== "LCA") {
						text = d.name + "<br>"
							+ "GHG: " + d.data["GHG [gram CO2e]"] + "g CO2e/unit ("
								+ CC.round(d.value / d.parent.parent.totals.ghg * 100) + "%) <br>"
							+ "Cost: $" + d.data.cost.toFixed(2)
								+ " (" + CC.round(d.data.cost / d.parent.parent.totals.expense * 100) + "%)"
						;
					}
					tooltip.transition()
						.duration(500)
						.style("opacity", 0.9);
					tooltip.html(text)
						.style("left", (d3.event.pageX) + "px")
						.style("top", (d3.event.pageY - 28) + "px");
				})
				.on("mouseout", function(d) {
					tooltip.transition()
						.duration(500)
						.style("opacity", 0);
				})
		;
		// legend(svg, data.children, width)
		// 	.attr("transform", "translate(" + -200  + "," + 20 + ")");
		htmlLegend("#PIE-CHART");
	};

	// Draw SVG Chart
	function emissonsChart(chart, data) {

		var margin = {top: 10, right: 0, bottom: 30, left: 40},
			width = 700 - margin.left - margin.right,
			bar_width = Math.round(width / data.length),
			height = 400 - margin.top - margin.bottom
			ticks = 10
		;
		// Scale functions
		var x = d3.scale.linear()
			.domain([0, data.length])
			.range([0, width])
		;
		var y = d3.scale.log()
			.domain([0.001, d3.max(data, function(d){ return d['GHG [gram CO2e]'] })]) // bottom value must be > 0 for log() scale
			.range([0, height])
//			.range([height, 0])
		;
		var formatInt = d3.format("d");
		var yAxis = d3.svg.axis()
			.scale(y)
			.orient("left")
			.ticks(ticks, function(d, i) { return formatInt(d) })
		;

		// SVG element
		var svg = chart.append("svg")
			.attr("class", "chart")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
		;
		// svg.append("g")
		// 	.attr("class", "x axis")
		// 	.attr("transform", "translate(0," + height + ")")
		// ;
		
		// svg.append("g")
		// 	.attr("class", "y axis")
		// 	.call(yAxis)
		// ;
		//grid lines
		// svg.selectAll(".grid")
		// 	.data(y.ticks(ticks))
		// .enter().append("line")
		// 	.attr("class", "grid")
		// 	.attr("y1", y)
		// 	.attr("y2", y)
		// 	.attr("x1", 0)
		// 	.attr("x2", width)
		// 	.style("stroke", "#ddd")
		// ;
		// .. labels

		// Bars

		// have to reverse this as the axis labels use it the other way around
		y.range([1, height]);

		svg.selectAll("rect")
			.data(data)
		.enter().append("rect")
			.attr({
				  class: function(d,i) { return "Bar" }
				, x: function(d,i) { return x(i) - 0.5 }
				, y: function(d) { return height - y(d['GHG [gram CO2e]']) - 0.5}
				, fill: function(d,i){ return CC.colours(d.stage.substr(1)) }
			})
			.attr("width", bar_width)
			.attr("height", function(d) { return y(d['GHG [gram CO2e]']) })
			// Tool Tips on Bars
			.append("svg:title")
			   .text(function(d) { return d['Contribution'] + " : " + d["GHG [gram CO2e]"] + " GHG [gram CO2e]"; });
		;
		// Tool tips popup
		$("svg rect.Bar").tipsy({
			gravity: 'w',
			html: true,
			title: function() {
				var d = this.__data__;
				return d['Contribution'] + " : \n" + d["GHG [gram CO2e]"] + " GHG [gram CO2e]";
			}
		});
		htmlLegend("#EMISSIONS-CHART");
	};


}( window.CC = window.CC || {}, jQuery));
