// Load the dataset and process it
async function loadData() {
    const data = await d3.csv('static/data/Border_Crossing_Entry_Data.csv');
    console.log(data);

    // Extract years for the dropdown options and sort them
    const years = Array.from(new Set(data.map(d => parseInt(d.Date.split(' ')[1])))).sort((a, b) => a - b);

    // Add the "All" option to the year dropdown
    const yearDropdown = document.getElementById('yearDropdown');
    const allOption = document.createElement('option');
    allOption.value = 'All';
    allOption.textContent = 'All';
    yearDropdown.appendChild(allOption);

    // Populate the year dropdown
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearDropdown.appendChild(option);
    });

    // When a year is selected, update the chart
    yearDropdown.addEventListener('change', function() {
        updateChart(data, this.value);
    });

    // Initial chart update with the "All" option selected
    if (years.length > 0) {
        yearDropdown.value = 'All';
        updateChart(data, 'All');
    }
}

// Function to update the chart
function updateChart(data, selectedYear) {
    let filteredData;

    // Filter data based on the selected year (or all years)
    if (selectedYear === 'All') {
        filteredData = data;
    } else {
        filteredData = data.filter(d => parseInt(d.Date.split(' ')[1]) === parseInt(selectedYear));
    }

    // Group data by year and calculate total crossings
    const yearData = d3.rollup(filteredData, 
        v => d3.sum(v, d => +d.Value), 
        d => d.Date.split(' ')[1]);

    const years = Array.from(yearData.keys());
    const crossings = Array.from(yearData.values()).map(d => d / 1_000_000);  // Convert to millions

    // Create the line chart
    const trace = {
        x: years,
        y: crossings,
        type: 'scatter',
        mode: 'lines+markers+text', // This will add text labels to the points
        line: {color: '#005A8B', width: 3}, // Blue line
        marker: {color: '#005A8B'},
        text: selectedYear !== 'All' ? crossings.map(cross => cross.toFixed(0)) : [], // Show the values only if not 'All'
        textposition: 'top center', // Position the labels above the points
        hoverinfo: 'text'
    };

    const layout = {
        title: 'Crossings by Year',
        xaxis: {
            title: 'Year',
            tickangle: 45, // Adjusts angle of the labels
            tickmode: 'linear',
            tickvals: years,
            ticktext: years.map(year => year.toString()) // Display the years as text
        },
        yaxis: {
            title: 'Number of Crossings (MM)',
            tickformat: ',.0f' // Show whole numbers in the Y-axis
        },
        plot_bgcolor: '#f9f9f9',
        margin: {t: 50, b: 150}, // Add space to the sides
        showlegend: false
    };

    Plotly.newPlot('box1', [trace], layout);
}

// Load data on page load
loadData();
