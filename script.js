
var lastClickedLat = null;
var lastClickedLng = null;


var lastMarker = null;

// Δημιουργία Leaflet map
var mymap = L.map('map').setView([38.246242, 21.735084], 12);


var openStreetMapLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
});

var cartoVoyagerLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
});

var cartoDarkMatterLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
});

var googleMapsSatelliteLayer = L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    attribution: 'Map data &copy; <a href="https://www.google.com/maps">Google Maps</a>'
});

var googleMapsTrafficLayer = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    attribution: 'Map data &copy; <a href="https://www.google.com/maps">Google Maps</a>'
});


openStreetMapLayer.addTo(mymap);


var baseLayers = {
    "OpenStreetMap": openStreetMapLayer,
    "Google Maps Satellite": googleMapsSatelliteLayer,
    "Google Maps Traffic": googleMapsTrafficLayer,
    "White map": cartoVoyagerLayer,
    "Black map": cartoDarkMatterLayer

};


L.control.layers(baseLayers).addTo(mymap);


mymap.on('click', function (e) {
    // Αφαίρεση διπλότυπων marker
    if (lastMarker) {
        mymap.removeLayer(lastMarker);
    }

    // Αποθήκευση Συντεταγμένων
    lastClickedLat = e.latlng.lat;
    lastClickedLng = e.latlng.lng;

    // Εκτύπωση Συντεταγμένων
    console.log('Clicked point: ', lastClickedLat, lastClickedLng);

    // Προσθήκη marker στο επιλεγμένο σημείο
    lastMarker = L.marker([lastClickedLat, lastClickedLng]).addTo(mymap);

    // Εμφάνιση κουμπιού "Fetch Data"
    var fetchDataBtn = document.getElementById('fetch-data-btn');
    fetchDataBtn.style.display = 'block';

    var buttonText = 'Fetch Data';
    var currentIndex = 0;

    function typeText() {
        fetchDataBtn.textContent = buttonText.slice(0, currentIndex);
        currentIndex++;

        if (currentIndex <= buttonText.length) {
            setTimeout(typeText, 100);
        }
    }

    typeText();
});





var modal = document.getElementById("myModal");


var btn = document.getElementById("myBtn");


var span = document.getElementsByClassName("close")[0];


btn.onclick = function () {
    modal.style.display = "block";
}


span.onclick = function () {
    modal.style.display = "none";
}


window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

