
const zoom = 12
const center = {lng: 8.53, lat: 47.38}

const hackdaysDataURL = 
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQAlHdhghXRPd7bSL8xOZZ2jyKiDd52i6nc4sGKIBZPOAjEgzGrnp94-cFBAqF-LDNQyfHjjBrAJYq1/pub?gid=0&single=true&output=csv"

mapboxgl.accessToken =
  "pk.eyJ1IjoicmFmZmFlbGtyZWJzIiwiYSI6ImNqcmFxMmN4czByc3I0OW80eWhwcW4ybXMifQ.LCVgSPNn107Vdk_aTL98kw"

const map = new mapboxgl.Map({
  container: "honor-map",
  style: "mapbox://styles/mapbox/streets-v10",
  zoom,
  center,
})

map.on("load", () => {
  const geolocate = new mapboxgl.GeolocateControl({
    enableHighAccuracy: false,
    timeout: 6000,
    trackUserLocation: true
  })
  map.addControl(geolocate, 'top-left');

  // Add zoom and rotation controls to the map.
  map.addControl(new mapboxgl.NavigationControl())

  addHackdayMarkers(map)
})

const layer = (hackdaysData) => {
  const hackdaysFeatures = hackdaysData
    .filter(row => row[0] && row[1] && row[3] && row[6])
    .map(row => {
      if (row[0] && row[1] && row[3] && row[6]) return null
      const timestamp = row[0]
      const [lat, lng] = row[1].split(", ")
      const remark = row[3]
      const submissionID = row[6]
      return {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [lng, lat],
        },
        properties: {
          title: remark,
          icon: "circle-stroked",
        },
      }
    })

  return {
    id: "points",
    type: "symbol",
    source: {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: hackdaysFeatures,
      }
    },
    layout: {
      "icon-image": "{icon}-15",
      "text-field": "{title}",
      "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
      "text-offset": [0, 0.6],
      "text-anchor": "top",
    },
  }
}

const flyTarget = (hackdaysData) => {
  const rowsWithCoordinates = hackdaysData.filter(row => row[1])
  if (rowsWithCoordinates.length < 1) return
  const [lat, lng] = rowsWithCoordinates[0][1].split(", ")
  return {center: [lng, lat]}
}

const addHackdayMarkers = (map) => {
  Papa.parse(hackdaysDataURL, {
    download: true, 
    header: true, 
    complete: (results) => {
      const hackdaysData = results.data
      console.log(`Loaded ${hackdaysData.length} rows from CSV:`, hackdaysData)
      map.addLayer(layer(hackdaysData))
      map.flyTo(flyTarget(hackdaysData))
    },
    error: (err, file, inputElem, reason) => {
      console.log("Could not load CSV:", {err, file, inputElem, reason})
    }
  })
}
