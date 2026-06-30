document.addEventListener("DOMContentLoaded", function() {
    
    const form = document.getElementById('dataEditForm');
    const updateBtn = document.getElementById('update-btn');
    const statusMsg = document.getElementById('status-message');

    // Lithology Elements
    const lithoInputs = document.querySelectorAll('.litho-input');
    const lithoSumDisplay = document.getElementById('litho-sum-display');

    // Land Use Elements
    const landInputs = document.querySelectorAll('.land-input');
    const landSumDisplay = document.getElementById('land-sum-display');

    // AI Confidence
    const aiMin = document.getElementById('ai-min');
    const aiMax = document.getElementById('ai-max');
    const errAi = document.getElementById('err-ai');

    // Validation State Tracking
    let isLithoValid = false;
    let isLandValid = false;
    let isAiValid = false;

    // --- Data Fetching Mock ---
    function fetchCurrentData() {
        // In reality, you grab the ID from the URL (e.g., ?id=Titik_Bor_2) and fetch from your DB.
        // We are mocking the payload here. Notice the math checks out perfectly.
        const mockDbPayload = {
            titikName: "Titik Bor #2 - Alpha Sector",
            lat: -4.327393, lon: 135.712797,
            idxIron: 4, idxClay: 2, idxVeg: 1,
            aiMin: 78, aiMax: 92,
            litho: [45, 25, 20, 10], // Sums to 100
            distWater: 1.5, distSettlement: 8.2,
            land: [30, 20, 50, 0], // Sums to 100
            opsRoad: 4.1, opsRiver: 2.2, opsBts: 12.0, opsCutfill: 3450
        };

        // Populate fields
        document.getElementById('titik-name').value = mockDbPayload.titikName;
        document.getElementById('lat').value = mockDbPayload.lat;
        document.getElementById('lon').value = mockDbPayload.lon;
        document.getElementById('idx-iron').value = mockDbPayload.idxIron;
        document.getElementById('idx-clay').value = mockDbPayload.idxClay;
        document.getElementById('idx-veg').value = mockDbPayload.idxVeg;
        aiMin.value = mockDbPayload.aiMin;
        aiMax.value = mockDbPayload.aiMax;
        
        document.getElementById('litho-1').value = mockDbPayload.litho[0];
        document.getElementById('litho-2').value = mockDbPayload.litho[1];
        document.getElementById('litho-3').value = mockDbPayload.litho[2];
        document.getElementById('litho-4').value = mockDbPayload.litho[3];
        
        document.getElementById('dist-water').value = mockDbPayload.distWater;
        document.getElementById('dist-settlement').value = mockDbPayload.distSettlement;
        
        document.getElementById('land-1').value = mockDbPayload.land[0];
        document.getElementById('land-2').value = mockDbPayload.land[1];
        document.getElementById('land-3').value = mockDbPayload.land[2];
        document.getElementById('land-4').value = mockDbPayload.land[3];

        document.getElementById('ops-road').value = mockDbPayload.opsRoad;
        document.getElementById('ops-river').value = mockDbPayload.opsRiver;
        document.getElementById('ops-bts').value = mockDbPayload.opsBts;
        document.getElementById('ops-cutfill').value = mockDbPayload.opsCutfill;

        // Force validation logic to run now that data is injected
        validateLithology();
        validateLandUse();
        validateAiConfidence();
        checkGlobalValidity();
    }

    // --- 1. Lithology Validation ---
    function validateLithology() {
        let sum = 0;
        lithoInputs.forEach(input => { sum += parseFloat(input.value) || 0; });
        lithoSumDisplay.innerText = `Sum: ${sum}%`;
        if (sum === 100) {
            lithoSumDisplay.classList.replace('text-red-600', 'text-green-600');
            isLithoValid = true;
        } else {
            lithoSumDisplay.classList.replace('text-green-600', 'text-red-600');
            isLithoValid = false;
        }
        checkGlobalValidity();
    }

    // --- 2. Land Use Validation ---
    function validateLandUse() {
        let sum = 0;
        landInputs.forEach(input => { sum += parseFloat(input.value) || 0; });
        landSumDisplay.innerText = `Sum: ${sum}%`;
        if (sum === 100) {
            landSumDisplay.classList.replace('text-red-600', 'text-green-600');
            isLandValid = true;
        } else {
            landSumDisplay.classList.replace('text-green-600', 'text-red-600');
            isLandValid = false;
        }
        checkGlobalValidity();
    }

    // --- 3. AI Confidence Validation ---
    function validateAiConfidence() {
        const minVal = parseFloat(aiMin.value) || 0;
        const maxVal = parseFloat(aiMax.value) || 0;
        if (minVal > maxVal) {
            errAi.classList.remove('hidden');
            isAiValid = false;
        } else {
            errAi.classList.add('hidden');
            isAiValid = true;
        }
        checkGlobalValidity();
    }

    // --- 4. Master Form Validity Check ---
    function checkGlobalValidity() {
        if (form.checkValidity() && isLithoValid && isLandValid && isAiValid) {
            updateBtn.disabled = false;
            updateBtn.classList.remove('bg-gray-500', 'cursor-not-allowed');
            updateBtn.classList.add('bg-teal-500', 'hover:bg-teal-400', 'cursor-pointer');
            statusMsg.innerText = "Data intact. Ready for update.";
            statusMsg.classList.replace('text-red-400', 'text-teal-300');
            statusMsg.classList.replace('text-yellow-300', 'text-teal-300');
        } else {
            updateBtn.disabled = true;
            updateBtn.classList.add('bg-gray-500', 'cursor-not-allowed');
            updateBtn.classList.remove('bg-teal-500', 'hover:bg-teal-400', 'cursor-pointer');
            
            let errors = [];
            if (!form.checkValidity()) errors.push("Fill all required fields");
            if (!isLithoValid) errors.push("Lithology must sum to 100%");
            if (!isLandValid) errors.push("Land Use must sum to 100%");
            if (!isAiValid) errors.push("AI Min must be ≤ Max");
            
            statusMsg.innerText = errors.join(" | ");
            statusMsg.classList.replace('text-teal-300', 'text-red-400');
            statusMsg.classList.replace('text-yellow-300', 'text-red-400');
        }
    }

    // Attach Listeners
    lithoInputs.forEach(input => input.addEventListener('input', validateLithology));
    landInputs.forEach(input => input.addEventListener('input', validateLandUse));
    aiMin.addEventListener('input', validateAiConfidence);
    aiMax.addEventListener('input', validateAiConfidence);
    form.querySelectorAll('input').forEach(input => input.addEventListener('input', checkGlobalValidity));

    // Handle Submit
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        if(!updateBtn.disabled) {
            alert("Record updated successfully.");
            window.location.href = "index.html"; 
        }
    });

    // Initialize by fetching existing backend data
    setTimeout(fetchCurrentData, 500); // Small timeout to simulate network request
});