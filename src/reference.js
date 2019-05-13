//https://sveasolar.se/wp-content/themes/xpro-child/calculator/js/app.js?ver=1.0.30
var mobileMarker = null;
var polygonMap = null;
var mapInfoWindow = null;
var drawingManager = null;
var map = null;
var tmpBgImage = null;
var form_is_completed = false;

var userData = {
	area: 0,
  	slope: 0,
  	energy: 0,
  	direction: 'S',
  	charger: 0,
  	battery: 0,
  	paymentType: null,
  	panelType: null,

	daysToInstall: function() {
	    return Math.round(this.area / 25);
	},
	totalCost: function() {
		var intCost = this.area/1.7;
		if(this.panelType == "Premium") {
			intCost = Math.round((intCost*3+30-(0.1*(Math.pow(intCost,1.2))))*875);
		} else if(this.panelType == "Standard") {
			intCost = Math.round((intCost*2.6+34-(0.1*(Math.pow(intCost,1.2))))*875);
		} else {
			intCost = Math.round((intCost*5+40-(0.1*(Math.pow(intCost,1.2))))*875);
		}

		if(this.charger == 1) {
			intCost += 7000;
		}

		if(this.battery == 1){
			intCost += 33200;
		}

		if(this.paymentType == "Loan") { 
			intCost = Math.round(intCost * 0.01);
		}
		return intCost;
	  
	},
	paybackYears: function() {
		var tmp = (this.totalCost() * 0.9);
		if(this.panelType == "Premium") {
			tmp = tmp / ((this.area / 1.7) * 300);
		} else {
			tmp = tmp / ((this.area / 1.7) * 285);
		}

		if(this.slope > 10 && this.slope <= 31) {
			tmp = tmp * 1.05;
		} else if(this.slope < 11) {
			tmp = tmp * 1.08;
		}

		if(this.direction == 'SE' || this.direction == "SW") {
			tmp = tmp / 0.92;
		} else {
			tmp = tmp / 0.88;
		}
		
		if(this.paymentType == "Loan") {
			tmp = tmp * 120;
		}
		let formated = (Math.round(tmp * 10) / 10);
		return formated;
	},
	savingsPerYear: function() {
		var cost = this.totalCost();
		var tmp = cost * 0.9;

		if(this.panelType == "Premium") {
			tmp = tmp / ((this.area / 1.7) * 300);
		} else {
			tmp = tmp / ((this.area / 1.7) * 285);
		}

		if(this.slope > 10 && this.slope <= 31) {
			tmp = tmp * 1.05;
		} else if(this.slope < 11) {
			tmp = tmp * 1.08;
		}
		if(this.direction == 'SE' || this.direction == "SW") {
			tmp = tmp / 0.92;
		} else {
			tmp = tmp / 0.88;
		}
		tmp = cost / tmp;
		return Math.round(tmp);
	},
	bathsOfOil: function() {
		var baths = Math.round((this.kwhSaved() / 600) * 30);
	    return baths;
	},
	kwhSaved: function() {
		var savings = Math.round(this.savingsPerYear() * 0.9);
	    let formated = (Math.round(savings / 10) * 10);
	    return formated;
	}
};
var mainBackground = document.getElementById('solar-calc-left-column');
var detailsMobBackground = document.getElementById('details-page-mob-bg');

//Create image instances for preload and faster switch

/*
	Naked imgs (No panels, batteries and chanrgers)
	Images used in Slope and KWH page
*/
var house_10deg_0kwh_clean = new Image();
house_10deg_0kwh_clean.src = 'https://www.sveasolar.se/wp-content/themes/xpro-child/calculator/imgs/houses/10deg/house-10deg-0kwh-clean.jpg?v=1.1';
var house_30deg_0kwh_clean = new Image();
house_30deg_0kwh_clean.src = 'https://www.sveasolar.se/wp-content/themes/xpro-child/calculator/imgs/houses/30deg/house-30deg-0kwh-clean.jpg?v=1.1';
var house_50deg_0kwh_clean = new Image();
house_50deg_0kwh_clean.src = 'https://www.sveasolar.se/wp-content/themes/xpro-child/calculator/imgs/houses/50deg/house-50deg-0kwh-clean.jpg?v=1.1'; 

var house_10deg_10kwh_clean = new Image();
house_10deg_10kwh_clean.src = 'https://www.sveasolar.se/wp-content/themes/xpro-child/calculator/imgs/houses/10deg/house-10deg-10kwh-clean.jpg?v=1.1';
var house_30deg_10kwh_clean = new Image();
house_30deg_10kwh_clean.src = 'https://www.sveasolar.se/wp-content/themes/xpro-child/calculator/imgs/houses/30deg/house-30deg-10kwh-clean.jpg?v=1.1';
var house_50deg_10kwh_clean = new Image();
house_50deg_10kwh_clean.src = 'https://www.sveasolar.se/wp-content/themes/xpro-child/calculator/imgs/houses/50deg/house-50deg-10kwh-clean.jpg?v=1.1'; 

var house_10deg_15kwh_clean = new Image();
house_10deg_15kwh_clean.src = 'https://www.sveasolar.se/wp-content/themes/xpro-child/calculator/imgs/houses/10deg/house-10deg-15kwh-clean.jpg?v=1.1';
var house_30deg_15kwh_clean = new Image();
house_30deg_15kwh_clean.src = 'https://www.sveasolar.se/wp-content/themes/xpro-child/calculator/imgs/houses/30deg/house-30deg-15kwh-clean.jpg?v=1.1';
var house_50deg_15kwh_clean = new Image();
house_50deg_15kwh_clean.src = 'https://www.sveasolar.se/wp-content/themes/xpro-child/calculator/imgs/houses/50deg/house-50deg-15kwh-clean.jpg?v=1.1';

var house_10deg_20kwh_clean = new Image();
house_10deg_20kwh_clean.src = 'https://www.sveasolar.se/wp-content/themes/xpro-child/calculator/imgs/houses/10deg/house-10deg-20kwh-clean.jpg?v=1.1';
var house_30deg_20kwh_clean = new Image();
house_30deg_20kwh_clean.src = 'https://www.sveasolar.se/wp-content/themes/xpro-child/calculator/imgs/houses/30deg/house-30deg-20kwh-clean.jpg?v=1.1';
var house_50deg_20kwh_clean = new Image();
house_50deg_20kwh_clean.src = 'https://www.sveasolar.se/wp-content/themes/xpro-child/calculator/imgs/houses/50deg/house-50deg-20kwh-clean.jpg?v=1.1';


