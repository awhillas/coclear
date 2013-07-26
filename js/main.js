/*
	CoClear LCA data processing
	
	This is the common LCA data parsing, scrubing and formating 
*/
// Define the CoClear namespace as per Enterprise jQuery site
// http://stackoverflow.com/a/5947280/196732
(function( CC, $, undefined) {
	
	// Public / / / / / / / / / / / / / / / / / / / /

	// Remote LCA CSV source
	//CC.dataURL = "https://docs.google.com/spreadsheet/pub?key=0AjthvtYrD2MfdEtZS2ZOMXlrbXVqTm4tMUUzVDhOeFE&single=true&gid=1&output=csv";
	CC.dataURL = "bnj-lca-2013-07-26.csv";
	
	// Store scrubbed CSV data
	CC.cleanData = false;
	
	CC.totalUnitsSold = 2340000;
	
	CC.costOfCarbon = 24.15 / 1000000;

	// Colours we'll use across all the charts for the 9 stages.
	CC.colours = d3.scale.ordinal()
		.range([
			"#ffeda0",
			"#feb24c",
			"#f03b20",
			"#dd1c77",
			"#756bb1",
			"#08519c",
			"#41b6c4",
			"#74c476",
			"#636363"
		]);

	// Public methods / / / / / / / / / / / / / / / /

	CC.init = function() {
		// Load CSV data and scrub it.
		d3.csv(CC.dataURL, function(error, data) {
			if(error)
				return log(error);
			CC.cleanData = cleanData(data);
			// Call a page Initialisation funciton if its defined.
			if(CC.pageInit !== undefined) {
				CC.pageInit();
			}
		})
	};
	
	// Abbreviate long number to given decimal places
	// n = nummber to format
	// d = nummber of decimal places
	// see: http://stackoverflow.com/a/2693772/196732
	CC.abbrNumber = function (n, d) {
		var p = Math.pow,
			d = p(10,d),
			i = 7
		;
		while(i)
			(s = p(10, i --* 3)) <= n && (n = Math.round(n * d / s) / d + "kMGTPE"[i]);

		return n
	}
	
	// Checks if we have a number, works on strings and real numbers.
	CC.isNumber = function(n) {
		return !isNaN(parseFloat(n)) && isFinite(n)
	}

	// Round number to 2 decimal places
	CC.round = function(number) {
		return Math.round(number * 100) / 100;
	}

	// Private methods / / / / / / / / / / / / / / / /

	// Scrub the data a little.
	function cleanData(data) {
		// Columns to parse to Float
		columns = ['Amount per FU', 'EF', 'GHG [gram CO2e]'];

		_.each(data, function(row, i) {
			// Convert Strings to Floats
			_.each(columns, function(col) {
				data[i][col] = parseFloat(data[i][col])
			});
			// Parse the Stage value (first 2 chars)
			data[i]['stage'] = data[i]['LCA stage'].substr(0, 2).toLowerCase();
			// Calc carbon cost
			data[i]['cost'] = parseFloat(data[i]['Expense'].substr(1));
		});
		return CC.cleanData = data
	};
	
	/* 
		Parttition data by Stages.
		Returns and object in the format:
		{
			name: "LCA", 
			childern: [
				{ 
					name: "s1", 
					childern: [
						{ name: "Plastics", value: 0.12 },
						{ name: "Petrol", value: 2.34 } 
						{ name: "Milk", value: 234.34 }
					] 
				},
				{ name: "s2", children: [ ... ] },
				...
			]
		}
		Where "value" is the "GHG [gram CO2e]" emissions level.
	*/
	CC.partitionData = function(data) {
		var out = { name: "LCA", children: [], totals: { ghg: 0, expense: 0, amount: 0 } }
			, currentStage = { name: null }
		;
		_.each(data, function(el, i) {
			// Start next stage
			if(el.stage !== currentStage.name) {
				if(currentStage.name !== null)
					out.children.push(currentStage);
				
				currentStage = { 
					name: el.stage,
					stageName: el["LCA stage"],
					children: [],
					sum: { ghg: 0, expense: 0, amount: 0 }
				};
			}
			// push to current.
			currentStage.children.push({ 
				name: el["Contribution"], 
				value: el["GHG [gram CO2e]"],
				data: el
			});
			// Totals for each stage.
			with(currentStage.sum) {
				ghg += el["GHG [gram CO2e]"];
				expense += el.cost;
			}
			// Totals for all stages
			with(out.totals) {
				amount += el["Amount per FU"];
				ghg += el["GHG [gram CO2e]"];
				expense += el.cost;
			}
		});
		out.children.push(currentStage);
		// mustache.js formating function
		out.round = function(){
			return function(text, render) {
				return parseFloat(render(text)).toFixed(2).toString();
			}
		};
		return out
	};


}( window.CC = window.CC || {}, jQuery));


jQuery(document).ready(CC.init);
