const modal = document.querySelector(".modal");
const overlay = document.querySelector(".overlay");
const openModalBtn = document.querySelector(".btn-open");
const closeModalBtn = document.querySelector(".btn");
const scoreDisplay = document.querySelector(".score");

const closeModal = function () {
  setTimeout(hideOverlayAnimation, 700); 
  document.getElementById('title').className = 'fadeOutLogo';
};

function hideOverlayAnimation() {
  modal.classList.add("fadeOut");
  overlay.classList.add("fadeOut");
  setTimeout(hideOverlay, 700); 
}

function hideOverlay() {
  modal.classList.add("hidden");
  overlay.classList.add("hidden");
}



closeModalBtn.addEventListener("click", closeModal);
overlay.addEventListener("click", closeModal);

require([
  "esri/WebMap",
  "esri/views/MapView",
  "esri/widgets/Legend",
  "esri/config",
  "esri/rest/networkService",
  "esri/rest/serviceArea",
  "esri/rest/support/ServiceAreaParameters",
  "esri/rest/support/FeatureSet",
  "esri/Graphic",
  "esri/layers/GraphicsLayer",
  "esri/rest/geometryService",
], function (
  WebMap, MapView, Legend, esriConfig, networkService, serviceArea, ServiceAreaParams, FeatureSet, Graphic, GraphicsLayer, geometryService
) {
  let placesLayer;
  let score = 0;
  let objectIDs = [];

  scoreDisplay.innerHTML = score;

  const portalIDs = ["6bbb397edb8b4f1bbe7dd829b226625d", "25dac44bd3604624bab3107587dc0715", "1ce734a5ad484fd49a3ab38aff321d95", "f92e47aefcbf487e85c2e2a809d9a7ca"];

  // step 1: setup the map
  const webmap = new WebMap({
      portalItem: {
          id: "195b4bed88684f03a8613100ee29eb35"
      },
      popupEnabled: true
  });
  const mapview = new MapView({
      container: "viewDiv",
      map: webmap
  });

  let legend = new Legend({
      view: mapview
  });

  webmap.when(() => {
      placesLayer = webmap.layers.find(layer => {
          return layer.title === "Impactapedia";
      });
      const featureFilter = {
        geometry: mapview.extent,
        spatialRelationship: "intersects",
    };
      placesLayer.featureEffect = {
          filter: featureFilter,
          includedEffect: "opacity(0%)",
          excludedEffect: "grayscale(90%) opacity(80%)"
      }; 
    });



      // mapview.whenLayerView(placesLayer).then(layerView => {
      //   layerView.watch("updating", (val) => {
      //       if (!val) {
      //         let query = placesLayer.createQuery();
      //         query.geometry = { //Create a point
      //             type: "point",
      //             longitude: -118.80657463861,
      //             latitude: 34.0005930608889
      //         };
      //         query.distance = 2;
      //         query.units - "miles";
      //         query.spatialRelationship = "contains";
      //         query.outFields = ["*"];
      //         query.returnGeometry = true;
      //           layerView.queryFeatures(query).then((results) => {
      //               console.log(JSON.stringify(results));
      //             })
      //           }
      //         })
      //       });


  

  // step 2: service area

  esriConfig.apiKey = "AAPK2d7fbc74c0234e7d87853f9a7536a266jjADxHV7SDwJC-LQWIVQm_AD68b8QGuoVqWLgcrzANkVM0FOidizY4nERgOVi5fr";
  const serviceAreaUrl = "https://route-api.arcgis.com/arcgis/rest/services/World/ServiceAreas/NAServer/ServiceArea_World";

  // when clicking anywhere on the map, generate the service area
  mapview.on("click", (event) => {
      reset();
      const locationGraphic = new Graphic({
          geometry: event.mapPoint,
          symbol: {
              type: "web-style",
              name: "esri-pin-1",
              styleName: "Esri2DPointSymbolsStyle"
          }
      });
      mapview.graphics.add(locationGraphic, 0);
      findServiceArea(locationGraphic, [500], serviceAreaUrl);
  });

  // when clicking on the side bar, reset
  document.getElementById("info").addEventListener("click", (event) => {
      reset();
  })

  // add layer for map buffer
  let bufferLayer = new GraphicsLayer({
      id: "bufferLayer"
  });
  webmap.layers.add(bufferLayer);

  async function findServiceArea(location, cutoff, url) {
      // get the walking distance
      const networkDescription = await networkService.fetchServiceDescription(url);
      const walkTravelMode = networkDescription.supportedTravelModes.find(
          (travelMode) => travelMode.name === "Walking Time"
      );

      // set all of the input parameters for the service
      const taskParameters = new ServiceAreaParams({
          facilities: new FeatureSet({
              features: [location]
          }),
          defaultBreaks: cutoff,
          trimOuterPolygon: true,
          outSpatialReference: mapview.spatialReference,
          travelMode: walkTravelMode
      });

      const { serviceAreaPolygons } = await serviceArea.solve(url, taskParameters);
      serviceAreaPolygons.features.map((serviceAreaFeature) => {
          serviceAreaFeature.symbol = {
              type: "simple-fill",
              color: [0, 180, 216, 0.5],
              outline: {
                  color: "white",
                  width: 2
              }
          };
          // add the polygon graphics below the point graphic
          bufferLayer.graphics.add(serviceAreaFeature)
          serviceAreaFeature.visible = false;

          //add the feature effect
          geometryService.union("https://sampleserver6.arcgisonline.com/arcgis/rest/services/Utilities/Geometry/GeometryServer", bufferLayer.graphics.items.map((graphic) => graphic.geometry)).then((allGeometry) => {
          const featureFilter = {
              geometry: allGeometry,
              spatialRelationship: "intersects",
          };
          serviceAreaFeature.visible = true;
          placesLayer.featureEffect = {
              filter: featureFilter,
              includedEffect: "opacity(100%)",
              excludedEffect: "opacity(0%)"
          };
          });


          const query = {
              geometry: serviceAreaFeature.geometry
          };
          mapview.whenLayerView(placesLayer).then(placesLayerView => {
              placesLayerView.queryFeatures(query).then((response) => {
                  //console.log(response.features);
                  response.features.forEach((place) => {
                    score += 100;
                    scoreDisplay.innerHTML = score;
                    objectIDs.push(place.attributes.OBJECTID);
                  });
                  // const attributes = response.features.map(f => f.attributes);
                  // attributes.forEach((place) => {
                  //     const infoDiv = document.createElement("calcite-list-item");
                  //     infoDiv.label = place.NAME;
                  //     infoDiv.description = place.ADDR + ", " + place.CITYNM + " - " + place.TYPE;
                  //     document.getElementById("queryResults").appendChild(infoDiv);
                  // });
              })
          })
      })
  }

  // clear map and sidebar
  function reset() {
      mapview.graphics.removeAll();
      document.getElementById("queryResults").innerHTML = "";
  }
});

function toggleTab() {
    const tabContent = document.querySelector('.tab-content');
    const popupTab = document.querySelector('.popup-tab');
    const tabIcon = document.querySelector('.tab-icon');

    // Toggle the visibility of the tab content
    if (tabContent.style.display === 'none') { // click --> open popup tab
        tabContent.style.display = 'block';
        popupTab.style.left = '0';
        tabIcon.style.left = '370';
        tabIcon.style.top = '110';
        
    } else { // click --> hide tab
        tabContent.style.display = 'none';
        popupTab.style.left = '-25%';
        tabIcon.style.left = '10';
    }
}