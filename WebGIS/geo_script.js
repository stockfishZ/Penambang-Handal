document.addEventListener("DOMContentLoaded", function() {
    
    // 1. Initialize Map
    const map = L.map('map').setView([-4.327393, 135.712797], 9);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CARTO'
    }).addTo(map);

    // --- DYNAMIC GEOTIFF RASTER ---
    // You must export your Surfer/QGIS data as a raw GeoTIFF (.tif)
    const geoTiffUrl = '../asset-image/your_raw_data.tif'; 

    fetch(geoTiffUrl)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => {
            parseGeoraster(arrayBuffer).then(georaster => {
                const layer = new GeoRasterLayer({
                    georaster: georaster,
                    opacity: 0.75,
                    resolution: 256, // Higher = better quality, lower = better performance
                    
                    // The Geeky Part: Dynamic Color Mapping
                    pixelValuesToColorFn: values => {
                        const val = values[0];
                        if (val === georaster.noDataValue || val < 10) return null; // Transparent 
                        
                        // Replicating your provided 0-1550 legend
                        if (val > 1395) return '#8B0000'; // Dark Red
                        if (val > 1240) return '#FF0000'; // Red
                        if (val > 1085) return '#FF4500'; // Orange-Red
                        if (val > 930)  return '#FFA500'; // Orange
                        if (val > 775)  return '#ADFF2F'; // Green-Yellow
                        if (val > 620)  return '#00FF00'; // Green
                        if (val > 465)  return '#00FFFF'; // Cyan
                        if (val > 310)  return '#1E90FF'; // Blue
                        if (val > 155)  return '#0000CD'; // Medium Blue
                        return '#000080';                 // Navy
                    }
                });
                
                layer.addTo(map);
                
                // Automatically center and zoom the map to the exact 100x100km bounds of your data
                map.fitBounds(layer.getBounds());
            });
        }).catch(err => console.error("GeoTIFF parsing failed. Check file path.", err));

    // Drill Point Marker
    const marker = L.marker([-4.327393, 135.712797]).addTo(map);
    marker.bindPopup("<b>Titik Bor #1</b>").openPopup();


    // 2. Dynamic Data Object for the UI
    const drillPointData = {
        indices: {
            iron: 5,        // Max is assumed 5 based on image
            clay: 3,
            vegetation: 4
        },
        aiConfidence: {
            min: 82,
            max: 90
        },
        lithology: {
            laterite: 25, 
            saprolite: 45,
            saprock: 10,
            bedrock: 20
        },
        totalDepth: 16, // Add this! Total drilling depth in meters
        labels: {
            lateriteTxt: "16.6%", 
            saproliteTxt: "50%"
        }
    };

    // 3. Render function to apply logic to DOM
    setTimeout(() => {
        // Render Indices (Assuming Max Value = 5 for percentage calculation)
        const maxIndex = 5;
        document.getElementById('bar-iron').style.width = `${(drillPointData.indices.iron / maxIndex) * 100}%`;
        document.getElementById('val-iron').innerText = drillPointData.indices.iron;
        
        document.getElementById('bar-clay').style.width = `${(drillPointData.indices.clay / maxIndex) * 100}%`;
        document.getElementById('val-clay').innerText = drillPointData.indices.clay;
        
        document.getElementById('bar-veg').style.width = `${(drillPointData.indices.vegetation / maxIndex) * 100}%`;
        document.getElementById('val-veg').innerText = drillPointData.indices.vegetation;

        // --- Render AI Confidence Interval (Windowed Range & Collision Logic) ---
        const confMin = drillPointData.aiConfidence.min;
        const confMax = drillPointData.aiConfidence.max;

        // 1. Calculate the Window Bounds (Min 0, Max 100)
        const displayMin = Math.max(0, confMin - 10);
        const displayMax = Math.min(100, confMax + 10);
        const displayRange = displayMax - displayMin;

        // 2. Map the White Bar to the new Window Space
        const relLeft = ((confMin - displayMin) / displayRange) * 100;
        const relWidth = ((confMax - confMin) / displayRange) * 100;
        const relAvg = relLeft + (relWidth / 2);
        const confAvg = (confMin + confMax) / 2;

        // 3. Apply styles to the bar
        const barConf = document.getElementById('bar-conf');
        barConf.style.left = `${relLeft}%`;
        barConf.style.width = `${relWidth}%`;

        // 4. (DELETED: Axis bounds update)

        // 5. Collision Logic for Inner Labels
        const labelsContainer = document.getElementById('conf-labels-container');
        const confDiff = confMax - confMin;

        if (confDiff < 3) {
            labelsContainer.innerHTML = `<span class="absolute transform -translate-x-1/2 font-bold" style="left: ${relAvg}%">${confAvg}%</span>`;
        } else {
            labelsContainer.innerHTML = `
                <span class="absolute transform -translate-x-1/2 font-bold" style="left: ${relLeft}%">${confMin}%</span>
                <span class="absolute transform -translate-x-1/2 font-bold" style="left: ${relAvg}%">${confAvg}%</span>;
                <span class="absolute transform -translate-x-1/2 font-bold" style="left: ${relLeft + relWidth}%">${confMax}%</span>
            `;
        }

        document.getElementById('conf-text').innerHTML = `Berdasarkan data yang sudah diinput, AI GeoNiRisk memiliki <b>HIGH</b> confidence pada Titik Bor #1 dengan minimum prospectivity <b>${confMin}%</b> dan maximum prospectivity <b>${confMax}%</b>.`;

        // --- Render Lithology Stacked Bar Widths & Conditional Text ---
        const layers = [
            { id: 'litho-lat', val: drillPointData.lithology.laterite },
            { id: 'litho-sap', val: drillPointData.lithology.saprolite },
            { id: 'litho-sapr', val: drillPointData.lithology.saprock },
            { id: 'litho-bed', val: drillPointData.lithology.bedrock }
        ];
        
        layers.forEach(layer => {
            const el = document.getElementById(layer.id);
            el.style.width = `${layer.val}%`;
            
            // UI Constraint: Only print the percentage if the layer is greater than 10% wide.
            // Anything smaller will remain blank to prevent ugly text overlap.
            el.innerText = layer.val > 10 ? `${layer.val}%` : '';
        });

        // --- Render Dynamic Depth Scale ---
        const depthContainer = document.getElementById('depth-scale-container');
        const totalDepth = drillPointData.totalDepth; // Set this to 20 in your data object!
        let cumulativePct = 0;
            
        // 1. Inject the starting 0m tick at 0%
        let scaleHTML = `
            <div class="absolute -ml-px w-px h-2 bg-white" style="left: 0%;"></div>
            <span class="absolute transform -translate-x-1/2 top-3 text-[10px] text-gray-300" style="left: 0%;">0m</span>
        `;
            
        // 2. Inject the dynamic boundary ticks
        const layerPercentages = [
            drillPointData.lithology.laterite,
            drillPointData.lithology.saprolite,
            drillPointData.lithology.saprock
        ];
        
        layerPercentages.forEach(pct => {
            cumulativePct += pct;
            const depthAtBoundary = parseFloat(((cumulativePct / 100) * totalDepth).toFixed(1));
            
            scaleHTML += `
                <div class="absolute -ml-px w-px h-2 bg-white" style="left: ${cumulativePct}%;"></div>
                <span class="absolute transform -translate-x-1/2 top-3 text-[10px] text-gray-300" style="left: ${cumulativePct}%;">${depthAtBoundary}m</span>
            `;
        });
        
        // 3. Inject the final total depth tick at 100%
        scaleHTML += `
            <div class="absolute -ml-px w-px h-2 bg-white" style="left: 100%;"></div>
            <span class="absolute transform -translate-x-1/2 top-3 text-[10px] text-gray-300" style="left: 100%;">${totalDepth}m</span>
        `;
        
        depthContainer.innerHTML = scaleHTML;
    }, 100); // Slight delay to allow CSS transition to trigger after DOM load
});