/*
	Result page images
	Images combining everything exept KWH
*/
//Standard panels
//10deg
var house_10deg_0kwh_standard_clean = new Image();
house_10deg_0kwh_standard_clean.src = 'https://www.sveasolar.se/wp-content/themes/xpro-child/calculator/imgs/houses/10deg/house-10deg-0kwh-standard-clean.jpg?v=1.1';
var house_10deg_0kwh_standard_battery = new Image();
house_10deg_0kwh_standard_battery.src = 'https://www.sveasolar.se/wp-content/themes/xpro-child/calculator/imgs/houses/10deg/house-10deg-0kwh-standard-battery.jpg?v=1.1';
var house_10deg_0kwh_standard_charger = new Image();
house_10deg_0kwh_standard_charger.src = 'https://www.sveasolar.se/wp-content/themes/xpro-child/calculator/imgs/houses/10deg/house-10deg-0kwh-standard-charger.jpg?v=1.1';
var house_10deg_0kwh_standard_charger_battery = new Image();
house_10deg_0kwh_standard_charger_battery.src = 'https://www.sveasolar.se/wp-content/themes/xpro-child/calculator/imgs/houses/10deg/house-10deg-0kwh-standard-charger-battery.jpg?v=1.1';
//30deg
var house_30deg_0kwh_standard_clean = new Image();
house_30deg_0kwh_standard_clean.src = 'https://www.sveasolar.se/wp-content/themes/xpro-child/calculator/imgs/houses/30deg/house-30deg-0kwh-standard-clean.jpg?v=1.1';
var house_30deg_0kwh_standard_battery = new Image();
house_30deg_0kwh_standard_battery.src = 'https://www.sveasolar.se/wp-content/themes/xpro-child/calculator/imgs/houses/30deg/house-30deg-0kwh-standard-battery.jpg?v=1.1';
var house_30deg_0kwh_standard_charger = new Image();
house_30deg_0kwh_standard_charger.src = 'https://www.sveasolar.se/wp-content/themes/xpro-child/calculator/imgs/houses/30deg/house-30deg-0kwh-standard-charger.jpg?v=1.1';
var house_30deg_0kwh_standard_charger_battery = new Image();
house_30deg_0kwh_standard_charger_battery.src = 'https://www.sveasolar.se/wp-content/themes/xpro-child/calculator/imgs/houses/30deg/house-30deg-0kwh-standard-charger-battery.jpg?v=1.1';
//50deg
var house_50deg_0kwh_standard_clean = new Image();
house_50deg_0kwh_standard_clean.src = 'https://www.sveasolar.se/wp-content/themes/xpro-child/calculator/imgs/houses/50deg/house-50deg-0kwh-standard-clean.jpg?v=1.1';
var house_50deg_0kwh_standard_battery = new Image();
house_50deg_0kwh_standard_battery.src = 'https://www.sveasolar.se/wp-content/themes/xpro-child/calculator/imgs/houses/50deg/house-50deg-0kwh-standard-battery.jpg?v=1.1';
var house_50deg_0kwh_standard_charger = new Image();
house_50deg_0kwh_standard_charger.src = 'https://www.sveasolar.se/wp-content/themes/xpro-child/calculator/imgs/houses/50deg/house-50deg-0kwh-standard-charger.jpg?v=1.1';
var house_50deg_0kwh_standard_charger_battery = new Image();
house_50deg_0kwh_standard_charger_battery.src = 'https://www.sveasolar.se/wp-content/themes/xpro-child/calculator/imgs/houses/50deg/house-50deg-0kwh-standard-charger-battery.jpg?v=1.1';

//Solarpanels
//10deg
var house_10deg_0kwh_solar_clean = new Image();
house_10deg_0kwh_solar_clean.src = 'https://www.sveasolar.se/wp-content/themes/xpro-child/calculator/imgs/houses/10deg/house-10deg-0kwh-solar-clean.jpg?v=1.1';
var house_10deg_0kwh_solar_battery = new Image();
house_10deg_0kwh_solar_battery.src = 'https://www.sveasolar.se/wp-content/themes/xpro-child/calculator/imgs/houses/10deg/house-10deg-0kwh-solar-battery.jpg?v=1.1';
var house_10deg_0kwh_solar_charger = new Image();
house_10deg_0kwh_solar_charger.src = 'https://www.sveasolar.se/wp-content/themes/xpro-child/calculator/imgs/houses/10deg/house-10deg-0kwh-solar-charger.jpg?v=1.1';
var house_10deg_0kwh_solar_charger_battery = new Image();
house_10deg_0kwh_solar_charger_battery.src = 'https://www.sveasolar.se/wp-content/themes/xpro-child/calculator/imgs/houses/10deg/house-10deg-0kwh-solar-charger-battery.jpg?v=1.1';
//30deg
var house_30deg_0kwh_solar_clean = new Image();
house_30deg_0kwh_solar_clean.src = 'https://www.sveasolar.se/wp-content/themes/xpro-child/calculator/imgs/houses/30deg/house-30deg-0kwh-solar-clean.jpg?v=1.1';
var house_30deg_0kwh_solar_battery = new Image();
house_30deg_0kwh_solar_battery.src = 'https://www.sveasolar.se/wp-content/themes/xpro-child/calculator/imgs/houses/30deg/house-30deg-0kwh-solar-battery.jpg?v=1.1';
var house_30deg_0kwh_solar_charger = new Image();
house_30deg_0kwh_solar_charger.src = 'https://www.sveasolar.se/wp-content/themes/xpro-child/calculator/imgs/houses/30deg/house-30deg-0kwh-solar-charger.jpg?v=1.1';
var house_30deg_0kwh_solar_charger_battery = new Image();
house_30deg_0kwh_solar_charger_battery.src = 'https://www.sveasolar.se/wp-content/themes/xpro-child/calculator/imgs/houses/30deg/house-30deg-0kwh-solar-charger-battery.jpg?v=1.1';
//50deg
var house_50deg_0kwh_solar_clean = new Image();
house_50deg_0kwh_solar_clean.src = 'https://www.sveasolar.se/wp-content/themes/xpro-child/calculator/imgs/houses/50deg/house-50deg-0kwh-solar-clean.jpg?v=1.1';
var house_50deg_0kwh_solar_battery = new Image();
house_50deg_0kwh_solar_battery.src = 'https://www.sveasolar.se/wp-content/themes/xpro-child/calculator/imgs/houses/50deg/house-50deg-0kwh-solar-battery.jpg?v=1.1';
var house_50deg_0kwh_solar_charger = new Image();
house_50deg_0kwh_solar_charger.src = 'https://www.sveasolar.se/wp-content/themes/xpro-child/calculator/imgs/houses/50deg/house-50deg-0kwh-solar-charger.jpg?v=1.1';
var house_50deg_0kwh_solar_charger_battery = new Image();
house_50deg_0kwh_solar_charger_battery.src = 'https://www.sveasolar.se/wp-content/themes/xpro-child/calculator/imgs/houses/50deg/house-50deg-0kwh-solar-charger-battery.jpg?v=1.1';

