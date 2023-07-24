console.log("Does this even fun");
const modal = document.querySelector(".modal");
const overlay = document.querySelector(".overlay");
const openModalBtn = document.querySelector(".btn-open");
const closeModalBtn = document.querySelector(".btn");
const startGameBtn = document.getElementById("startPlayButton");
const startExploreBtn = document.getElementById("startExploreButton");
const scoreDisplays = document.querySelectorAll(".score");
const companyFoundDisplay = document.querySelector(".companiesFound");
const companyName = document.querySelectorAll('.esri-widget__heading');
const popUpContent = document.getElementById('popUpContent');

const tabContent = document.querySelector('.tab-content');
const popupTab = document.querySelector('.popup-tab');
const tabIcon = document.querySelector('.tab-icon');

// Explore Mode
const scoreOne = document.getElementById("scoreOne");
const scoreTwo = document.getElementById("scoreTwo");
const CompaniesFoundText = document.getElementById("CompaniesFound");
const totalCompanies = document.getElementById("TotalCompanies");

tabContent.style.display = 'none';

let gameMode = false;

let mapview;
let placesLayer;

const startGame = function () {
  gameMode = true;
  updateGameType();
  closeModal();
};

const startExplore = function () {
  gameMode = false;
  updateGameType();
  closeModal();
};

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

companyName.forEach((name) => {
  console.log(name.innerHTML);
});

const updateGameType = function () {
  if (gameMode) {
    scoreDisplays.forEach((scoreDisplay) => {
      scoreDisplay.classList.remove("hidden");
    });
    companyFoundDisplay.classList.remove("hidden");
    scoreOne.classList.remove("hidden");
    scoreTwo.classList.remove("hidden");
    CompaniesFoundText.classList.remove("hidden");
    totalCompanies.classList.remove("hidden");
    popUpContent.classList.add("extraMargin");
    const featureFilter = {
      geometry: mapview.extent,
      spatialRelationship: "intersects",
      };
      placesLayer.featureEffect = {
        filter: featureFilter,
        includedEffect: "opacity(0%)",
        excludedEffect: "opacity(0%)"
      };
  }
  else {
    scoreDisplays.forEach((scoreDisplay) => {
      scoreDisplay.classList.add("hidden");
    });
    companyFoundDisplay.classList.add("hidden");
    scoreOne.classList.add("hidden");
    scoreTwo.classList.add("hidden");
    CompaniesFoundText.classList.add("hidden");
    totalCompanies.classList.add("hidden");
    popUpContent.classList.remove("extraMargin");
    const featureFilter = {
      geometry: mapview.extent,
      spatialRelationship: "intersects",
      };
      placesLayer.featureEffect = {
        filter: featureFilter,
        includedEffect: "opacity(100%)",
        excludedEffect: "opacity(100%)"
      }; 
  }
};

startGameBtn.addEventListener("click", startGame);
startExploreBtn.addEventListener("click", startExplore);