document.getElementById('fetch-data-btn').addEventListener('click', function () {
    var statusMessage = document.getElementById('status-message');
    if (lastClickedLat === null || lastClickedLng === null) {
        statusMessage.innerText = 'Error! Variables are NULL';
        statusMessage.style.color = 'red';
        return;
    }

    var url = `https://api.open-meteo.com/v1/forecast?latitude=${lastClickedLat}&longitude=${lastClickedLng}&hourly=temperature_2m,relativehumidity_2m,windspeed_10m,precipitation_probability`;

    $.getJSON(url, function (data) {
        var forecast = data.hourly;
        var timeArray = forecast.time;
        var temperatureArray = forecast.temperature_2m;
        var humidityArray = forecast.relativehumidity_2m;
        var windSpeedArray = forecast.windspeed_10m;
        var precipitationProbabilityArray = forecast.precipitation_probability;



        // Προετοιμασία δεδομένων διαγράμματος θερμοκρασίας
        var temperatureData = timeArray.map(function (time, index) {
            var date = new Date(time);
            return {
                x: date,
                y: temperatureArray[index]
            };
        });

        // Εμφάνιση διαγράμματος θερμοκρασίας
        var temperatureChartOptions = {
            chart: {
                type: 'line',
                height: 400,
                toolbar: {
                    show: false
                }
            },
            series: [{
                name: 'Temperature (°C)',
                data: temperatureData
            }],
            xaxis: {
                type: 'datetime'
            },
            yaxis: {
                title: {
                    text: 'Temperature (°C)'
                }
            },
            stroke: {
                width: 2,
                curve: 'smooth'
            },
            markers: {
                size: 0
            },
            tooltip: {
                enabled: true,
                followCursor: true,
                theme: 'dark',
                x: {
                    show: true,
                    format: 'dd MMM yyyy HH:mm'
                },
                y: {
                    formatter: function (value) {
                        return value.toFixed(1) + ' °C';
                    }
                }
            },
            colors: ['#008000'],
            fill: {
                type: 'solid'
            }
        };

        var temperatureChart = new ApexCharts(document.querySelector('#temperatureChart'), temperatureChartOptions);
        temperatureChart.render();

        // Προετοιμασία δεδομένων διαγράμματος υγρασίας
        var humidityData = timeArray.map(function (time, index) {
            var date = new Date(time);
            return {
                x: date,
                y: humidityArray[index]
            };
        });

        // Εμφάνιση διαγράμματος υγρασίας
        var humidityChartOptions = {
            chart: {
                type: 'area',
                height: 400,
                toolbar: {
                    show: false
                }
            },
            series: [{
                name: 'Relative Humidity (%)',
                data: humidityData
            }],
            xaxis: {
                type: 'datetime'
            },
            yaxis: {
                title: {
                    text: 'Relative Humidity (%)'
                }
            },
            stroke: {
                width: 2,
                curve: 'smooth'
            },
            markers: {
                size: 0
            },
            tooltip: {
                enabled: true,
                followCursor: true,
                theme: 'dark',
                x: {
                    show: true,
                    format: 'dd MMM yyyy HH:mm'
                },
                y: {
                    formatter: function (value) {
                        return value.toFixed(1) + ' %';
                    }
                }
            },
            colors: ['#3366cc'],
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.7,
                    opacityTo: 0.9,
                    stops: [0, 90, 100]
                }
            }
        };

        var humidityChart = new ApexCharts(document.querySelector('#humidityChart'), humidityChartOptions);
        humidityChart.render();

        // Προετοιμασία δεδομένων διαγράμματος ανέμου
        var windSpeedData = timeArray.map(function (time, index) {
            var date = new Date(time);
            return {
                x: date,
                y: windSpeedArray[index]
            };
        });

        // Εμφάνιση διαγράμματος ανέμου
        var windSpeedChartOptions = {
            chart: {
                type: 'line',
                height: 400,
                toolbar: {
                    show: false
                }
            },
            series: [{
                name: 'Wind Speed (m/s)',
                data: windSpeedData
            }],
            xaxis: {
                type: 'datetime'
            },
            yaxis: {
                title: {
                    text: 'Wind Speed (m/s)'
                }
            },
            stroke: {
                width: 2,
                curve: 'smooth'
            },
            markers: {
                size: 0
            },
            tooltip: {
                enabled: true,
                followCursor: true,
                theme: 'dark',
                x: {
                    show: true,
                    format: 'dd MMM yyyy HH:mm'
                },
                y: {
                    formatter: function (value) {
                        return value.toFixed(1) + ' m/s ';
                    }
                }
            },
            colors: ['#ff9933'],
            fill: {
                type: 'solid'
            }
        };

        var windSpeedChart = new ApexCharts(document.querySelector('#windSpeedChart'), windSpeedChartOptions);
        windSpeedChart.render();


        // Προετοιμασία δεδομένων διαγράμματος βροχόπτωσης
        var precipitationProbabilityData = timeArray.map(function (time, index) {
            var date = new Date(time);
            return {
                x: date,
                y: precipitationProbabilityArray[index]
            };
        });


        // Εμφάνιση διαγράμματος βροχόπτωσης
        var precipitationProbabilityChartOptions = {
            chart: {
                type: 'line',
                height: 400,
                toolbar: {
                    show: false
                }
            },
            series: [{
                name: 'Precipitation Probability (%)',
                data: precipitationProbabilityData
            }],
            xaxis: {
                type: 'datetime'
            },
            yaxis: {
                title: {
                    text: 'Precipitation Probability (%)'
                }
            },
            stroke: {
                width: 2,
                curve: 'smooth'
            },
            markers: {
                size: 0
            },
            tooltip: {
                enabled: true,
                followCursor: true,
                theme: 'dark',
                x: {
                    show: true,
                    format: 'dd MMM yyyy HH:mm'
                },
                y: {
                    formatter: function (value) {
                        return value.toFixed(1) + ' %';
                    }
                }
            },
            colors: ['#FF0000'],
            fill: {
                type: 'solid'
            }
        };

        var precipitationProbabilityChart = new ApexCharts(document.querySelector('#precipitationProbabilityChart'), precipitationProbabilityChartOptions);
        precipitationProbabilityChart.render();

        // Δημιουργία Leaflet map
        var map = L.map('mapContainer').setView([38.246639, 21.734573], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
            maxZoom: 18,
        }).addTo(map);

        // Ορισμός map layers
        var temperatureLayer = L.layerGroup();
        var humidityLayer = L.layerGroup();
        var windSpeedLayer = L.layerGroup();
        var precipitationProbabilityLayer = L.layerGroup()



        // Προσθήκη των marker θερμοκρασίας
        temperatureData.forEach(function (data) {
            var marker = L.marker([lastClickedLat, lastClickedLng], {
                icon: L.divIcon({
                    className: 'temperature-marker',
                    html: '<span>' + data.y.toFixed(1) + ' °C</span>'
                })
            }).addTo(temperatureLayer);
            marker.bindPopup('<b>Temperature:</b> ' + data.y.toFixed(1) + ' °C');
        });

        // Προσθήκη των marker υγρασίας
        humidityData.forEach(function (data) {
            var marker = L.marker([lastClickedLat, lastClickedLng], {
                icon: L.divIcon({
                    className: 'humidity-marker',
                    html: '<span>' + data.y.toFixed(1) + ' %</span>'
                })
            }).addTo(humidityLayer);
            marker.bindPopup('<b>Humidity:</b> ' + data.y.toFixed(1) + ' %');
        });

        // Προσθήκη των marker ανέμου
        windSpeedData.forEach(function (data) {
            var marker = L.marker([lastClickedLat, lastClickedLng], {
                icon: L.divIcon({
                    className: 'wind-speed-marker',
                    html: '<span>' + data.y.toFixed(1) + ' m/s</span>'
                })
            }).addTo(windSpeedLayer);
            marker.bindPopup('<b>Wind Speed:</b> ' + data.y.toFixed(1) + ' m/s');
        });

        // Προσθήκη των marker βροχόπτωσης
        precipitationProbabilityData.forEach(function (data) {
            var marker = L.marker([lastClickedLat, lastClickedLng], {
                icon: L.divIcon({
                    className: 'precipitationProbability-marker',
                    html: '<span>' + data.y.toFixed(1) + ' %</span>'
                })
            }).addTo(precipitationProbabilityLayer);
            marker.bindPopup('<b>precipitationProbability Possibility:</b> ' + data.y.toFixed(1) + ' %');
        });


        var baseLayers = {
            'Temperature': temperatureLayer,
            'Humidity': humidityLayer,
            'Wind Speed': windSpeedLayer,
            'Precipitation Probability': precipitationProbabilityLayer
        };

        L.control.layers(null, baseLayers).addTo(map);

        // Κεντράρισμα του χάρτη στο επιλεγμένο σημείο
        map.setView([lastClickedLat, lastClickedLng], 13);

        statusMessage.innerText = 'Data fetched successfully!';
        statusMessage.style.color = 'green';
    }).fail(function () {
        statusMessage.innerText = 'Error while fetching data!';
        statusMessage.style.color = 'red';
    });
});