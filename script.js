// Configuration - Google Sheets CSV URL
const CONFIG = {
    csvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT3L6g88i7wMCyUrc2fPtH8vhTbDlPrY04E69r8-dzk7qRPNKxgYl6UOVblcwcYcgeu-qcUx_9gh3gJ/pub?output=csv'
};

// Data will be loaded from the CSV
let teams = [];
let customers = [];

// Initialize the form
document.addEventListener('DOMContentLoaded', function() {
    loadFormData();
    setupEventListeners();
    setDefaultWeek();
});

function parseCSV(csvText) {
    const lines = csvText.split('\n').filter(line => line.trim());
    const data = {
        teams: [],
        customers: []
    };
    
    // Standard team names to look for
    const standardTeams = ['Product', 'Professional Services', 'Project Management', 'Customer Success'];
    
    // Keywords that indicate header rows or non-data
    const skipKeywords = ['team', 'customer', 'name', 'hours', 'week', 'date', 'time', 'total'];
    
    // Parse each line
    lines.forEach((line, index) => {
        // Handle CSV with quoted values that may contain commas
        const values = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current.trim()); // Add the last value
        
        // Clean up values (remove quotes)
        const cleanValues = values.map(v => v.replace(/^"|"$/g, '').trim()).filter(v => v);
        
        cleanValues.forEach(value => {
            if (!value || value.length < 2) return;
            
            const lowerValue = value.toLowerCase();
            
            // Check if it's a standard team name
            if (standardTeams.includes(value)) {
                if (!data.teams.includes(value)) {
                    data.teams.push(value);
                }
            } else {
                // Check if it should be skipped (header keywords)
                const shouldSkip = skipKeywords.some(keyword => lowerValue.includes(keyword));
                
                // Assume it's a customer if it's not a team, not a skip keyword, and looks like a name
                if (!shouldSkip && 
                    value.legth > 1 &
                    !data.customers.includes(value) &&
                    !data.teams.includes(value)) {
                    // Additional validation: should look like a company/customer name
                    if (/^[A-Za-z0-9\s&.,-]+$/.test(value)) {
                        data.customers.push(value);
                    }
                }
            }
        });
    });
    
    // If no teams found, use defaults
    if (data.teams.length === 0) {
        data.teams = standardTeams;
    }
    
    // Sort customers alphabetically
    data.customers.sort();
    
    return data;
}

