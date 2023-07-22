const modal = document.querySelector(".modal");
const overlay = document.querySelector(".overlay");
const openModalBtn = document.querySelector(".btn-open");
const closeModalBtn = document.querySelector(".btn");

const closeModal = function () {
  modal.classList.add("hidden");
  overlay.classList.add("hidden");
};

closeModalBtn.addEventListener("click", closeModal);
overlay.addEventListener("click", closeModal);


require([
  "esri/WebMap",
  "esri/views/MapView",
  "esri/widgets/Legend",
  // step 2: service area
  "esri/config",
  "esri/rest/networkService",
  "esri/rest/serviceArea",
  "esri/rest/support/ServiceAreaParameters",
  "esri/rest/support/FeatureSet",
  "esri/Graphic",
  "esri/layers/GraphicsLayer",
], function (
  WebMap, MapView, Legend, esriConfig, networkService, serviceArea, ServiceAreaParams, FeatureSet, Graphic, GraphicsLayer
) {
  let placesLayer;

const portalIDs = ["6bbb397edb8b4f1bbe7dd829b226625d", "25dac44bd3604624bab3107587dc0715", "1ce734a5ad484fd49a3ab38aff321d95", "f92e47aefcbf487e85c2e2a809d9a7ca"];

  // step 1: setup the map
  const webmap = new WebMap({
      portalItem: {
          id: portalIDs[Math.floor(Math.random() * portalIDs.length)]
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
  mapview.ui.add(legend, "bottom-left");

  // webmap.when(() => {
  //     placesLayer = webmap.layers.find(layer => {
  //         return layer.title === "San Diego Places";
  //     });
  //     placesLayer.outFields = ["NAME", "ADDR", "TYPE", "CITYNM"];
  // })

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
      findServiceArea(locationGraphic, [100], serviceAreaUrl);
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

  async function findServiceArea(location, radiusInMi, url) {
    const radiusInMeters = radiusInMi * 1600; //Miles to meters

    const networkDescription = await networkService.fetchServiceDescription(url);
    const drivingTravelMode = networkDescription.supportedTravelModes.find(
        (travelMode) => travelMode.name === "Driving Distance"
    );

    const taskParameters = new ServiceAreaParams({
        facilities: new FeatureSet({
            features: [location]
        }),
        defaultBreaks: [radiusInMeters],
        trimOuterPolygon: true,
        outSpatialReference: mapview.spatialReference,
        travelMode: drivingTravelMode
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

          // add the feature effect
          const featureFilter = {
              geometry: serviceAreaFeature.geometry,
              spatialRelationship: "intersects",
          };
          placesLayer.featureEffect = {
              filter: featureFilter,
              includedEffect: "bloom(2, 1px, 0)",
              excludedEffect: "grayscale(90%) opacity(80%)"
          };

          const query = {
              geometry: serviceAreaFeature.geometry
          };
          mapview.whenLayerView(placesLayer).then(placesLayerView => {
              placesLayerView.queryFeatures(query).then((response) => {
                  console.log(response.features);
                  const attributes = response.features.map(f => f.attributes);
                  attributes.forEach((place) => {
                      const infoDiv = document.createElement("calcite-list-item");
                      infoDiv.label = place.NAME;
                      infoDiv.description = place.ADDR + ", " + place.CITYNM + " - " + place.TYPE;
                      document.getElementById("queryResults").appendChild(infoDiv);
                  });
              })
          })
      })
  }

  // clear map and sidebar
  function reset() {
      mapview.graphics.removeAll();
      bufferLayer.removeAll();
      // placesLayer.featureEffect = null;
      document.getElementById("queryResults").innerHTML = "";
  }
});