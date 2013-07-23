/*
	CoClear Overview page
*/
(function( CC, $, undefined) {

	// Summary of data.
	CC.sumData = false;

	// Page specific initialisation
	CC.pageInit = function() {		
		CC.sumData = CC.summaries(CC.cleanData);
		populateOverview();
		createYearBarCharts();
		// Update the view when a diffrent granulaity is selected.
		$("#GRANULARITY").change(populateOverview);
	}
	
	// LCA data totals:
		// Solid waste = Sum all Stage 8 messured in grams
		// Energy used = Sum all Stages in kWh.
		// GHG emissions = Sum all GHG values.
	CC.summaries = function(data) {
		
		var out = { Waste: { unit: "grams"}, Energy: { unit: "kWh"}, Emissions: { unit: "gram CO2e"} };
		
		_.each(out, function(item, key) {
			out[key].Total = 0;
			out[key].TotalCost = 0;
		});
		
		_.each(data, function(row, i) {
			
			var expense = row.cost; // parseFloat(row["Expense"].substr(1));
			
			// Solid waste
			if(row.stage === "s8" && row["contribution unit"] === $.trim("grams")) {
				with(out.Waste){
					Total += row["Amount per FU"];
					TotalCost += expense;
				} 
			}
				
			// Energy used
			if(row["contribution unit"] === $.trim("kWh")) {
				with(out.Energy) {
					Total += row["Amount per FU"];
					TotalCost += expense;
				}
			}
				
			// Carbon
			with(out.Emissions) {
				Total += row["GHG [gram CO2e]"];
				TotalCost += expense;
			}
		});
		// Rounding
		_.each(out, function(item, key) {
			out[key].Total = CC.round(out[key].Total);
			out[key].TotalCost = CC.round(out[key].TotalCost);
		});
		
		return out
	}
	
	
	// PRIVATE / / / / / / / / / / / / / / / / / / / / /
	
	function populateOverview() {
		// Are we per/unit or Total for whole years sales?
		switch($("#GRANULARITY").val()) { 
			case 'annual': 
				var multiplier = CC.totalUnitsSold;
				break;
			case 'thousand':
				var multiplier = 1000;
				break
			case 'unit':
			default:
				var multiplier = 1;
		};
		// Loop thought and populate the table. Perhaps this would be better in a Mustache template?
		_.each(CC.sumData, function(datum, key) {
			_.each(datum, function(value, subkey) {
				if(_.isNumber(value)) {
					var rounded = (multiplier > 1)
							? CC.abbrNumber(value * multiplier, 2)	// big numbers
							: !_.isNumber(value) || (Math.round(value * 100) / 100).toFixed(2), // small numbers
						unit = (subkey == "TotalCost")? "$ ": datum.unit
					;
					$("#SUMMARY ." + key + " ." + subkey).text((unit === "$ ")? unit + rounded: rounded + unit);
				}
			})
		})
		// Total Units sold
		$("#SUMMARY .Sales span.Total").text(CC.abbrNumber(CC.totalUnitsSold, 2));
	}
	
	function createYearBarCharts() {
		var maxCO2 = Math.max.apply(null, $('#YEAR-BARS .aYear .co2').map(function(i, el) { return parseFloat($(el).text()) }));
		$("#YEAR-BARS .aYear").each(function(){
			var ghgRatio = parseFloat($(".co2", this).text()) / maxCO2,
				length = $(".Bar", this).innerWidth(),
				bars = ""
			;
			log(length);
			for(var i = 1; i <= 9; i++) {
				bars += '<div class="BarSegment s' + i + '" style="width:' + length / 10 * ghgRatio + 'px"></div>';
			}
			$(".Bar", this).html(bars)
		})
	}

}( window.CC = window.CC || {}, jQuery));
