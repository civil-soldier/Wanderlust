mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v12',
    center: listing.geometry.coordinates, // [lng, lat]
    zoom: 9
});

// Marker + popup
const marker1 = new mapboxgl.Marker({ color: 'red' })
    .setLngLat(listing.geometry.coordinates)
    .setPopup(new mapboxgl.Popup({ offset: 25 })
        .setHTML(`
            <h4>${listing.title}</h4>
            <p>Exact Location will be provided after booking.</p>
        `))
    .addTo(map);

// Optional popup with image preview
const popupHTML = `
  <div>
    <img src="${listing.image.url.replace('/upload', '/upload/w_200,h_150,c_fill,q_auto,f_auto')}" 
         style="width:200px; height:150px; object-fit:cover;" />
    <h6>${listing.title}</h6>
  </div>
`;

// -------------------
// Add Controls
// -------------------

// 1. Navigation control (zoom in/out + compass)
map.addControl(new mapboxgl.NavigationControl(), 'top-right');

// 2. Fullscreen control
map.addControl(new mapboxgl.FullscreenControl(), 'top-right');

// 3. Scale control (metric + imperial units)
const scale = new mapboxgl.ScaleControl({
    maxWidth: 200,
    unit: 'metric'
});
map.addControl(scale, 'bottom-left');