// Data
const customerComplaints = [
    { name: 'Damaged Goods', value: 50 },
    { name: 'Incorrect Items', value: 30 },
    { name: 'Delayed Shipments', value: 20 },
];

const supplierDefects = [
    { name: 'Supplier A', rate: 5 },
    { name: 'Supplier B', rate: 12 },
    { name: 'Supplier C', rate: 3 },
];

const shiftPerformance = [
    { name: 'Morning Shift', onTime: 85, defectRate: 8 },
    { name: 'Evening Shift', onTime: 70, defectRate: 12 },
];

const monthlyTrends = [
    { month: 'Jan', returns: 5, complaints: 8 },
    { month: 'Feb', returns: 7, complaints: 10 },
    { month: 'Mar', returns: 10, complaints: 15 },
    { month: 'Apr', returns: 15, complaints: 20 },
];

// Colors
const COLORS = ['#3498db', '#f39c12', '#e74c3c', '#9b59b6', '#34495e'];

// Tab handling
const tabButtons = document.querySelectorAll('.tab-button');
const contentDiv = document.getElementById('content');

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        tabButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        updateContent(button.dataset.tab);
    });
});

function updateContent(tab) {
    let content = '';
    switch(tab) {
        case 'overview':
            content = `
                <div class="card">
                    <h2 class="card-title">Performance Overview</h2>
                    <p>FlexiMove Logistics is experiencing significant quality control challenges, impacting customer satisfaction and operational efficiency.</p>
                    <div class="grid">
                        <div class="info-box red">
                            <h3>Key Issues</h3>
                            <ul>
                                <li><i class="fas fa-arrow-trend-up"></i> 15% increase in product returns</li>
                                <li><i class="fas fa-comments"></i> 20% increase in customer complaints</li>
                                <li><i class="fas fa-clock"></i> 10% increase in shipping delays</li>
                                <li><i class="fas fa-exclamation-triangle"></i> 10% defect rate (up from 3%)</li>
                            </ul>
                        </div>
                        <div class="info-box yellow">
                            <h3>Root Causes</h3>
                            <ul>
                                <li><i class="fas fa-search"></i> Inconsistent inspections</li>
                                <li><i class="fas fa-industry"></i> Supplier quality issues</li>
                                <li><i class="fas fa-graduation-cap"></i> Training gaps</li>
                                <li><i class="fas fa-comments"></i> Poor interdepartmental communication</li>
                            </ul>
                        </div>
                    </div>
                </div>
            `;
            break;
        case 'complaints':
            content = `
                <div class="card">
                    <h2 class="card-title">Customer Complaints Breakdown</h2>
                    <div class="chart-container"><canvas id="complaintsChart"></canvas></div>
                </div>
            `;
            setTimeout(() => renderPieChart('complaintsChart', customerComplaints), 0);
            break;
        case 'suppliers':
            content = `
                <div class="card">
                    <h2 class="card-title">Supplier Defect Rates</h2>
                    <div class="chart-container"><canvas id="suppliersChart"></canvas></div>
                </div>
            `;
            setTimeout(() => renderBarChart('suppliersChart', supplierDefects), 0);
            break;
        case 'performance':
            content = `
                <div class="card">
                    <h2 class="card-title">Performance Metrics</h2>
                    <h3>Shift Performance</h3>
                    <div class="chart-container"><canvas id="shiftChart"></canvas></div>
                    <h3>Monthly Trends</h3>
                    <div class="chart-container"><canvas id="trendsChart"></canvas></div>
                </div>
            `;
            setTimeout(() => {
                renderBarChart('shiftChart', shiftPerformance, ['onTime', 'defectRate']);
                renderLineChart('trendsChart', monthlyTrends);
            }, 0);
            break;
    }
    contentDiv.innerHTML = content;
}

// Chart rendering functions
function renderPieChart(id, data) {
    const ctx = document.getElementById(id).getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: data.map(item => item.name),
            datasets: [{
                data: data.map(item => item.value),
                backgroundColor: COLORS
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Customer Complaints Breakdown'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((acc, data) => acc + data, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${percentage}%`;
                        }
                    }
                }
            },
            layout: {
                padding: 20
            },
            plugins: [{
                afterDraw: function(chart) {
                    const ctx = chart.ctx;
                    ctx.save();
                    const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
                    const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;

                    chart.data.datasets.forEach(function(dataset, datasetIndex) {
                        const meta = chart.getDatasetMeta(datasetIndex);
                        if (!meta.hidden) {
                            meta.data.forEach(function(element, index) {
                                const data = dataset.data[index];
                                const total = dataset.data.reduce((acc, data) => acc + data, 0);
                                const percentage = ((data / total) * 100).toFixed(1) + '%';
                                
                                // Get the angle of the slice
                                const startAngle = element.startAngle;
                                const endAngle = element.endAngle;
                                const middleAngle = startAngle + (endAngle - startAngle) / 2;

                                // Convert to Cartesian coordinates
                                const radius = element.outerRadius + 20;
                                const x = centerX + Math.cos(middleAngle) * radius;
                                const y = centerY + Math.sin(middleAngle) * radius;

                                // Draw the percentage
                                ctx.font = '14px Arial';
                                ctx.fillStyle = 'black';
                                ctx.textAlign = 'center';
                                ctx.textBaseline = 'middle';
                                ctx.fillText(percentage, x, y);
                            });
                        }
                    });
                    ctx.restore();
                }
            }]
        }
    });
}

function renderBarChart(id, data, keys = ['rate']) {
    const ctx = document.getElementById(id).getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(item => item.name),
            datasets: keys.map((key, index) => ({
                label: key,
                data: data.map(item => item[key]),
                backgroundColor: COLORS[index % COLORS.length]
            }))
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: id === 'suppliersChart' ? 'Supplier Defect Rates' : 'Shift Performance'
                }
            }
        }
    });
}

function renderLineChart(id, data) {
    const ctx = document.getElementById(id).getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(item => item.month),
            datasets: [
                {
                    label: 'Returns',
                    data: data.map(item => item.returns),
                    borderColor: COLORS[0],
                    fill: false
                },
                {
                    label: 'Complaints',
                    data: data.map(item => item.complaints),
                    borderColor: COLORS[2],
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Monthly Trends'
                }
            }
        }
    });
}

// Initialize with overview tab
updateContent('overview');