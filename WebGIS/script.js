document.addEventListener("DOMContentLoaded", function() {
    
    // 1. Initialize the map (Coordinates set to Central Papua)
    const map = L.map('map').setView([-4.327393, 135.712797], 7);

    // 2. Add Esri Topographic Basemap for industrial look
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri'
    }).addTo(map);

    // 3. Drop initial static marker
    const marker = L.marker([-4.327393, 135.712797]).addTo(map);
    marker.bindPopup("<b>Titik Bor #1</b><br>Proposed Location").openPopup();
});