//Premium panels
//10deg
var house_10deg_0kwh_premium_clean = new Image();
house_10deg_0kwh_premium_clean.src = 'https://www.sveasolar.se/wp-content/themes/xpro-child/calculator/imgs/houses/10deg/house-10deg-0kwh-premium-clean.jpg?v=1.1';
var house_10deg_0kwh_premium_battery = new Image();
house_10deg_0kwh_premium_battery.src = 'https://www.sveasolar.se/wp-content/themes/xpro-child/calculator/imgs/houses/10deg/house-10deg-0kwh-premium-battery.jpg?v=1.1';
var house_10deg_0kwh_premium_charger = new Image();
house_10deg_0kwh_premium_charger.src = 'https://www.sveasolar.se/wp-content/themes/xpro-child/calculator/imgs/houses/10deg/house-10deg-0kwh-premium-charger.jpg?v=1.1';
var house_10deg_0kwh_premium_charger_battery = new Image();
house_10deg_0kwh_premium_charger_battery.src = 'https://www.sveasolar.se/wp-content/themes/xpro-child/calculator/imgs/houses/10deg/house-10deg-0kwh-premium-charger-battery.jpg?v=1.1';
//30deg
var house_30deg_0kwh_premium_clean = new Image();
house_30deg_0kwh_premium_clean.src = 'https://www.sveasolar.se/wp-content/themes/xpro-child/calculator/imgs/houses/30deg/house-30deg-0kwh-premium-clean.jpg?v=1.1';
var house_30deg_0kwh_premium_battery = new Image();
house_30deg_0kwh_premium_battery.src = 'https://www.sveasolar.se/wp-content/themes/xpro-child/calculator/imgs/houses/30deg/house-30deg-0kwh-premium-battery.jpg?v=1.1';
var house_30deg_0kwh_premium_charger = new Image();
house_30deg_0kwh_premium_charger.src = 'https://www.sveasolar.se/wp-content/themes/xpro-child/calculator/imgs/houses/30deg/house-30deg-0kwh-premium-charger.jpg?v=1.1';
var house_30deg_0kwh_premium_charger_battery = new Image();
house_30deg_0kwh_premium_charger_battery.src = 'https://www.sveasolar.se/wp-content/themes/xpro-child/calculator/imgs/houses/30deg/house-30deg-0kwh-premium-charger-battery.jpg?v=1.1';
//50deg
var house_50deg_0kwh_premium_clean = new Image();
house_50deg_0kwh_premium_clean.src = 'https://www.sveasolar.se/wp-content/themes/xpro-child/calculator/imgs/houses/50deg/house-50deg-0kwh-premium-clean.jpg?v=1.1';
var house_50deg_0kwh_premium_battery = new Image();
house_50deg_0kwh_premium_battery.src = 'https://www.sveasolar.se/wp-content/themes/xpro-child/calculator/imgs/houses/50deg/house-50deg-0kwh-premium-battery.jpg?v=1.1';
var house_50deg_0kwh_premium_charger = new Image();
house_50deg_0kwh_premium_charger.src = 'https://www.sveasolar.se/wp-content/themes/xpro-child/calculator/imgs/houses/50deg/house-50deg-0kwh-premium-charger.jpg?v=1.1';
var house_50deg_0kwh_premium_charger_battery = new Image();
house_50deg_0kwh_premium_charger_battery.src = 'https://www.sveasolar.se/wp-content/themes/xpro-child/calculator/imgs/houses/50deg/house-50deg-0kwh-premium-charger-battery.jpg?v=1.1';

