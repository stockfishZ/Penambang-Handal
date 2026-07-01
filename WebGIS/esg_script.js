document.addEventListener("DOMContentLoaded", function() {
    
    // 1. Initialize ESG Map (Coordinates set to mock area)
    const map = L.map('esg-map', {
        zoomControl: false // optional, clears UI clutter
    }).setView([-4.327393, 135.712797], 7);

    // 1. Fetch Target Coordinates
    // NOTE: Ensure your index page executes something like: 
    // localStorage.setItem('drillCoords', JSON.stringify([135.712797, -4.327393]));
    const savedCoords = JSON.parse(localStorage.getItem('drillCoords'));
    
    // Turf uses [Longitude, Latitude]. Fallback to default if storage is empty.
    const drillLngLat = savedCoords || [135.712797, -4.327393]; 
    const drillPoint = turf.point(drillLngLat);

    // 2. Mock Spatial Databases (Update these with real Papua coordinates later)
    const waterSources = turf.featureCollection([
        turf.point([135.850000, -4.200000]), 
        turf.point([135.600000, -4.450000])
    ]);

    const settlements = turf.featureCollection([
        turf.point([135.900000, -4.300000]), 
        turf.point([135.500000, -4.250000])
    ]);

    // 3. Execute Spatial Analysis
    const nearestWater = turf.nearestPoint(drillPoint, waterSources);
    const nearestSettlement = turf.nearestPoint(drillPoint, settlements);

    const distWater = turf.distance(drillPoint, nearestWater, { units: 'kilometers' }).toFixed(1);
    const distSettlement = turf.distance(drillPoint, nearestSettlement, { units: 'kilometers' }).toFixed(1);

    // 4. Update the Dashboard DOM
    document.getElementById('dist-water').innerText = `${distWater} km`;
    document.getElementById('dist-settlement').innerText = `${distSettlement} km`;

    // Using satellite/topo hybrid to match ESG visual style
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri'
    }).addTo(map);

    // 2. Initialize Pie Chart Data
    // Change this array later via fetch() or API
    const esgData = {
        labels: ['Hutan Lindung', 'Hutan Produksi Tetap'],
        datasets: [{
            data: [80, 20],
            backgroundColor: ['#16a34a', '#eab308'], // Green, Yellow
            borderWidth: 0,
            hoverOffset: 4
        }]
    };

    // 3. Render Chart
    const ctx = document.getElementById('esgPieChart').getContext('2d');
    const esgChart = new Chart(ctx, {
        type: 'pie',
        data: esgData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                // Disable default legend to use our collision-free custom one
                legend: { display: false }, 
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return ` ${context.label}: ${context.parsed}%`;
                        }
                    }
                }
            }
        }
    });

    // 4. Generate Custom Scrollable Legend
    const legendContainer = document.getElementById('custom-legend');
    legendContainer.innerHTML = ''; // Clear prior entries
    
    esgData.labels.forEach((label, index) => {
        const color = esgData.datasets[0].backgroundColor[index];
        const value = esgData.datasets[0].data[index];
        
        const item = document.createElement('div');
        item.className = 'flex items-center space-x-2 text-sm';
        item.innerHTML = `
            <span class="w-3 h-3 rounded-sm inline-block flex-shrink-0" style="background-color: ${color};"></span>
            <span class="text-white font-medium truncate">${label} (${value}%)</span>
        `;
        legendContainer.appendChild(item);
    });

    // 1. Define Target
    const drillLat = -4.327393;
    const drillLng = 135.712797;
    const drillLatLgn = [drillLat, drillLng];
    
    // 2. Fetch from your new Node API
    fetch(`http://localhost:3000/api/nearest-water?lat=${drillLat}&lng=${drillLng}`)
        .then(res => res.json())
        .then(data => {
            const waterLatLgn = [data.lat, data.lng];
            
            // 3. Update DOM Dashboard
            document.getElementById('dist-water').innerText = `${data.dist_km.toFixed(1)} km`;
        
            // 4. Draw Map Vectors
            L.circleMarker(drillLatLgn, { color: '#ef4444', radius: 8, fillOpacity: 1 }).addTo(map).bindPopup("Titik Bor #1");
            L.circleMarker(waterLatLgn, { color: '#3b82f6', radius: 6, fillOpacity: 0.8 }).addTo(map).bindPopup("Titik Air Terdekat");
            L.polyline([drillLatLgn, waterLatLgn], { color: '#3b82f6', dashArray: '5, 5', weight: 2 }).addTo(map);
            
            // 5. Auto-frame the map
            map.fitBounds(L.latLngBounds([drillLatLgn, waterLatLgn]), { padding: [50, 50] });
        })
        .catch(err => console.error("API failed to fetch spatial data:", err));

    // 8. Auto-zoom the map to perfectly fit all three points
    const bounds = L.latLngBounds([drillLatLgn, waterLatLgn, settlementLatLgn]);
    map.fitBounds(bounds, { padding: [50, 50] });
});