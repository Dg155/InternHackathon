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

  // step 1: setup the map
  const webmap = new WebMap({
      portalItem: {
          id: "aff566df19af462b9324a05fd98a1a27"
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

  webmap.when(() => {
      placesLayer = webmap.layers.find(layer => {
          return layer.title === "San Diego Places";
      });
      placesLayer.outFields = ["NAME", "ADDR", "TYPE", "CITYNM"];
  })

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
      findServiceArea(locationGraphic, [5], serviceAreaUrl);
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
      placesLayer.featureEffect = null;
      document.getElementById("queryResults").innerHTML = "";
  }
});