console.log("checking now");

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
  let score = 0;
  let companiesFound = 0;
  let objectIDs = [];

  console.log("hello");

  scoreDisplays.forEach((scoreDisplay) => {
    scoreDisplay.innerHTML = score;
  });
  companyFoundDisplay.innerHTML = companiesFound;

  const portalIDs = ["65cb6f8751ba4c86be7c79f66d991339", "ff715f8f7a304d478db3170c96c041b6", "e8edc5231cec4a0b82bf3ba4ca9fc5c2", "8a58f1ed3d3f4b259f7817d4694a1133"];

  const EsriImpacts = ["Blue Raster, as a Gold Partner of Esri, has played a crucial role in transforming PG&E's operations through various ArcGIS solutions. From ArcGIS Online Accelerate and ArcGIS Hub Accelerate to ArcGIS Indoors Accelerate and ArcGIS StoryMaps Solutions, they have empowered PG&E to enhance data sharing, engagement, and spatial visualization, ultimately leading to improved efficiency and safety in managing their critical infrastructure.",
  "Using ArcGIS, Lockheed Martin's Global Emergency Operations Center (GEOC) proactively monitors and mitigates global threats, ensuring the safety and security of their 120,000 employees across 350 facilities in over 40 countries. With real-time data and GIS analytics, they can prioritize immediate action, conduct wellness checks, and reduce potential risks to their most valuable asset – their employees.",
  "Schneider Electric, a world leader in utility solutions, harnesses Esri's ArcGIS® software to provide powerful ArcFM™ Solution tools for managing and editing facility data. With an industry-proven 3D project delivery methodology and a team of experienced GIS experts, Schneider Electric delivers a wide range of services to utilities globally, ensuring increased productivity, reduced costs, and improved services.",
  "Xylem, a leading water technology company, partners with Esri, the global leader in GIS and location intelligence, to provide innovative solutions to water utilities worldwide. Their collaborative efforts have resulted in AI-powered pipeline analysis technology that significantly reduces costs and pipeline failures, leading to dramatic operational improvements and optimized water networks for utilities.",
  "Ericsson, a global leader in communications technology and services, leverages Esri's GIS solutions to enhance their services and infrastructure in mobility, broadband, and the cloud. With a wide range of GIS services provided, Ericsson empowers the telecom industry and other sectors to achieve better business outcomes, increased efficiency, and improved user experiences, contributing to a more sustainable future."]

  popUpContent.innerHTML = "";
  
  // step 1: setup the map
  const webmap = new WebMap({
      portalItem: {
          id: portalIDs[Math.floor(Math.random()*portalIDs.length)]
      },
      popupEnabled: true
  });
  mapview = new MapView({
      container: "viewDiv",
      map: webmap
  });

  let legend = new Legend({
      view: mapview
  });

  webmap.when(() => {
      placesLayer = webmap.layers.find(layer => {
          return layer.title === " ";
      });
      if (gameMode) {
        const featureFilter = {
        geometry: mapview.extent,
        spatialRelationship: "intersects",
        };
        placesLayer.featureEffect = {
          filter: featureFilter,
          includedEffect: "opacity(0%)",
          excludedEffect: "grayscale(90%) opacity(80%)"
        }; 
      }
    });

  esriConfig.apiKey = "AAPK2d7fbc74c0234e7d87853f9a7536a266jjADxHV7SDwJC-LQWIVQm_AD68b8QGuoVqWLgcrzANkVM0FOidizY4nERgOVi5fr";
  const serviceAreaUrl = "https://route-api.arcgis.com/arcgis/rest/services/World/ServiceAreas/NAServer/ServiceArea_World";

  function displayInfo(x, y) {
    if (x == 38 && y == -77) {
    popUpContent.innerHTML = EsriImpacts[0];
  }
  else if (x == 39 && y == -105) {
    popUpContent.innerHTML = EsriImpacts[1];
  }
  else if (x == 40 && y == -105) {
    popUpContent.innerHTML = EsriImpacts[2];
  }
  else if (x == 41 && y == -73) {
    popUpContent.innerHTML = EsriImpacts[3];
  }
  else {
    popUpContent.innerHTML = EsriImpacts[4];
  }
}

  // when clicking anywhere on the map, generate the service area
  mapview.on("click", (event) => {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           
    displayInfo(Math.trunc(event.mapPoint.latitude), Math.trunc(event.mapPoint.longitude));
    if (!gameMode) {return;}
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
    findServiceArea(locationGraphic, [30], serviceAreaUrl);
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
      // const networkDescription = await networkService.fetchServiceDescription(url);
      // const walkTravelMode = networkDescription.supportedTravelModes.find(
      //     (travelMode) => travelMode.name === "Walking Time"
      // );

      // set all of the input parameters for the service
      const taskParameters = new ServiceAreaParams({
          facilities: new FeatureSet({
              features: [location]
          }),
          defaultBreaks: cutoff,
          trimOuterPolygon: true,
          outSpatialReference: mapview.spatialReference
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
            let scoreMultiplier = 1;
              placesLayerView.queryFeatures(query).then((response) => {
                  //console.log(response.features);
                  response.features.forEach((place) => {
                    score += 100 * scoreMultiplier;
                    scoreDisplays.forEach((scoreDisplay) => {
                      scoreDisplay.innerHTML = score;
                    });
                    companiesFound++;
                    companyFoundDisplay.innerHTML = companiesFound;
                    objectIDs.push(place.attributes.OBJECTID);
                    scoreMultiplier++;
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

    // Toggle the visibility of the tab content
    if (tabContent.style.display === 'none') { // click --> open popup tab
        tabContent.style.display = 'block';
        popupTab.style.left = '0';
        // tabIcon.style.left = '370';
        tabIcon.style.top = '30';
        
    } else { // click --> hide tab
        tabContent.style.display = 'none';
        popupTab.style.left = '-35%';
        tabIcon.style.left = '10';
    }
}