/*

SWIPING IMAGERY JS FILE.

This file is used to operate the swiping imagery app and all its functionality.

*/

var displayImageryTabs = [];
var selectionRight;
var selectionLeft;
var info = {};


window.onload = function() {
	// Event listener for closing the info window from the x corner button.
	var infoWindowClose = document.getElementById('closeInfo');
	infoWindowClose.addEventListener('click', function() {
		let currInfo = document.getElementById('infoWindow');
		if (currInfo.classList.contains('visible')) {
			currInfo.classList.add('invisible');
			window.setTimeout (() => {
				currInfo.classList.remove('visible');
			}, 500);
		}
	});
}


require([
	"esri/WebMap",
	"esri/views/MapView",
	"esri/widgets/Legend",
	"esri/widgets/ScaleBar",
	"esri/widgets/Home",
	"esri/widgets/Measurement",
	"esri/widgets/LayerList",
	"esri/widgets/LayerList/LayerListViewModel",
	"esri/widgets/Swipe",
	"esri/widgets/Expand"
	], function (WebMap, MapView, Legend, ScaleBar, Home, Measurement, LayerList, LayerListVM, Swipe, Expand) {
		// Obtain the webmap id
		var mapId = document.getElementById('webmap-id').innerText;

		//  Creates a webmap from map id on ArcGIS Online.
		var webmap = new WebMap({
			portalItem : {
				id : mapId
			}
		});

		var view = new MapView({
			container: "viewDiv",
			map: webmap,
			zoom: 11
		});

		// Creates and adds layer list widget to the map view, collapsed by default.
		const layerList = new LayerList({
			view: view
		});

		const layerExpander = new Expand({
			view: view,
			content: layerList,
			expanded: false,
			expandTooltip: "View Layer List"
		});

		// Creates and adds a legend to the view, collapsed by default.
		const legend = new Legend({
			view: view
		});

		const legendExpander = new Expand({
			view: view,
			content: legend,
			expanded: false,
			expandTooltip: "View Legend"
		});

		// Adds a scalebar to the view.
		var scalebar = new ScaleBar({
			view: view
		});

		// Creates and adds a home button
		var home = new Home ({
			view: view
		});

		// Adds swipe widget to task bar.
		var swipe = new Swipe({
			view: view,
			leadingLayers: [],
			trailingLayers: [],
			position: 50,
			disabled: false
		});		

		// Event handlers for swipe button
		const swipeButton = document.getElementById("swipe");
		swipeButton.addEventListener("click", function() {
			controlSwipe(swipe);
		});

		// Event handlers for swipe button
		const infoButton = document.getElementById('info');
		infoButton.addEventListener('click', function() {
			let currInfo = document.getElementById('infoWindow');
			if (currInfo.classList.contains('visible')) {
				currInfo.classList.add('invisible');
				window.setTimeout (() => {
					currInfo.classList.remove('visible');
				}, 500);
			} else {
				currInfo.classList.add('visible');
				currInfo.classList.remove('invisible');
			}
		});

		// Loads all the views
		loadView()

		// Loads layers and adds image tabs to left and right tab containers.
		let all_layers = webmap.allLayers._items;
		webmap.loadAll()
			.catch(function(error){
				console.log("An error occurred:", error);
			})
			.then(function(){
				for (let item of all_layers) {
					// Filter imagery and tiled layers into the imagery tabs section only.
					console.log("Imagery is", item.title);
					console.log("Imagery type is", item.type);
					console.log("--------------------------");
					if (item.type === "imagery" || item.type === "tile" || item.type === "vector-tile") {
						displayImageryTabs.push(item.title); // adds the image name to the display tabs.

						// Create left and right element tabs.
						let leftElement = createRadioElement("leftSelection", item.title, item.id, "l", false);
						leftElement.addEventListener("click", (e) =>{
							// Select the layer
							selectionLeft = e.target.value;
							// Set the layer in swipe
							swipe.leadingLayers = [item];
							// Switch off the rest of the imagery layers
							if (selectionRight) {
								// selectionRight has already been made then you can turn off the rest except left and right.
								toggleImageryOff(all_layers, selectionLeft, selectionRight);
							} else {
								// Switch off other layers and switch on selectionLeft only.
								toggleImageryOff(all_layers, selectionLeft);
							}
							// Make the selection visible
							item.visible = true;
						});
						let textLabel_left = createInputLabel(item.title, item.title + "_l", "tabsSelect");

						let rightElement = createRadioElement("rightSelection", item.title, item.id, "r", false);
						rightElement.addEventListener("click", (e) =>{
							// Select the layer
							selectionRight = e.target.value;
							// Set the layer in swipe
							swipe.trailingLayers = [item];
							// Switch on selectionLeft if available.
							if (selectionLeft) {
								// selectionLeft has already been made then you can turn off the rest except left and right.
								toggleImageryOff(all_layers, selectionLeft, selectionRight);						
							} else {
								// Switch off other layers and switch on selectionRight only.
								toggleImageryOff(all_layers, selectionRight);
							}
							// Make the selection visible
							item.visible = true;			
						});
						let textLabel_right = createInputLabel(item.title, item.title + "_r", "tabsSelect");
						document.getElementById('leftLayersList').appendChild(leftElement);
						document.getElementById('leftLayersList').appendChild(textLabel_left);
						document.getElementById('rightLayersList').appendChild(rightElement);
						document.getElementById('rightLayersList').appendChild(textLabel_right);
					}	
				}
			})
			.then(function(){
				// Remove the preloader screen
				let preloader = document.getElementById('preloader');
				Array.from(preloader.children).forEach(item => {
					item.classList.add('fade-out');
				});
				preloader.classList.add('close-wrapper');

				// Display pop up short tutorial/info window.

			});

		function loadView() {
			view.ui.add(home, "top-left");
			view.ui.add(layerExpander,"top-right");
			view.ui.add(swipe);
			view.ui.add(scalebar, "bottom-right");
			view.ui.add(swipeButton, "top-right");
			view.ui.add(infoButton, "top-right");
			view.ui.add(legendExpander, "bottom-left");
		}
		
		function controlSwipe(swipe) {
			// Stops or restarts the swiping action
			if (swipe.disabled == true) {
				swipe.disabled = false;
			} else {
				swipe.disabled = true;			
			}	
		}

		function toggleImageryOff(all_layers, ...selections) {
			// Toggles imagery on and off if swipe function has been selected.
			for (let item of all_layers) {
				if (item.type === "imagery" || item.type === "tile" || item.type === "vector-tile") {
					if (selections.length > 1) {
						if (item.id != selections[0] && item.id != selections[1]) {
							item.visible = false;
						}
					} else {
						if (item.id != selections[0]) {
							item.visible = false;
						}
					}
				}
			}
		}



	}
);
	
	
function createRadioElement(name, itemName, itemId, side, checked) {
	// Returns a radio input element with unique id, name, value and state set
	var radioInput;
	try {
		var radioHtml = str(`<input type="radio" name="${name}" id="${itemName}_${side}"`);
		if (checked) {
			radioHtml += ' checked="checked"';
		}
		radioHtml += '/>';
		radioInput = document.createElement(radioHtml);
	} catch(err) {
		radioInput = document.createElement('input');
		radioInput.setAttribute('type', 'radio');
		radioInput.setAttribute('name', name);
		radioInput.setAttribute('id', itemName + "_" + side);
		radioInput.setAttribute('value', itemId);
		if (checked) {
			radioInput.setAttribute('checked', 'checked');
		}
	}
	return radioInput;
}


function createInputLabel(name, id, cssClass) {
	// Returns a label element for an element with a given id and css class set
	var label_value = document.createElement('label');
	label_value.setAttribute('for', id);
	label_value.className += cssClass;
	label_value.appendChild(document.createTextNode(name));
	return label_value;
}