(function(){

	//Hide everything and show the splashscreen
	showPage = document.getElementById('solar-calculator');
	hideAllPages();
	showPage.style.display = 'flex';
	showSplashScreen();

	//Add Button events for the splashscreen to show th roof pick page
	splashNextBtn = document.getElementById('address_next_btn');
	splashNextBtn.addEventListener("click", function(e) {
		e.preventDefault();
  		showRoofPage();
	});

	roofPickMobBackBtn = document.getElementById('roof-pick1-back-btn');
	roofPickMobBackBtn.addEventListener("click", function(e) {
		e.preventDefault();
  		showSplashScreen();
	});
	roofPickMobNextBtn = document.getElementById('roof-pick1-next-btn');
	roofPickMobNextBtn.addEventListener("click", function(e) {
  		e.preventDefault();
  		showRoofPagePart2();
	});

	roofPickBackBtn = document.getElementById('roof-pick-back-btn');
	roofPickBackBtn.addEventListener("click", function(e) {
  		e.preventDefault();
  		if(polygonMap !== null) {
  			polygonMap.setMap(null);
  		}
  		showRoofPage();
	});

	roofPickNextBtn = document.getElementById('roof-pick-next-btn');
	roofPickNextBtn.addEventListener("click", function(e) {
  		e.preventDefault();
  		showSlopePage();
	});

	roofPickSizeMob = document.getElementById('roof-size-mobile');
	roofPickSizeMob.addEventListener("change", function() {
  		userData.area = this.value;
		let nextBtn = document.getElementById('roof-pick1-next-btn');
		nextBtn.style.visibility = 'visible';
		window.scrollTo(0, 0);
	});

	slopeNextBtn = document.getElementById('slope-next-btn');
	slopeNextBtn.addEventListener("click", function(e) {
  		e.preventDefault();
  		showEnergyPage();
	});

	slopeBackBtn = document.getElementById('slope-back-btn');
	slopeBackBtn.addEventListener("click", function(e) {
  		e.preventDefault();
  		showRoofPagePart2();
	});	

	energyNextBtn = document.getElementById('energy-next-btn');
	energyNextBtn.addEventListener("click", function(e) {
  		e.preventDefault();
  		showDetailsPage();
	});
	energyBackBtn = document.getElementById('energy-back-btn');
	energyBackBtn.addEventListener("click", function(e) {
  		e.preventDefault();
  		showSlopePage();
	});		

	detailsBackBtn = document.getElementById('details-back-btn');
	detailsBackBtn.addEventListener("click", function(e) {
  		e.preventDefault();
  		showEnergyPage();
	});	

	detailsBackBtnMob = document.getElementById('details-back-btn-mob');
	detailsBackBtnMob.addEventListener("click", function(e) {
  		e.preventDefault();
  		showEnergyPage();
	});	


	offerBtn = document.getElementById('offer-btn');
	offerBtn.addEventListener("click", function(e) {
		e.preventDefault();
		if(form_is_completed == true) {
			showOfferModal();
		}
	});	

	offerBtnMob = document.getElementById('offer-btn-mob');
	offerBtnMob.addEventListener("click", function(e) {
		e.preventDefault();
		if(form_is_completed == true) {
			showOfferModal();
		}
	});	
	offerBtnClose = document.getElementById('close-modal-mob');
	offerBtnClose.addEventListener("click", function(e) {
		e.preventDefault();
		let offerModal = document.getElementById('offerModal');
		offerModal.style.display = "none";
	});	

	chargerSwitch = document.getElementById('car-charger');
	chargerSwitch.addEventListener("change", function() {
  		if(this.checked == false) {
  			userData.charger = 0;
  		} else {
  			userData.charger = 1;
  		}
  		updateDataScreen();
	});	

	chargerSwitchMob = document.getElementById('car-charger-mob');
	chargerSwitchMob.addEventListener("change", function() {
  		if(this.checked == false) {
  			userData.charger = 0;
  		} else {
  			userData.charger = 1;
  		}
  		updateDataScreen();
	});	

	batterySwitch = document.getElementById('battery-storage');
	batterySwitch.addEventListener("change", function() {
  		if(this.checked == false) {
  			userData.battery = 0;
  		} else {
  			userData.battery = 1;
  		}
  		updateDataScreen();
	});	

	batterySwitchMob = document.getElementById('battery-mob');
	batterySwitchMob.addEventListener("change", function() {
  		if(this.checked == false) {
  			userData.battery = 0;
  		} else {
  			userData.battery = 1;
  		}
  		updateDataScreen();
	});	

	
	panelType = document.getElementById('panel-type');
	panelType.addEventListener("change", function() {
  		userData.panelType = this.value;	

		updateDataScreen();	
	});		

	panelTypeMob = document.getElementById('panel-type-mob');
	panelTypeMob.addEventListener("change", function() {
  		userData.panelType = this.value;	
		updateDataScreen();
	});	

	
	paymentType = document.getElementById('payment-type');
	paymentType.addEventListener("change", function() {
  		userData.paymentType = this.value;
		updateDataScreen();
  		
	});	

	paymentTypeMob = document.getElementById('payment-type-mob');
	paymentTypeMob.addEventListener("change", function() {
  		userData.paymentType = this.value;
		updateDataScreen();
	});	
			
	//Toggle house active class
	var directionHouses = document.getElementsByClassName('direction-house');
	for (let i = 0; i < directionHouses.length; i ++) {
	    directionHouses[i].addEventListener('click', function(e){
	    	for (let a = 0; a < directionHouses.length; a ++) {
	    		directionHouses[a].classList.remove("active");
	    	}
	  		this.classList.toggle('active');
	  		userData.direction = this.getAttribute('data-direction-id');
	    });
	}


	//Range slider Slope
	var slopeRangeSlider = document.getElementById('slope-range-input');
	var slopeRangeSliderThumb = document.getElementById('slope-range-thumb');
  	var thumbSlopeWidth = 50; // Thumb width. See CSS
  	var maxSlopeValue = 60;
	slopeRangeSlider.oninput = function() {
		userData.slope = slopeRangeSlider.value;
		slopeRangeSliderThumb.innerHTML = slopeRangeSlider.value + '&#176;';
		var sliderWidth = slopeRangeSlider.clientWidth;
		var currentValue = slopeRangeSlider.value;
		var percentValue = currentValue / maxSlopeValue;
		var thumbOffset = sliderWidth * percentValue;
	    var xPX = thumbOffset - (thumbSlopeWidth * percentValue); // Position in PX
	    console.log(percentValue);
	    // var xPC = xPX * 100 / w;     // Position in % (if ever needed)
	    slopeRangeSliderThumb.style.left =  xPX + 'px';
	    //Set Background
	    setSlopeKwhImage();
	}  
	slopeRangeSlider.onchange = function() {
		userData.slope = slopeRangeSlider.value;
		slopeRangeSliderThumb.innerHTML = slopeRangeSlider.value + '&#176;';
		var sliderWidth = slopeRangeSlider.clientWidth;
		var currentValue = slopeRangeSlider.value;
		var percentValue = currentValue / maxSlopeValue;
		var thumbOffset = sliderWidth * percentValue;
	    var xPX = thumbOffset - (thumbSlopeWidth * percentValue); // Position in PX
	    console.log(percentValue);
	    // var xPC = xPX * 100 / w;     // Position in % (if ever needed)
	    slopeRangeSliderThumb.style.left =  xPX + 'px';
	    //Set Background
	    setSlopeKwhImage();
	}

	//Range slider Energy
	var energyRangeSlider = document.getElementById('energy-range-input');
	var energyRangeSliderThumb = document.getElementById('energy-range-thumb');
  	var thumbWidth = 60; // Thumb width. See CSS
  	var maxValue = 20000;
  	var minValue = 10000;
  	var rangeSize = maxValue - minValue;

	energyRangeSlider.oninput = function() {
		userData.energy = energyRangeSlider.value;
		energyRangeSliderThumb.innerHTML = energyRangeSlider.value + '<br>kwh/year';
		var sliderWidth = energyRangeSlider.clientWidth;
		var currentValue = energyRangeSlider.value;
		var percentValue = (currentValue - minValue) / rangeSize;
		var thumbOffset = sliderWidth * percentValue;
		var xPX = thumbOffset - (thumbWidth * percentValue);
	    energyRangeSliderThumb.style.left =  xPX + 'px';
	    setSlopeKwhImage();
	} 
	energyRangeSlider.onchange = function() {
		userData.energy = energyRangeSlider.value;
		energyRangeSliderThumb.innerHTML = energyRangeSlider.value + '<br>kwh/year';
		var sliderWidth = energyRangeSlider.clientWidth;
		var currentValue = energyRangeSlider.value;
		var percentValue = (currentValue - minValue) / rangeSize;
		var thumbOffset = sliderWidth * percentValue;
		var xPX = thumbOffset - (thumbWidth * percentValue);
	    energyRangeSliderThumb.style.left =  xPX + 'px';
	    setSlopeKwhImage();
	} 
})();



