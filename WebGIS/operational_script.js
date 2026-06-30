document.addEventListener("DOMContentLoaded", function() {
    
    // Initialize the map (Central Papua coordinates)
    const map = L.map('satellite-map', {
        zoomControl: false // Optional: hides the +/- if you want a cleaner dashboard look
    }).setView([-4.327393, 135.712797], 14); // Zoomed in closer for operational detail

    // Add Esri World Imagery (Satellite) Basemap
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    }).addTo(map);

    // Drop marker
    const marker = L.marker([-4.327393, 135.712797]).addTo(map);
    marker.bindPopup("<b>Titik Bor #1</b><br>Operational Zone").openPopup();

    /* --- FUTURE DATA FETCHING TEMPLATE ---
       Use these IDs to inject dynamic data later:
       
       document.getElementById('val-road').innerText = dynamicData.road + " km";
       document.getElementById('val-river').innerText = dynamicData.river + " km";
       document.getElementById('val-bts').innerText = dynamicData.bts + " km";
       document.getElementById('val-cutfill').innerHTML = dynamicData.cutfill + ' m<sup class="text-sm">2</sup>';
       
       document.getElementById('val-coverage-text').innerText = dynamicData.coverage + "%";
       document.getElementById('val-coverage-ring').setAttribute("stroke-dasharray", `${dynamicData.coverage}, 100`);
    */
});