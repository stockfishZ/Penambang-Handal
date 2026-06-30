document.addEventListener("DOMContentLoaded", function() {
    
    // 1. Initialize ESG Map (Coordinates set to mock area)
    const map = L.map('esg-map', {
        zoomControl: false // optional, clears UI clutter
    }).setView([-4.327393, 135.712797], 7);

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
});