function initMap() {
	var zoomInt = 19;
	var zoomControl = true;
	if(isMobile() == true) {
		zoomInt = 18;
		zoomControl = false;
	} 
	
	var preLat = getAllUrlParams().lat;
	var preLong = getAllUrlParams().lng;
	var preAddress = getAllUrlParams().address;

	var lat = 59.3258414;
	var long = 17.70188;
	var isPreFilled = false;
	if (typeof preLat !== "undefined" && preLat !== null && typeof preLong !== "undefined" && preLong !== null) {
		var lat = parseFloat(preLat);
		var long = parseFloat(preLong);
		isPreFilled = true;
	}

	map = new google.maps.Map(document.getElementById('map'), {
	  center: {lat: lat, lng: long},
	  zoom: zoomInt,
	  mapTypeId: 'hybrid',
	  disableDefaultUI: true,
	  zoomControl: zoomControl,
	  tilt: 0
	});

	//Autocomplete input
	var input = document.getElementById('solar_address2');
	var autocomplete = new google.maps.places.Autocomplete(input);
	
	if(isPreFilled == true) {
		input.value = decodeURIComponent(preAddress).replace(/\+/g," ");
		if(isMobile() == true) {
		  	if(mobileMarker !== null) {
		  		mobileMarker.setMap(null);
		  	}
			mobileMarker = new google.maps.Marker({
				position: {lat: lat, lng: long},
				map: map
			});
	  	}
	  	showRoofPage();
	}

	autocomplete.addListener('place_changed', function() {
	  var place = autocomplete.getPlace();
	  console.log(place.formatted_address);
	  if (!place.geometry) {
	    // User entered the name of a Place that was not suggested and
	    // pressed the Enter key, or the Place Details request failed.
	    window.alert("No details available for input: '" + place.name + "'");
	    return;
	  }
	  // If the place has a geometry, then present it on a map.

	  map.setCenter(place.geometry.location);
	  //Set marker if mobile
	  if(isMobile() == true) {
	  	if(mobileMarker !== null) {
	  		mobileMarker.setMap(null);
	  	}
		mobileMarker = new google.maps.Marker({
			position: place.geometry.location,
			map: map
		});
		window.scrollTo(0, 0);
	  }

	});

	//Autocomplete Splashscreen
	var inputSplash = document.getElementById('solar_address');
	var autocompleteSplash = new google.maps.places.Autocomplete(inputSplash);

	autocompleteSplash.addListener('place_changed', function() {
	  var placeSplash = autocompleteSplash.getPlace();
	  if (!placeSplash.geometry) {
	    // User entered the name of a Place that was not suggested and
	    // pressed the Enter key, or the Place Details request failed.
	    return;
	  }
	  document.getElementById('address_next_btn').style.display = "block";
	  // If the place has a geometry, then present it on a map.
	  map.setCenter(placeSplash.geometry.location);
	  input.value = placeSplash.formatted_address;

	  if(isMobile() == true) {
	  	if(mobileMarker !== null) {
	  		mobileMarker.setMap(null);
	  	}
		mobileMarker = new google.maps.Marker({
			position: placeSplash.geometry.location,
			map: map
		});
		window.scrollTo(0, 0);
	  }
	});

	if(isMobile() == true) {
		google.maps.event.addListener( map,'click', function (e) {
			if(mobileMarker == null) {
				mobileMarker = new google.maps.Marker({
					position: e.latLng,
					map: map
				});
			} else {
				mobileMarker.setPosition(e.latLng);
				map.setCenter(e.latLng);
			}
		});
	}

	if(isMobile() == false) {
		drawingManager = new google.maps.drawing.DrawingManager({
			drawingMode: google.maps.drawing.OverlayType.POLYGON,
			drawingControl: true,
			drawingControlOptions: {
			position: google.maps.ControlPosition.TOP_LEFT,
			drawingModes: ['polygon']
			},
		  	polygonOptions: {
		    	fillColor: '#e4c12f',
		    	fillOpacity: 0.5,
		    	strokeColor: '#e4c12f',
		    	strokeWeight: 4,
		    	clickable: false,
		    	editable: false,
		    	zIndex: 1
		  	}
		});//End drawingmanager

		google.maps.event.addListener(drawingManager,'polygoncomplete',function(polygon) {
			//Get Area
			if(polygonMap !== null) {
				polygonMap.setMap(null);
			}
			if(mapInfoWindow !== null) {
				mapInfoWindow.setMap(null);
			}
			polygonMap = polygon;
			var area = google.maps.geometry.spherical.computeArea(polygonMap.getPath());
	    	area = Math.round(area);
		    //Store to app variable later
		    //Show a popup
		    var contentString = "<p class='roof_size_info_window'><span class='roof_size_info_window-text'>" + area + "kvm </span><span id='set_roof_area'><i class='fas fa-check' id='set_roof_area_i'></i></span> <span id='clear_map'><i class='fas fa-times' id='clear_map_i'></i></span>";
		    var vertices = polygonMap.getPath();
		    var pos = vertices.getAt(0);
		    var lat = pos.lat();
		    var lang = pos.lng();

		 	mapInfoWindow = new google.maps.InfoWindow({
		      content: contentString
		    });
	    	mapInfoWindow.setPosition({lat: lat, lng: lang});
	    	map.setCenter({lat: lat, lng: lang});
	  		mapInfoWindow.open(map);
		  	document.addEventListener('click',function(e){
			    if(e.target && e.target.id== 'set_roof_area_i'){
			    	userData.area = area;
			    	mapInfoWindow.close();
			    	drawingManager.setMap(null);
			    	showRoofPagePart2();
			    }
			});
		  	document.addEventListener('click',function(e){
			    if(e.target && e.target.id == 'clear_map_i'){
			    	console.log("Clear");
			    	mapInfoWindow.close();
					polygonMap.setMap(null);
			    }
			});
		});
		drawingManager.setMap(map);
	}
}