async function loadFormData() {
    const loadingDiv = document.getElementById('loading');
    loadingDiv.style.display = 'block';
    
    try {
        const response = await fetch(CONFIG.csvUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const csvText = await response.text();
        const data = parseCSV(csvText);
        
        teams = data.teams || [];
        customers = data.customers || [];
        
        // If no data loaded, use defaults
        if (teams.length === 0) {
            teams = ['Product', 'Professional Services', 'Project Management', 'Customer Success'];
        }
        if (customers.length === 0) {
            customers = [
                'Acme Corporation',
                'TechStart Inc',
                'Global Solutions Ltd',
                'Innovation Partners',
                'Digital Dynamics',
                'Enterprise Systems',
                'Cloud Ventures',
                'Data Analytics Co'
            ];
        }
        
        loadingDiv.style.display = 'none';
        document.getElementById('timeTrackingForm').style.display = 'block';
        initializeForm();
    } catch (error) {
        console.error('Error loading form data from CSV:', error);
        loadingDiv.style.display = 'none';
        
        // Use default data if CSV can't be loaded
        teams = ['Product', 'Professional Services', 'Project Management', 'Customer Success'];
        customers = [
            'Acme Corporation',
            'TechStart Inc',
            'Global Solutions Ltd',
            'Innovation Partners',
            'Digital Dynamics',
            'Enterprise Systems',
            'Cloud Ventures',
            'Data Analytics Co'
        ];
        document.getElementById('timeTrackingForm').style.display = 'block';
        initializeForm();
        alert('Could not load form data from Google Sheets. Using default data. Please check that the sheet is published to the web.');
    }
}

function initializeForm() {
    // Populate team dropdown
    const teamSelect = document.getElementById('teamSelect');
    teams.forEach(team => {
        const option = document.createElement('option');
        option.value = team;
        option.textContent = team;
        teamSelect.appendChild(option);
    });
    
    // Generate customer checkboxes
    const customerSelection = document.getElementById('customerSelection');
    customerSelection.innerHTML = '';
    
    customers.forEach(customer => {
        const checkboxContainer = document.createElement('div');
        checkboxContainer.className = 'checkbox-item';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `customer-${customer.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '')}`;
        checkbox.name = 'customers';
        checkbox.value = customer;
        checkbox.className = 'customer-checkbox';
        
        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.textContent = customer;
        
        checkboxContainer.appendChild(checkbox);
        checkboxContainer.appendChild(label);
        customerSelection.appendChild(checkboxContainer);
    });
}

function setupEventListeners() {
    // Listen for customer checkbox changes
    document.getElementById('customerSelection').addEventListener('change', function(e) {
        if (e.target.classList.contains('customer-checkbox')) {
            updateHourInputs();
            updateSubmitButton();
        }
    });

    // Handle form submission
    document.getElementById('timeTrackingForm').addEventListener('submit', function(e) {
        e.preventDefault();
        handleFormSubmission();
    });

    // Handle new entry button
    document.getElementById('newEntryBtn').addEventListener('click', function() {
        resetForm();
    });

    // Update submit button when team changes
    document.getElementById('teamSelect').addEventListener('change', updateSubmitButton);
}

function updateHourInputs() {
    const selectedCustomers = getSelectedCustomers();
    const hourInputsSection = document.getElementById('hourInputsSection');
    const hourInputs = document.getElementById('hourInputs');
    
    // Clear existing hour inputs
    hourInputs.innerHTML = '';
    
    if (selectedCustomers.length === 0) {
        hourInputsSection.style.display = 'none';
        return;
    }
    
    // Show the section
    hourInputsSection.style.display = 'block';
    
    // Create hour input for each selected customer
    selectedCustomers.forEach(customer => {
        const inputGroup = document.createElement('div');
        inputGroup.className = 'hour-input-group';
        
        const label = document.createElement('label');
        label.htmlFor = `hours-${customer.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '')}`;
        label.textContent = `How many hours did you spend on ${customer}? *`;
        label.className = 'hour-label';
        
        const input = document.createElement('input');
        input.type = 'number';
        input.id = `hours-${customer.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '')}`;
        input.name = `hours-${customer}`;
        input.min = '0';
        input.step = '0.25';
        input.required = true;
        input.className = 'form-control hour-input';
        input.placeholder = '0.00';
        
        inputGroup.appendChild(label);
        inputGroup.appendChild(input);
        hourInputs.appendChild(inputGroup);
    });
}

function getSelectedCustomers() {
    const checkboxes = document.querySelectorAll('.customer-checkbox:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

function updateSubmitButton() {
    const selectedCustomers = getSelectedCustomers();
    const submitBtn = document.getElementById('submitBtn');
    const teamSelect = document.getElementById('teamSelect');
    
    // Enable submit button only if team is selected and at least one customer is selected
    if (teamSelect.value && selectedCustomers.length > 0) {
        submitBtn.disabled = false;
    } else {
        submitBtn.disabled = true;
    }
}

function setDefaultWeek() {
    // Set default week to current week
    const weekInput = document.getElementById('weekSelect');
    const today = new Date();
    const year = today.getFullYear();
    const week = getWeekNumber(today);
    const weekString = `${year}-W${week.toString().padStart(2, '0')}`;
    weekInput.value = weekString;
}

function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function handleFormSubmission() {
    const formData = {
        team: document.getElementById('teamSelect').value,
        week: document.getElementById('weekSelect').value,
        customers: []
    };
    
    const selectedCustomers = getSelectedCustomers();
    selectedCustomers.forEach(customer => {
        const hoursInput = document.getElementById(`hours-${customer.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '')}`);
        const hours = parseFloat(hoursInput.value) || 0;
        
        formData.customers.push({
            name: customer,
            hours: hours
        });
    });
    
    // Display results
    displayResults(formData);
    
    // Store data (in a real app, this would be sent to a server)
    saveTimeTrackingData(formData);
}

function displayResults(data) {
    const resultsSection = document.getElementById('results');
    const resultsContent = document.getElementById('resultsContent');
    const form = document.getElementById('timeTrackingForm');
    
    // Hide form, show results
    form.style.display = 'none';
    resultsSection.style.display = 'block';
    
    // Build results HTML
    let html = `
        <div class="result-item">
            <strong>Team:</strong> ${data.team}
        </div>
        <div class="result-item">
            <strong>Week:</strong> ${data.week}
        </div>
        <div class="result-item">
            <strong>Total Hours:</strong> ${data.customers.reduce((sum, c) => sum + c.hours, 0).toFixed(2)}
        </div>
        <div class="result-item">
            <strong>Customers:</strong>
            <ul class="customer-list">
    `;
    
    data.customers.forEach(customer => {
        html += `<li>${customer.name}: ${customer.hours.toFixed(2)} hours</li>`;
    });
    
    html += `
            </ul>
        </div>
    `;
    
    resultsContent.innerHTML = html;
}

function saveTimeTrackingData(data) {
    // In a real application, this would send data to a server
    // For now, we'll store it in localStorage
    const existingData = JSON.parse(localStorage.getItem('timeTrackingData') || '[]');
    existingData.push({
        ...data,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('timeTrackingData', JSON.stringify(existingData));
    
    console.log('Time tracking data saved:', data);
}

function resetForm() {
    const form = document.getElementById('timeTrackingForm');
    const resultsSection = document.getElementById('results');
    
    form.reset();
    form.style.display = 'block';
    resultsSection.style.display = 'none';
    
    // Reset hour inputs
    updateHourInputs();
    updateSubmitButton();
    setDefaultWeek();
}

