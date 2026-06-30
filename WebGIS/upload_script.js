document.addEventListener("DOMContentLoaded", function() {
    
    // Elements
    const themeSelect = document.getElementById('theme-select');
    const purposeSelect = document.getElementById('purpose-select');
    const uploadSection = document.getElementById('upload-section');
    const dropZone = document.getElementById('drop-zone');
    const dropIcon = document.getElementById('drop-icon');
    const dropText = document.getElementById('drop-text');
    const fileInput = document.getElementById('file-input');
    const allowedBadge = document.getElementById('allowed-badge');
    const fileListContainer = document.getElementById('file-list-container');
    const fileList = document.getElementById('file-list');
    const processBtn = document.getElementById('process-btn');

    // Data Dictionary based on TOR
    // Data Dictionary perfectly correlated to dashboard requirements
    const systemRules = {
        geo_prospectivity: {
            purposes: [
                { id: "geo_raster", label: "Raw Georaster Map", exts: [".tif", ".tiff"] },
                { id: "drill_metrics", label: "Drill Indices & Lithology Stats", exts: [".csv", ".json"] }
            ]
        },
        operational_logistics: {
            purposes: [
                { id: "logistics_dist", label: "Access Distances (Road, River, BTS)", exts: [".csv", ".json"] },
                { id: "cut_fill", label: "Cut/Fill & Coverage Estimations", exts: [".csv", ".json"] }
            ]
        },
        esg_k3: {
            purposes: [
                { id: "forestry_bounds", label: "Kawasan Hutan Spatial Boundaries", exts: [".shp", ".geojson"] },
                { id: "hazard_metrics", label: "Hazards (Longsor, Banjir, Evakuasi)", exts: [".csv", ".json"] }
            ]
        }
    };

    let currentAllowedExts = [];
    let queuedFiles = [];

    // --- Logic 1: Cascade Dropdowns ---
    themeSelect.addEventListener('change', function() {
        const selectedTheme = this.value;
        purposeSelect.innerHTML = '<option value="" disabled selected>-- Select Purpose --</option>';
        
        if (selectedTheme && systemRules[selectedTheme]) {
            purposeSelect.disabled = false;
            purposeSelect.classList.remove('bg-gray-100', 'cursor-not-allowed');
            purposeSelect.classList.add('bg-white', 'cursor-pointer');
            
            systemRules[selectedTheme].purposes.forEach(purpose => {
                const opt = document.createElement('option');
                opt.value = purpose.id;
                opt.dataset.exts = purpose.exts.join(',');
                opt.innerText = purpose.label;
                purposeSelect.appendChild(opt);
            });
        }
        lockUploadZone();
    });

    purposeSelect.addEventListener('change', function() {
        const selectedOpt = this.options[this.selectedIndex];
        currentAllowedExts = selectedOpt.dataset.exts.split(',');
        unlockUploadZone(currentAllowedExts);
    });

    // --- Logic 2: UI State Management ---
    function lockUploadZone() {
        uploadSection.classList.add('opacity-50', 'pointer-events-none');
        dropZone.classList.add('cursor-not-allowed', 'border-gray-300');
        dropZone.classList.remove('hover:border-teal-500', 'hover:bg-teal-50', 'cursor-pointer');
        dropIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>`;
        dropIcon.classList.replace('text-teal-500', 'text-gray-300');
        dropText.innerText = "Unlock parameters to upload";
        allowedBadge.innerText = "Format: Restricted";
        allowedBadge.classList.replace('bg-teal-100', 'bg-gray-200');
        allowedBadge.classList.replace('text-teal-700', 'text-gray-600');
        
        queuedFiles = [];
        renderFileList();
    }

    function unlockUploadZone(exts) {
        uploadSection.classList.remove('opacity-50', 'pointer-events-none');
        dropZone.classList.remove('cursor-not-allowed', 'border-gray-300');
        dropZone.classList.add('hover:border-teal-500', 'hover:bg-teal-50', 'cursor-pointer');
        dropIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>`;
        dropIcon.classList.replace('text-gray-300', 'text-teal-500');
        dropText.innerHTML = `Drag & Drop files or <span class="text-teal-600 underline">browse</span>`;
        
        allowedBadge.innerText = `Required: ${exts.join(', ')}`;
        allowedBadge.classList.replace('bg-gray-200', 'bg-teal-100');
        allowedBadge.classList.replace('text-gray-600', 'text-teal-700');
        
        fileInput.accept = exts.join(',');
    }

    // --- Logic 3: File Handling ---
    dropZone.addEventListener('click', () => {
        if (!dropZone.classList.contains('cursor-not-allowed')) fileInput.click();
    });

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (!dropZone.classList.contains('cursor-not-allowed')) dropZone.classList.add('bg-teal-50');
    });

    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('bg-teal-50'));

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('bg-teal-50');
        if (!dropZone.classList.contains('cursor-not-allowed')) handleFiles(e.dataTransfer.files);
    });

    fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

    function handleFiles(files) {
        Array.from(files).forEach(file => {
            const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
            
            if (!currentAllowedExts.includes(ext)) {
                alert(`STRICT REJECTION: File type ${ext} is invalid for the selected purpose. System expects: ${currentAllowedExts.join(', ')}`);
                return;
            }
            if (!queuedFiles.some(f => f.name === file.name)) queuedFiles.push(file);
        });
        renderFileList();
    }

    function renderFileList() {
        if (queuedFiles.length > 0) {
            fileListContainer.classList.remove('hidden');
        } else {
            fileListContainer.classList.add('hidden');
        }

        fileList.innerHTML = '';
        queuedFiles.forEach((file, index) => {
            const li = document.createElement('li');
            li.className = "flex justify-between items-center bg-white p-3 rounded-lg border border-gray-300 shadow-sm";
            li.innerHTML = `
                <div class="flex items-center space-x-3">
                    <div class="bg-gray-800 text-white p-2 rounded font-bold text-xs">${file.name.split('.').pop().toUpperCase()}</div>
                    <span class="font-medium text-gray-800 text-sm truncate">${file.name}</span>
                </div>
                <button class="text-red-500 font-bold hover:text-red-700 text-sm" onclick="removeFile(${index})">✕</button>
            `;
            fileList.appendChild(li);
        });
    }

    window.removeFile = function(index) {
        queuedFiles.splice(index, 1);
        renderFileList();
    }

    // --- Logic 4: Submission ---
    processBtn.addEventListener('click', () => {
        if (queuedFiles.length === 0) return;
        
        processBtn.disabled = true;
        document.getElementById('btn-text').innerText = "INGESTING DATA TO AI PIPELINE...";
        
        setTimeout(() => {
            alert("Data validated against schema. Proceed to editing matrix.");
            window.location.href = "edit_data.html";
        }, 2000);
    });
});