function showOfferModal() {
	let offerModal = document.getElementById('offerModal');
	//Set data
	let costInput = document.getElementById('00N4H00000E7WNq');
	let paybackInput = document.getElementById('00N4H00000E7WNv');
	let daysInput = document.getElementById('00N4H00000E7WO0');
	let savingsInput = document.getElementById('00N4H00000E7WO5');
	let bathsInput = document.getElementById('00N4H00000E7WOA');
	let kwhInput = document.getElementById('00N4H00000E7WNr');
	let chargerInput = document.getElementById('00N4H00000E7WOF');
	let betteriesInput = document.getElementById('00N4H00000E7WOK');
	let panelTypeInput = document.getElementById('00N4H00000E7WOP');
	let paymentTypeInput = document.getElementById('00N4H00000E7WOU');
	
	costInput.value = userData.totalCost();
	paybackInput.value = userData.paybackYears();
	daysInput.value = userData.daysToInstall();
	savingsInput.value = userData.savingsPerYear();
	bathsInput.value = userData.bathsOfOil();
	kwhInput.value = userData.kwhSaved();
	chargerInput.value = userData.charger;
	betteriesInput.value = userData.battery;
	panelTypeInput.value = userData.panelType;
	paymentTypeInput.value = userData.paymentType;

	offerModal.style.display = "block";
	offerModal.addEventListener("click", function(event) {
		if (event.target.closest('.offer-modal-content')) return;
		offerModal.style.display = "none";
	}, false);
}
function showRoofPage() {
	//Hide all pages
	hideAllPages();
	//Show primary sidebar
	showPrimarySidebar();
	if(map !== null) {
		map.setOptions({zoomControl: true});
	}
	//Show drawing manager
	if(drawingManager !== null) {
		drawingManager.setMap(map);
	}
	//Show mobile btn?
	let nextBtn = document.getElementById('roof-pick1-next-btn');
	if(userData.area == 0) {
		nextBtn.style.visibility = 'hidden';
	}
	//If ma has class minimap remove
	let theMap = document.getElementById('map');
	theMap.classList.remove("small-map");
	//Hide part 2, show part 1
	let part2 = document.getElementsByClassName('roof_part_2');
	for (let i = 0; i < part2.length; i ++) {
	    part2[i].style.display = 'none';
	}
	let part1 = document.getElementsByClassName('roof_part_1');
	for (let i = 0; i < part1.length; i ++) {
	    part1[i].style.display = 'flex';
	}
	let page = document.getElementById('roof-pick-page');
	page.classList.remove("is_part_2");

	page.style.display = 'flex';

	setProgress(1);
	scrollTop();
}
function showRoofPagePart2() {
	hideAllPages();
	showPrimarySidebar();

	if(map !== null) {
		map.setOptions({zoomControl: false});
	}
	//Hide part 2, show part 1
	let part1 = document.getElementsByClassName('roof_part_1');
	for (let i = 0; i < part1.length; i ++) {
	    part1[i].style.display = 'none';
	}
	let part2 = document.getElementsByClassName('roof_part_2');
	for (let i = 0; i < part2.length; i ++) {
	    part2[i].style.display = 'flex';
	}
	//Add map small class
	let theMap = document.getElementById('map');
	theMap.classList.add("small-map");
	let page = document.getElementById('roof-pick-page');
	page.classList.add("is_part_2");
	page.style.display = 'flex';

	setProgress(1);

	scrollTop();
}
function showSlopePage() {
	hideAllPages();
	showPrimarySidebar();
	setSlopeKwhImage();
   
	let page = document.getElementById('roof-angle-page');
	page.style.display = 'flex';	
	setProgress(1);
	scrollTop();
}
function showEnergyPage() {
	hideAllPages();
	showPrimarySidebar();
	if(userData.energy == 0) {
		userData.energy = 10000;
	}
	setSlopeKwhImage();


	let page = document.getElementById('energy-consumption-page');
	let listItem = document.getElementsByClassName('active_on_energy');
	for (let i = 0; i < listItem.length; i ++) {
	    listItem[i].classList.add('active');
	}
	page.style.display = 'flex';	
	setProgress(2);

	scrollTop();
}
function showDetailsPage() {
	hideAllPages();
	showSecondarySidebar();
	updateBgImage();
	let page = document.getElementById('details-page');
	page.style.display = 'flex';
	if(form_is_completed == true) {
		setProgress(4);
	} else {
		setProgress(3);
	}
	updateDataScreen();
	scrollTop();	
}
function showSplashScreen() {
		//Hide all pages
		hideAllPages();
		let pageFooter = document.getElementsByTagName('footer');
		if(typeof pageFooter[0] !== "undefined")
		{
		  pageFooter[0].style.display = 'block';
		} 

		//If this is the splash, hide sidebar etc
		let left = document.getElementById('solar-calc-left-column');
		let right = document.getElementById('solar-calc-right-column');
		left.style.display = 'none';
		right.style.display = 'none';
		let page = document.getElementById('solar_calc_splash');
		page.style.display = 'flex';
		//Show splash  	
		scrollTop();
}

function hideAllPages() {
	//Alwasys show left and right
	let left = document.getElementById('solar-calc-left-column');
	let right = document.getElementById('solar-calc-right-column');
	let primarySidebar = document.getElementById('solar-calc-sidebar-2');
	let secondarySidebar = document.getElementById('solar-calc-sidebar-2');
	let pageFooter = document.getElementsByTagName('footer');
	if(typeof pageFooter[0] !== "undefined")
	{
	  pageFooter[0].style.display = 'none';
	} 

	primarySidebar.style.display = 'none';
	secondarySidebar.style.display = 'none';

	left.style.display = 'none';
	right.style.display = 'none';

	let pages = document.getElementsByClassName('solar-calc-page');
	for (let i = 0; i < pages.length; i ++) {
	    pages[i].style.display = 'none';
	}
}
function showPrimarySidebar() {
	let left = document.getElementById('solar-calc-left-column');
	let right = document.getElementById('solar-calc-right-column');
	let primarySidebar = document.getElementById('solar-calc-sidebar-1');
	let secondarySidebar = document.getElementById('solar-calc-sidebar-2');

	primarySidebar.style.display = 'none';
	secondarySidebar.style.display = 'none';

	left.style.display = 'block';
	right.style.display = 'block';
	primarySidebar.style.display = 'block';
	secondarySidebar.style.display = 'none';
}
function showSecondarySidebar() {
	let left = document.getElementById('solar-calc-left-column');
	let right = document.getElementById('solar-calc-right-column');
	let primarySidebar = document.getElementById('solar-calc-sidebar-1');
	let secondarySidebar = document.getElementById('solar-calc-sidebar-2');

	primarySidebar.style.display = 'none';
	secondarySidebar.style.display = 'none';

	left.style.display = 'block';
	right.style.display = 'block';
	primarySidebar.style.display = 'none';
	secondarySidebar.style.display = 'block';
}

