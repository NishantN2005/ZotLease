<template>
  <div id="map" class="relative h-full w-full mt-16"></div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { makeAuthenticatedRequest } from '../services/authService.js'
import { useSelectedSubleaseStore } from '@/stores/SelectedSubleaseStore.js'
import { useFilterStore } from '@/stores/filterStore'
import { useAllLocationsStore } from '@/stores/AllLocationsStore'
import { useMapStore } from '@/stores/mapStore.js'
import { MAPBOX_ACCESS_TOKEN } from '../../constants.js'
import 'leaflet-arrowheads'
import { useUserStore } from '@/stores/userStore.js'
import { debounce } from 'lodash-es'

let hasLocatedUser = false

export default {
  name: 'LeafletMap',
  props: {
    routerPass: {
      type: Object,
      required: true,
    },
    userID: {
      type: [String, null],
      required: true,
    },
    turnOnSubleaseModal: {
      type: Function,
      required: true,
    },
    // The filter form object, e.g. { gender: 'Male', minPrice: 500, maxPrice: 1200 }
    filterForm: {
      type: Object,
      required: true,
    },
    setEventPos: {
      type: Function,
      required: true,
    },
    turnOffLoading: {
      type: Function,
      required: true,
    },
  },

  setup(props) {
    // Leaflet map and layer references
    let map = null
    let markersLayer = null
    let observer = null

    const MAPBOX_TILE_URL = `https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${MAPBOX_ACCESS_TOKEN}`

    const selectedSubleaseStore = useSelectedSubleaseStore()
    const filterStore = useFilterStore()
    const allLocationsStore = useAllLocationsStore()
    const userStore = useUserStore()
    const mapStore = useMapStore()

    onMounted(() => {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && map) {
          map.invalidateSize()
        }
      })

      setTimeout(() => {
        if (map) map.invalidateSize()
      }, 500)
    })

    const handleResize = () => {
      if (map) map.invalidateSize()
    }

    window.addEventListener('resize', handleResize)

    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
    })

    // 1. Fetch location data from your backend
    const fetchLocations = async () => {
      const bounds = map.getBounds()
      const sw = bounds.getSouthWest()
      const ne = bounds.getNorthEast()
      console.log('sw here', sw)
      try {
        const response = await makeAuthenticatedRequest(
          'sublease/retrieve',
          { swLat: sw.lat, swLng: sw.lng, neLat: ne.lat, neLng: ne.lng }, // any payload if needed
          props.routerPass,
        )
        // Return the parsed JSON array of subleases
        return await response.json()
      } catch (error) {
        console.error('Error fetching location data:', error)
        return []
      }
    }

    // 2. Create a custom marker icon
    const createHexMarker = (label, isUserLeaser) => {
      const markerColor = isUserLeaser ? '#FFF' : '#0096FF'
      const textColor = isUserLeaser ? '#0096FF' : '#FFF'
      return L.divIcon({
        className: 'custom-price-icon',
        html: `
      <div class="price-bar inline-flex items-center justify-center rounded-full shadow-md px-2 py-1 min-w-[40px] transition-transform duration-200 hover:scale-[1.15]"
           style="background-color: ${markerColor};">
        <div class="text-md font-semibold whitespace-nowrap" style="color: ${textColor};">${label}</div>
      </div>
    `,
        iconSize: [50, 50],
        iconAnchor: [25, 25],
      })
    }

    // 3. Add markers for given locations, respecting the filter store
    const addMarkers = (locations) => {
      const grouped = {}

      // Group locations by subleaseid
      locations.forEach((loc) => {
        if (!loc.latitude || !loc.longitude) return
        if (!grouped[loc.subleaseid]) grouped[loc.subleaseid] = []
        grouped[loc.subleaseid].push(loc)
      })

      for (const subleaseid in grouped) {
        const group = grouped[subleaseid]
        const mainLoc = group[0] // Just use the first one for lat/lng

        const passesFilter =
          !filterStore.isFiltered || filterStore.acceptedSubleases.includes(subleaseid)

        if (!passesFilter) continue

        const isUserLeaser = String(mainLoc.listerid).trim() === String(props.userID).trim()
        const priceOrCount = group.length > 1 ? `${group.length} Listings` : `$${mainLoc.price}`
        const markerIcon = createHexMarker(priceOrCount, isUserLeaser)

        const marker = L.marker([mainLoc.latitude, mainLoc.longitude], {
          icon: markerIcon,
        }).addTo(markersLayer)

        marker.subleaseID = subleaseid
        marker.id = mainLoc.id

        marker.on('click', async () => {
          const subid = marker.subleaseID
          const uniqueid = marker.id
          const userid = userStore.userID

          let info = await makeAuthenticatedRequest(
            'sublease/selectedInfo',
            { subleaseID: subid, uniqueid, userid },
            props.routerPass,
          )

          const subleaseData = await info.json()

          if (selectedSubleaseStore.subleaseID !== subleaseData[0].subleaseid) {
            selectedSubleaseStore.resetSelectedSublease()
            selectedSubleaseStore.setSelectedSubleaseID(subleaseData[0].subleaseid)
            subleaseData.forEach(({ subleaseid, id, ...rest }) => {
              selectedSubleaseStore.addSubletter(rest)
            })
          }

          props.turnOnSubleaseModal()
        })
      }
    }

    // 4. Set up map on mount
    onMounted(async () => {
      const mapContainer = document.getElementById('map')

      // Initialize the Leaflet map
      map = L.map(mapContainer, {
        zoomControl: false,
      }).setView([mapStore.mapCenter.lat, mapStore.mapCenter.lng], mapStore.mapCenter.zoom)

      // Add the Mapbox tile layer
      L.tileLayer(MAPBOX_TILE_URL, {
        maxZoom: 19,
        id: 'mapbox/navigation-night-v1',
        tileSize: 512,
        zoomOffset: -1,
        attribution:
          'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
          '<a href="https://www.mapbox.com/">Mapbox</a>',
      }).addTo(map)

      // Create a LayerGroup to hold markers
      markersLayer = L.layerGroup().addTo(map)

      // Fetch all locations once
      allLocationsStore.setAllLocations(await fetchLocations())

      // Add markers for the initial load
      addMarkers(allLocationsStore.allLocations)
      props.turnOffLoading()

      map.on('moveend', async () => {
        let updatedLocations = await fetchLocations()
        allLocationsStore.setAllLocations(updatedLocations)
        markersLayer.clearLayers()
        addMarkers(updatedLocations)
      })

      // Only locate if we haven't already done so.
      if (!hasLocatedUser) {
        map.locate({ setView: true, maxZoom: 16, enableHighAccuracy: true })
        map.on('locationfound', (e) => {
          const { latitude, longitude } = e
          map.setView(longitude, latitude, 16) // Zoom into the user's location
        })

        map.on('locationerror', () => {
          console.error('Geolocation failed.')
        })

        hasLocatedUser = true
      }

      // 5. Watch filter store changes.
      //    Whenever `acceptedSubleases` changes, re-draw markers.
      watch(
        () => [filterStore.acceptedSubleases, filterStore.isFiltered],
        ([newAcceptedSubleases, newIsFiltered]) => {
          markersLayer.clearLayers()
          addMarkers(allLocationsStore.allLocations)
        },
      )

      // Watch for location updates
      console.log('Initializing watch on mapCenter')
      watch(
        () => mapStore.mapCenter,
        ({ lat, lng, zoom }) => {
          console.log('but whyyyy')
          flyToLocation(lat, lng, zoom)
        },
        { deep: true },
      )

      const flyToLocation = (lat, lng, zoom) => {
        if (!map) return

        const currentZoom = map.getZoom()

        const flyToOptions = {
          duration: 1.5,
          essential: true,
          zoom: currentZoom,
          easeTo: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
          animate: true,
          onEachFrame: (progress) => {
            if (progress < 0.3 && zoom > currentZoom) {
              map.setZoom(currentZoom - 0.5 * progress)
            }
          },
          curve: 1.2,
          minZoomSpeed: 0.5,
          screenSpeed: 1.2,
        }

        return map.flyTo([lat, lng], zoom, flyToOptions)
      }

      watch(
        () => allLocationsStore.allLocations,
        (newLocations) => {
          markersLayer.clearLayers()
          addMarkers(newLocations)
        },
        { deep: true },
      )

      // Define bus routes using polylines
      const mLine = [
        [33.650966, -117.841822],
        [33.649948, -117.841076],
        [33.649162, -117.839874],
        [33.648495, -117.838773],
        [33.648156, -117.838054],
        [33.647915, -117.837324],
        [33.647799, -117.836669],
        [33.647736, -117.835349],
        [33.647811, -117.83465],
        [33.648775, -117.830163],
        [33.64642, -117.829404],
        [33.645366, -117.829189],
        [33.644509, -117.82921],
        [33.643735, -117.829268],
        [33.643024, -117.829495],
        [33.642306, -117.829719],
        [33.63916, -117.8303],
        [33.639848, -117.832361],
        [33.641211, -117.834853],
        [33.642713, -117.836383],
        [33.642489, -117.837578],
        [33.64281, -117.839049],
        [33.64281, -117.839951],
        [33.64239, -117.841911],
        [33.642172, -117.842952],
        [33.641725, -117.84409],
        [33.641649, -117.845555],
        [33.64139, -117.847133],
        [33.641551, -117.847949],
        [33.641962, -117.848615],
        [33.642982, -117.849177],
        [33.643921, -117.849241],
        [33.644863, -117.849077],
        [33.645862, -117.848752],
        [33.646397, -117.848893],
        [33.646799, -117.847991],
        [33.647764, -117.847271],
        [33.648479, -117.846662],
        [33.648837, -117.845811],
        [33.649065, -117.844404],
        [33.649365, -117.843559],
        [33.649633, -117.8432],
        [33.650116, -117.842878],
        [33.650565, -117.842507],
        [33.650966, -117.841822],
      ]

      const eLine = [
        [33.650967, -117.841873],
        [33.65033, -117.841384],
        [33.649969, -117.840997],
        [33.648416, -117.838528],
        [33.648152, -117.837948],
        [33.647911, -117.837127],
        [33.647812, -117.836574],
        [33.647769, -117.835398],
        [33.647827, -117.834672],
        [33.64881, -117.830164],
        [33.649217, -117.828181],
        [33.649749, -117.825782],
        [33.649863, -117.82565],
        [33.650054, -117.824448],
        [33.650672, -117.824881],
        [33.651038, -117.825019],
        [33.654476, -117.827098],
        [33.655276, -117.827466],
        [33.655937, -117.827649],
        [33.657397, -117.827707],
        [33.657668, -117.839841],
        [33.657596, -117.840856],
        [33.657427, -117.841543],
        [33.657087, -117.842306],
        [33.656784, -117.842853],
        [33.654975, -117.844873],
        [33.6541, -117.843746],
        [33.653412, -117.842884],
        [33.652877, -117.842466],
        [33.652394, -117.842283],
        [33.651689, -117.842111],
        [33.650967, -117.841873],
      ]
      const aLine = [
        [33.651088, -117.841726],
        [33.651432, -117.84084],
        [33.652035, -117.840056],
        [33.65263, -117.839579],
        [33.653414, -117.838597],
        [33.652795, -117.837937],
        [33.652551, -117.837682],
        [33.651988, -117.836887],
        [33.651787, -117.836549],
        [33.651341, -117.835464],
        [33.651341, -117.835464],
        [33.651171, -117.834959],
        [33.651167, -117.834702],
        [33.651117, -117.834047],
        [33.651116, -117.833669],
        [33.651282, -117.832338],
        [33.651282, -117.832338],
        [33.651115, -117.830867],
        [33.65071, -117.830678],
        [33.650241, -117.830543],
        [33.649005, -117.830147],
        [33.648692, -117.830114],
        [33.646996, -117.829608],
        [33.647135, -117.828969],
        [33.647483, -117.828387],
        [33.647783, -117.827918],
        [33.64795, -117.827252],
        [33.647979, -117.826691],
        [33.647894, -117.826159],
        [33.647743, -117.825735],
        [33.647417, -117.825236],
        [33.646872, -117.824777],
        [33.646158, -117.824342],
        [33.645553, -117.824056],
        [33.64492, -117.823891],
        [33.644379, -117.8238],
        [33.643919, -117.82377],
        [33.64306, -117.82385],
        [33.641992, -117.824139],
        [33.640724, -117.824718],
        [33.640098, -117.825159],
        [33.639866, -117.82547],
        [33.639723, -117.82576],
        [33.639661, -117.826146],
        [33.639723, -117.826277],
        [33.639615, -117.82635],
        [33.639548, -117.826232],
        [33.639647, -117.82613],
        [33.639691, -117.825878],
        [33.639758, -117.825669],
        [33.63991, -117.825379],
        [33.64014, -117.825133],
        [33.641228, -117.824415],
        [33.643049, -117.823828],
        [33.642978, -117.823399],
        [33.642595, -117.822612],
        [33.642483, -117.821877],
        [33.643444, -117.821757],
        [33.644283, -117.821797],
        [33.645155, -117.821963],
        [33.645943, -117.822215],
        [33.646636, -117.822543],
        [33.64813, -117.823381],
        [33.648918, -117.823819],
        [33.649926, -117.824389],
        [33.650102, -117.824528],
        [33.649874, -117.825629],
        [33.649879, -117.825811],
        [33.648933, -117.83013],
        [33.648463, -117.832328],
        [33.647966, -117.834565],
        [33.647863, -117.83532],
        [33.647868, -117.835835],
        [33.64793, -117.836621],
        [33.648011, -117.837131],
        [33.64824, -117.837876],
        [33.648502, -117.838491],
        [33.649976, -117.840826],
        [33.65044, -117.841321],
        [33.651088, -117.841726],
      ]

      const nLine = [
        [33.651076, -117.84173],
        [33.651422, -117.840843],
        [33.652031, -117.840018],
        [33.6524, -117.839722],
        [33.652896, -117.839335],
        [33.653406, -117.83859],
        [33.653143, -117.838316],
        [33.652477, -117.837565],
        [33.651962, -117.836871],
        [33.651604, -117.836194],
        [33.651329, -117.83538],
        [33.651244, -117.8353],
        [33.651168, -117.834929],
        [33.651191, -117.834731],
        [33.651114, -117.834033],
        [33.651189, -117.83282],
        [33.651283, -117.832313],
        [33.651689, -117.831218],
        [33.652298, -117.830141],
        [33.652851, -117.829125],
        [33.653019, -117.828708],
        [33.653675, -117.826798],
        [33.650952, -117.825154],
        [33.6507, -117.824999],
        [33.650677, -117.824891],
        [33.650104, -117.824563],
        [33.649925, -117.824568],
        [33.645975, -117.822349],
        [33.645456, -117.822159],
        [33.644951, -117.82203],
        [33.644496, -117.821949],
        [33.644003, -117.821887],
        [33.643511, -117.821865],
        [33.643149, -117.821892],
        [33.643149, -117.821892],
        [33.642479, -117.821897],
        [33.642569, -117.822493],
        [33.642948, -117.823368],
        [33.643058, -117.823836],
        [33.64388, -117.823756],
        [33.644377, -117.823815],
        [33.645105, -117.823943],
        [33.645559, -117.824064],
        [33.645935, -117.824228],
        [33.646337, -117.824448],
        [33.647159, -117.82498],
        [33.647493, -117.825334],
        [33.647752, -117.825775],
        [33.647921, -117.826226],
        [33.647962, -117.826531],
        [33.647989, -117.82688],
        [33.647976, -117.827186],
        [33.647846, -117.827739],
        [33.647689, -117.828082],
        [33.64743, -117.82849],
        [33.647256, -117.828763],
        [33.64718, -117.828924],
        [33.647006, -117.829499],
        [33.648926, -117.830108],
        [33.648465, -117.832315],
        [33.647952, -117.834578],
        [33.647872, -117.835308],
        [33.647859, -117.835849],
        [33.647908, -117.836547],
        [33.647948, -117.836837],
        [33.648239, -117.837887],
        [33.648444, -117.838408],
        [33.649814, -117.840612],
        [33.650435, -117.841296],
        [33.651058, -117.841734],
        [33.651076, -117.84173],
      ]

      const hLine = [
        [33.654974, -117.844851],
        [33.653844, -117.843327],
        [33.653465, -117.842922],
        [33.653086, -117.842616],
        [33.652862, -117.842466],
        [33.652385, -117.842248],
        [33.652099, -117.842178],
        [33.651646, -117.842098],
        [33.651137, -117.841921],
        [33.650505, -117.84154],
        [33.650274, -117.841354],
        [33.649943, -117.841],
        [33.649719, -117.840705],
        [33.64857, -117.838858],
        [33.64814, -117.83797],
        [33.647836, -117.836847],
        [33.64776, -117.83536],
        [33.647819, -117.834724],
        [33.6488, -117.830181],
        [33.646995, -117.829604],
        [33.647151, -117.828949],
        [33.647465, -117.828432],
        [33.647706, -117.828067],
        [33.647849, -117.827733],
        [33.64796, -117.827175],
        [33.647974, -117.826705],
        [33.647893, -117.826222],
        [33.647764, -117.825792],
        [33.647572, -117.825465],
        [33.647344, -117.825148],
        [33.647087, -117.824929],
        [33.646577, -117.824617],
        [33.646039, -117.824305],
        [33.645575, -117.824079],
        [33.645454, -117.824031],
        [33.644845, -117.823898],
        [33.644402, -117.823832],
        [33.643884, -117.823773],
        [33.643622, -117.823777],
        [33.643063, -117.823848],
        [33.643063, -117.823848],
        [33.641461, -117.82433],
        [33.640903, -117.824614],
        [33.640296, -117.825019],
        [33.640121, -117.825164],
        [33.639934, -117.825395],
        [33.639795, -117.825647],
        [33.639693, -117.825916],
        [33.639661, -117.826162],
        [33.639724, -117.826297],
        [33.639612, -117.826366],
        [33.639554, -117.826248],
        [33.639643, -117.826136],
        [33.639688, -117.82591],
        [33.639911, -117.8254],
        [33.640157, -117.82511],
        [33.640706, -117.824724],
        [33.641421, -117.824339],
        [33.642002, -117.824103],
        [33.643057, -117.823832],
        [33.643871, -117.823745],
        [33.644677, -117.823847],
        [33.645567, -117.824042],
        [33.645978, -117.824233],
        [33.647149, -117.824965],
        [33.647757, -117.825786],
        [33.647949, -117.826446],
        [33.647979, -117.827186],
        [33.647845, -117.827757],
        [33.647711, -117.828073],
        [33.647434, -117.828492],
        [33.647273, -117.828734],
        [33.647175, -117.828919],
        [33.647032, -117.829483],
        [33.648935, -117.83009],
        [33.648458, -117.832316],
        [33.647925, -117.83474],
        [33.647925, -117.83474],
        [33.647873, -117.835316],
        [33.648569, -117.835369],
        [33.648804, -117.835432],
        [33.649386, -117.835479],
        [33.649386, -117.835479],
        [33.650605, -117.835273],
        [33.651288, -117.835081],
        [33.65136, -117.835258],
        [33.651329, -117.835403],
        [33.651588, -117.836133],
        [33.652356, -117.837405],
        [33.653433, -117.83861],
        [33.654009, -117.838997],
        [33.654674, -117.839163],
        [33.655195, -117.839146],
        [33.656304, -117.838861],
        [33.657666, -117.83877],
        [33.657696, -117.839797],
        [33.657651, -117.840428],
        [33.657521, -117.841158],
        [33.657249, -117.842001],
        [33.656825, -117.842763],
        [33.656379, -117.843332],
        [33.655043, -117.844775],
        [33.654974, -117.844851],
      ]
      // Add polylines to the map
      // Add polylines to the map with increased weight
      const polylines = [
        L.polyline(mLine, { color: 'green', opacity: 0.5, weight: 4 })
          .arrowheads({ size: '6px', frequency: '400m' })
          .addTo(map),
        L.polyline(eLine, { color: 'purple', opacity: 0.5, weight: 4 })
          .arrowheads({ size: '6px', frequency: '400m' })
          .addTo(map),
        L.polyline(aLine, { color: 'yellow', opacity: 0.6, weight: 4 })
          .arrowheads({ size: '6px', frequency: '400m' })
          .addTo(map),
        L.polyline(nLine, { color: 'red', opacity: 0.5, weight: 4 })
          .arrowheads({ size: '6px', frequency: '400m' })
          .addTo(map),
        L.polyline(hLine, { color: 'blue', opacity: 0.4, weight: 4 })
          .arrowheads({ size: '6px', frequency: '400m' })
          .addTo(map),
      ]

      // Add hover effect to polylines
      polylines.forEach((polyline, index) => {
        polyline.on('mouseover', () => {
          polylines.forEach((p, i) => {
            if (i !== index) {
              p.setStyle({ opacity: 0 })
            }
          })
          polyline.setStyle({ opacity: 1 })
        })

        polyline.on('mouseout', () => {
          polylines.forEach((p) => p.setStyle({ opacity: 0.5 }))
        })
      })

      /*Legend specific*/
      // var legend = L.control({ position: 'topright' })

      // legend.onAdd = function (map) {
      //   var div = L.DomUtil.create('div', 'bg-white m-16 px-4 py-2 rounded-lg shadow-lg legend')
      //   div.innerHTML += '<h4>Bus Lines</h4>'
      //   div.innerHTML += '<i style="background: #FF0000"></i><span>N Line</span><br>'
      //   div.innerHTML += '<i style="background: #448D40"></i><span>M Line</span><br>'
      //   div.innerHTML += '<i style="background: #800080"></i><span>E Line</span><br>'
      //   div.innerHTML += '<i style="background: #FFFF00"></i><span>A Line</span><br>'
      //   div.innerHTML += '<i style="background: #0000FF"></i><span>H Line</span><br>'
      //   return div
      // }

      // legend.addTo(map)

      // legend.addTo(map)
    })

    // 6. Clean up on unmount
    onUnmounted(() => {
      if (observer) observer.disconnect()
      if (map) {
        map.remove()
        map = null
      }
    })

    return {
      MAPBOX_ACCESS_TOKEN,
    }
  },
}
</script>

<style>
/* Style for the Leaflet attribution */
.leaflet-control-attribution {
  font-size: 0.45rem;
  opacity: 0.7;
  padding: 0.25rem 0.5rem;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 0.375rem;
}

/* Smaller size for small screens */
@media (max-width: 640px) {
  .leaflet-control-attribution {
    font-size: 0.25rem;
    padding: 0.1rem 0.3rem;
  }
}

/*Legend specific*/
.legend {
  padding: 6px 8px;
  font:
    14px Arial,
    Helvetica,
    sans-serif;
  background: white;
  background: rgba(255, 255, 255, 0.8);
  /*box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);*/
  /*border-radius: 5px;*/
  line-height: 24px;
  color: #555;
}
.legend h4 {
  text-align: center;
  font-size: 16px;
  margin: 2px 12px 8px;
  color: #777;
}

.legend span {
  position: relative;
  bottom: 3px;
}

.legend i {
  width: 18px;
  height: 18px;
  float: left;
  margin: 0 8px 0 0;
  opacity: 0.7;
}

.legend i.icon {
  background-size: 18px;
  background-color: rgba(255, 255, 255, 1);
}
</style>