function updateDataScreen() {
	updateBgImage();

	if(userData.paymentType == null || userData.panelType == null) {
		return;
	} else {
		document.getElementById("car-charger").disabled = false;
		document.getElementById("battery-storage").disabled = false;
		document.getElementById("car-charger-mob").disabled = false;
		document.getElementById("battery-mob").disabled = false;
		form_is_completed = true;
		setProgress(4);
		document.getElementById('offer-btn').classList.add("offer-btn-active");
		document.getElementById('offer-btn-mob').classList.add("offer-btn-active");

	}
	let daysElement = document.getElementById('ribbon-days-value');
	let costElement = document.getElementById('ribbon-cost-value');
	let paybackElement = document.getElementById('ribbon-payback-value');
	let savingsElement = document.getElementById('ribbon-savings-value');
	let bathsElement = document.getElementById('ribbon-baths-value');
	let kwhSavedElement = document.getElementById('ribbon-kwh-saved-value');
	
	daysElement.innerHTML = userData.daysToInstall();
	if(userData.paymentType == 'Loan') {
		costElement.innerHTML = userData.totalCost() + ' kr/m';
	} else {
		let cost = userData.totalCost();
		let formatedCost = (Math.round(cost / 1000) * 1000);
		costElement.innerHTML = formatedCost + ' kr';
	}
	paybackElement.innerHTML = userData.paybackYears();
	savingsElement.innerHTML = userData.savingsPerYear() + ' kr';;
	bathsElement.innerHTML = userData.bathsOfOil();
	kwhSavedElement.innerHTML = userData.kwhSaved();


}
function setSlopeKwhImage() {
	tmpBgImage = null;
	if(userData.slope < 11) {
		//Flat roof
		if(userData.energy == 0) {
			//Flat 0kwh
			tmpBgImage = house_10deg_0kwh_clean;
		} else if(userData.energy <= 10000) {
			//Flat, low energy
			tmpBgImage = house_10deg_10kwh_clean;
		} else if(userData.energy <= 15000) {
			//Flat, medium energy
			tmpBgImage = house_10deg_15kwh_clean;
		} else {
			//Flat, high energy
			tmpBgImage = house_10deg_20kwh_clean;
		}
	} else if(userData.slope < 31) {
		//Medium roof
		if(userData.energy == 0) {
			//Medium, 0 kwh
			tmpBgImage = house_30deg_0kwh_clean;
		} else if(userData.energy <= 10000) {
			//medium, low energy
			tmpBgImage = house_30deg_10kwh_clean;
		} else if(userData.energy <= 15000) {
			//medium, medium energy
			tmpBgImage = house_30deg_15kwh_clean;
		} else {
			//medium, high energy
			tmpBgImage = house_30deg_20kwh_clean;
		}
	} else {
		//sloped roof
		if(userData.energy == 0) {
			//Sloped 0kwh
			tmpBgImage = house_50deg_0kwh_clean;
		} else if(userData.energy <= 10000) {
			//Sloped, low energy
			tmpBgImage = house_50deg_10kwh_clean;
		} else if(userData.energy <= 15000) {
			//Sloped, medium energy
			tmpBgImage = house_50deg_15kwh_clean;
		} else {
			//Sloped, high energy
			tmpBgImage = house_50deg_20kwh_clean;
		}
	}
	detailsMobBackground.style.backgroundImage = "url('"+tmpBgImage.src+"')";
	mainBackground.style.backgroundImage = "url('"+tmpBgImage.src+"')";	
}
function updateBgImage() {
	tmpBgImage = null;
	if(userData.panelType == 'Premium') {
		//Premium picked
		if(userData.slope <= 10) {
			//Premium flat roof
			if(userData.battery == 1 && userData.charger == 1) {
				tmpBgImage = house_10deg_0kwh_premium_charger_battery;
				//Premium flat roof + battery + charger
			} else if(userData.battery == 1 && userData.charger == 0) {
				//Premium flat roof + battery 
				tmpBgImage = house_10deg_0kwh_premium_battery;
			} else if(userData.battery == 0 && userData.charger == 1) {
				//Premium flat roof + charger 
				tmpBgImage = house_10deg_0kwh_premium_charger;
			} else {
				//Premium flat roof clean
				tmpBgImage = house_10deg_0kwh_premium_clean;
			}
		} else if(userData.slope <= 30) {
			//Premium medium roof
			if(userData.battery == 1 && userData.charger == 1) {
				//Premium medium roof + battery + charger
				tmpBgImage = house_30deg_0kwh_premium_charger_battery;
			} else if(userData.battery == 1 && userData.charger == 0) {
				//Premium medium roof + battery 
				tmpBgImage = house_30deg_0kwh_premium_battery;
			} else if(userData.battery == 0 && userData.charger == 1) {
				//Premium medium roof + charger 
				tmpBgImage = house_30deg_0kwh_premium_charger;
			} else {
				//Premium medium roof clean
				tmpBgImage = house_30deg_0kwh_premium_clean;
			}
		} else {
			//Premium sloped roof
			if(userData.battery == 1 && userData.charger == 1) {
				//Premium sloped roof + battery + charger
				tmpBgImage = house_50deg_0kwh_premium_charger_battery;
			} else if(userData.battery == 1 && userData.charger == 0) {
				//Premium sloped roof + battery 
				tmpBgImage = house_50deg_0kwh_premium_battery;
			} else if(userData.battery == 0 && userData.charger == 1) {
				//Premium sloped roof + charger 
				tmpBgImage = house_50deg_0kwh_premium_charger;
			} else {
				//Premium sloped roof clean
				tmpBgImage = house_50deg_0kwh_premium_clean;
			}
		}
	} else if(userData.panelType == 'Standard') {
		//Standard picked
		if(userData.slope <= 10) {
			//Standard flat roof
			if(userData.battery == 1 && userData.charger == 1) {
				tmpBgImage = house_10deg_0kwh_standard_charger_battery;
				//Standard flat roof + battery + charger
			} else if(userData.battery == 1 && userData.charger == 0) {
				//Standard flat roof + battery 
				tmpBgImage = house_10deg_0kwh_standard_battery;
			} else if(userData.battery == 0 && userData.charger == 1) {
				//Standard flat roof + charger 
				tmpBgImage = house_10deg_0kwh_standard_charger;
			} else {
				//Standard flat roof clean
				tmpBgImage = house_10deg_0kwh_standard_clean;
			}
		} else if(userData.slope <= 30) {
			//Standard medium roof
			if(userData.battery == 1 && userData.charger == 1) {
				//Standard medium roof + battery + charger
				tmpBgImage = house_30deg_0kwh_standard_charger_battery;
			} else if(userData.battery == 1 && userData.charger == 0) {
				//Standard medium roof + battery 
				tmpBgImage = house_30deg_0kwh_standard_battery;
			} else if(userData.battery == 0 && userData.charger == 1) {
				//Standard medium roof + charger 
				tmpBgImage = house_30deg_0kwh_standard_charger;
			} else {
				//Standard medium roof clean
				tmpBgImage = house_30deg_0kwh_standard_clean;
			}
		} else {
			//Standard sloped roof
			if(userData.battery == 1 && userData.charger == 1) {
				//Standard sloped roof + battery + charger
				tmpBgImage = house_50deg_0kwh_standard_charger_battery;
			} else if(userData.battery == 1 && userData.charger == 0) {
				//Standard sloped roof + battery 
				tmpBgImage = house_50deg_0kwh_standard_battery;
			} else if(userData.battery == 0 && userData.charger == 1) {
				//Standard sloped roof + charger 
				tmpBgImage = house_50deg_0kwh_standard_charger;
			} else {
				//Standard sloped roof clean
				tmpBgImage = house_50deg_0kwh_standard_clean;
			}
		}
	} else if(userData.panelType == 'Solarroof') {
		//Solarroof picked
		if(userData.slope <= 10) {
			//Solarroof flat roof
			if(userData.battery == 1 && userData.charger == 1) {
				tmpBgImage = house_10deg_0kwh_solar_charger_battery;
				//Solarroof flat roof + battery + charger
			} else if(userData.battery == 1 && userData.charger == 0) {
				//Solarroof flat roof + battery 
				tmpBgImage = house_10deg_0kwh_solar_battery;
			} else if(userData.battery == 0 && userData.charger == 1) {
				//Solarroof flat roof + charger 
				tmpBgImage = house_10deg_0kwh_solar_charger;
			} else {
				//Solarroof flat roof clean
				tmpBgImage = house_10deg_0kwh_solar_clean;
			}
		} else if(userData.slope <= 30) {
			//Solarroof medium roof
			if(userData.battery == 1 && userData.charger == 1) {
				//Solarroof medium roof + battery + charger
				tmpBgImage = house_30deg_0kwh_solar_charger_battery;
			} else if(userData.battery == 1 && userData.charger == 0) {
				//Solarroof medium roof + battery 
				tmpBgImage = house_30deg_0kwh_solar_battery;
			} else if(userData.battery == 0 && userData.charger == 1) {
				//Solarroof medium roof + charger 
				tmpBgImage = house_30deg_0kwh_solar_charger;
			} else {
				//Solarroof medium roof clean
				tmpBgImage = house_30deg_0kwh_solar_clean;
			}
		} else {
			//Solarroof sloped roof
			if(userData.battery == 1 && userData.charger == 1) {
				//Solarroof sloped roof + battery + charger
				tmpBgImage = house_50deg_0kwh_solar_charger_battery;
			} else if(userData.battery == 1 && userData.charger == 0) {
				//Solarroof sloped roof + battery 
				tmpBgImage = house_50deg_0kwh_solar_battery;
			} else if(userData.battery == 0 && userData.charger == 1) {
				//Solarroof sloped roof + charger 
				tmpBgImage = house_50deg_0kwh_solar_charger;
			} else {
				//Solarroof sloped roof clean
				tmpBgImage = house_50deg_0kwh_solar_clean;
			}
		}
	} else {
		//No panels picked
		if(userData.slope <= 10) {
			//No panels flat roof
			if(userData.battery == 1 && userData.charger == 1) {
				//No panels flat roof + battery + charger
				tmpBgImage = house_10deg_0kwh_clean;
			} else if(userData.battery == 1 && userData.charger == 0) {
				//No panels flat roof + battery 
				tmpBgImage = house_10deg_0kwh_clean;
			} else if(userData.battery == 0 && userData.charger == 1) {
				//No panels flat roof + charger 
				tmpBgImage = house_10deg_0kwh_clean;
			} else {
				//No panels flat roof clean
				tmpBgImage = house_10deg_0kwh_clean;
			}
		} else if(userData.slope <= 30) {
			//No panels medium roof
			if(userData.battery == 1 && userData.charger == 1) {
				//No panels medium roof + battery + charger
				tmpBgImage = house_30deg_0kwh_clean;
			} else if(userData.battery == 1 && userData.charger == 0) {
				//No panels medium roof + battery 
				tmpBgImage = house_30deg_0kwh_clean;
			} else if(userData.battery == 0 && userData.charger == 1) {
				//No panels medium roof + charger 
				tmpBgImage = house_30deg_0kwh_clean;
			} else {
				//No panels medium roof clean
				tmpBgImage = house_30deg_0kwh_clean;
			}
		} else {
			//No panels sloped roof
			if(userData.battery == 1 && userData.charger == 1) {
				//No panels sloped roof + battery + charger
				tmpBgImage = house_50deg_0kwh_clean;
			} else if(userData.battery == 1 && userData.charger == 0) {
				//No panels sloped roof + battery 
				tmpBgImage = house_50deg_0kwh_clean;
			} else if(userData.battery == 0 && userData.charger == 1) {
				//No panels sloped roof + charger 
				tmpBgImage = house_50deg_0kwh_clean;
			} else {
				//No panels sloped roof clean
				tmpBgImage = house_50deg_0kwh_clean;
			}
		}
	}

	detailsMobBackground.style.backgroundImage = "url('"+tmpBgImage.src+"')";
	mainBackground.style.backgroundImage = "url('"+tmpBgImage.src+"')";	
}
function isMobile() {
	let width = Math.max(
    document.body.scrollWidth,
    document.documentElement.scrollWidth,
    document.body.offsetWidth,
    document.documentElement.offsetWidth,
    document.documentElement.clientWidth
  );
	if(width < 992) {
		return true;
	} else {
		return false;
	}
}
function setProgress(step) {
	step1 = document.getElementById("progress_list_1");
	step2 = document.getElementById("progress_list_2");
	step3 = document.getElementById("progress_list_3");
	step4 = document.getElementById("progress_list_4");

	step1.classList.remove('active');
	step2.classList.remove('active');
	step3.classList.remove('active');
	step4.classList.remove('active');

	if(step == 1) {
		step1.classList.add('active');
	}
	if(step == 2) {
		step2.classList.add('active');
	}
	if(step == 3) {
		step3.classList.add('active');
	}
	if(step == 4) {
		step4.classList.add('active');
	}
}
function scrollTop() {
	window.scrollTo(0, 0);
}

function getAllUrlParams(url) {

  // get query string from url (optional) or window
  var queryString = url ? url.split('?')[1] : window.location.search.slice(1);

  // we'll store the parameters here
  var obj = {};

  // if query string exists
  if (queryString) {

    // stuff after # is not part of query string, so get rid of it
    queryString = queryString.split('#')[0];

    // split our query string into its component parts
    var arr = queryString.split('&');

    for (var i = 0; i < arr.length; i++) {
      // separate the keys and the values
      var a = arr[i].split('=');

      // set parameter name and value (use 'true' if empty)
      var paramName = a[0];
      var paramValue = typeof (a[1]) === 'undefined' ? true : a[1];

      // (optional) keep case consistent
      paramName = paramName.toLowerCase();
      if (typeof paramValue === 'string') paramValue = paramValue.toLowerCase();

      // if the paramName ends with square brackets, e.g. colors[] or colors[2]
      if (paramName.match(/\[(\d+)?\]$/)) {

        // create key if it doesn't exist
        var key = paramName.replace(/\[(\d+)?\]/, '');
        if (!obj[key]) obj[key] = [];

        // if it's an indexed array e.g. colors[2]
        if (paramName.match(/\[\d+\]$/)) {
          // get the index value and add the entry at the appropriate position
          var index = /\[(\d+)\]/.exec(paramName)[1];
          obj[key][index] = paramValue;
        } else {
          // otherwise add the value to the end of the array
          obj[key].push(paramValue);
        }
      } else {
        // we're dealing with a string
        if (!obj[paramName]) {
          // if it doesn't exist, create property
          obj[paramName] = paramValue;
        } else if (obj[paramName] && typeof obj[paramName] === 'string'){
          // if property does exist and it's a string, convert it to an array
          obj[paramName] = [obj[paramName]];
          obj[paramName].push(paramValue);
        } else {
          // otherwise add the property
          obj[paramName].push(paramValue);
        }
      }
    }
  }

  return obj;
}