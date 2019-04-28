
// Use device Geolocation
function geolocation(controlDiv, map){
    // Set CSS for the location button border.
    var controlUI = document.createElement('div');
    controlUI.style.backgroundColor = '#fff';
    controlUI.style.border = '2px solid #fff';
    controlUI.style.borderRadius = '3px';
    controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
    controlUI.style.cursor = 'pointer';
    controlUI.style.marginBottom = '22px';
    controlUI.style.textAlign = 'center';
    controlUI.style.margin = '10px';
    controlUI.title = 'Click to find current location';
    controlDiv.appendChild(controlUI);

    // Set CSS for the location button interior.
    var controlText = document.createElement('div');
    controlText.style.color = 'rgb(25,25,25)';
    controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
    controlText.style.fontSize = '16px';
    controlText.style.lineHeight = '38px';
    controlText.style.paddingLeft = '5px';
    controlText.style.paddingRight = '5px';
    controlText.innerHTML = 'My Location';
    controlUI.appendChild(controlText);
    var prev_marker = false;
    var prev_currentwindow = false;

    // Event hnadler to get current geolocation on button click
    controlUI.addEventListener('click', function() {
        if (navigator.geolocation){
            navigator.geolocation.getCurrentPosition(function(position){
                var currentpos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                map.setCenter(currentpos);
                map.setZoom(18);
                var mylocationmarker = new google.maps.Marker({
                    position: currentpos,
                    map: map,
                    title: 'Current Location',
                    draggable: true
                });
                // Event handler for infowindow on marker click
                google.maps.event.addListener(mylocationmarker, 'click', function(){
                    var lat = mylocationmarker.getPosition().lat().toFixed(6);
                    var lng = mylocationmarker.getPosition().lng().toFixed(6);
                    infowindow = new google.maps.InfoWindow({
                        content: " "
                    });
                    infowindow.setContent(
                        '<div class="card-title" style="font-size: 20px">Your Location</div>'+
                        'lat: ' + lat +
                        '<br>lng: ' + lng +
                        '<br><br> If you dragged the marker please click on the marker again to update its latitude and longitude.');
                    infowindow.open(map, this);
                    infowindow.open(map, mylocationmarker);
                    map.setZoom(18);
                    if( prev_currentwindow ) {
                        prev_currentwindow.close();
                    }
                    infowindow.open(map, mylocationmarker);
                    prev_currentwindow = infowindow;
                });
                if (prev_marker){prev_marker.setMap(null);}
                prev_marker = mylocationmarker;
                google.maps.event.addListener(map, 'click', function() {infowindow.close();});
            }, function() {
                handleLocationError(true, infoWindow, map.getCenter());
            });
        } else {
            // If Geolocation unable to run then:
            handleLocationError(false, infoWindow, map.getCenter());
        }
        function handleLocationError(browserHasGeolocation, infoWindow, pos){
            infoWindow.setPosition(pos);
            infoWindow.setContent(browserHasGeolocation ?
                                  'Error: The Geolocation service failed.' :
                                  'Error: Your browser doesn\'t support geolocation.');
            infoWindow.open(map);
        }
    });
}



// Initiate Google Maps to UIC coordinates on Start
function initMap() {
    var uic = {lat: 41.8698, lng: -87.6496};
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: uic
    });

    // Make an Ajax Call for Bathroom locations using restdb.io API
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://uicbr-de20.restdb.io/rest/br-locations-1",
        "method": "GET",
        "headers": {
            "content-type": "application/json",
            "x-apikey": "5cbab22f22f4c217d01b6da3",
            "cache-control": "no-cache"
        }
    }

    // Card display for Markers
    $.ajax(settings).done(function (response) {
        var data = response;
        var prev_infowindow =false;
        $.each(data, function(i,v){
            var building = v.building;
            var type = v.type;
            var location = v.location;

            // Check that the values of lat and lng are floats
            if (!isNaN(v.lat) && v.lat.toString().indexOf('.') != -1 && !isNaN(v.lng) && v.lng.toString().indexOf('.') != -1){
                var marker = new google.maps.Marker({
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 7,
                        strokeColor: '#D50032'
                    },
                    position: new google.maps.LatLng(parseFloat(v.lat),parseFloat(v.lng)),
                    map: map,
                    title: building + ' - ' + type //marker hover information pop up
                });

                //  Infowindow for pop up display on marker click
                var contentString = '<div class="col s12 m6"><div class="card-content white-text"<span class="card-title" style="font-size: 20px">'+building+'</span><p>'+type+'</p><p>Details: '+location+'</p></div><div class="card-action"></div></div>';
                var infowindow = new google.maps.InfoWindow({
                    content: contentString
                });
                // Event handler to only have one info window open at a time
                google.maps.event.addListener(marker, 'click', function() {
                    if( prev_infowindow ) {
                        prev_infowindow.close();
                    }
                    infowindow.open(map, marker);
                    prev_infowindow = infowindow;
                }); 
                // Event handler to close infowindow on map click
                google.maps.event.addListener(map, 'click', function() {
                    infowindow.close();
                }); 
            }else{pass}
        });
    });
    // Create the DIV to hold the geolocation button
    var geolocationDiv = document.createElement('div');
    var geo = new geolocation(geolocationDiv, map);
    geolocationDiv.index = 1;
    map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(geolocationDiv);
}

// Functions upon DOM load
$(document).ready(function() {
    function hidescreen(){$(".pages").hide();}

    // Close Drawer when an item is selected
    $(".mdl-navigation__link").on('click', function() {$( '.mdl-layout__drawer, .mdl-layout__obfuscator' ).removeClass( 'is-visible' );});

    // Click event handlers for buttons
    $("#logo").on("click", function(){document.location.reload();});
    $("#about-btn").on("click", function(){
        hidescreen();
        $("#about").show();
    });
    $("#help-btn").on("click", function(){hidescreen(),$("#about").show();});
    $("#home").on("click", function(){hidescreen(), $("#map").show();});
    $("#add").on("click", function(){hidescreen(),$("#addlocation").show();});
    $("#favorite").on("click", function(){hidescreen(),$("#favpage").show();});
    $("#getmylocal").on("click", function(){
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                var lat = position.coords.latitude
                var lng = position.coords.longitude
                $("#latnum").val(position.coords.latitude);
                $("#lngnum").val(position.coords.longitude);
                document.getElementsByClassName('form-control')[2] = position.coords.latitude;
                document.getElementsByClassName('form-control')[3] = position.coords.longitude;
            });
        }else {
            // If Geolocation unable to run then:
            handleLocationError(false, infoWindow, map.getCenter());
        }
    });
    $("#logohome").on("click", function(){
        $(".mdl-layout__content").hide();
        $('#loader-wrapper').show();
        initMap();
        setTimeout(function(){
            $('#loader-wrapper').hide();
            $(".mdl-layout__content").show();
            $("#map").show();
        }, 1100);
        $(".pages").hide();
        $("#map").show();
    });

    // On Sumbitting new location, update database
    $("#submit").on("click", function() {         
        var building = $("#buildingname").val();
        var gender = $("#gendertype").val();
        var desp = $("#desp").val();
        var lat = $("#latnum").val();
        var lng = $("#lngnum").val();

        // Check if all forum boxes are all filled in
        // If true, post data into server db, else alert pop-up
        if(building&&gender&&desp&&lat&&lng) {
            var jsondata = {building: building,lat: lat, lng: lng, location: desp, type: gender};
            var settings = {
                "async": true,
                "crossDomain": true,
                "url": "https://uicbr-de20.restdb.io/rest/br-locations-1",
                "method": "POST",
                "headers": {
                    "content-type": "application/json",
                    "x-apikey": "5cbab22f22f4c217d01b6da3",
                    "cache-control": "no-cache"
                },
                "processData": false,
                "data": JSON.stringify(jsondata)
            }
            $.ajax(settings).done(function (response) {
                console.log('Sumbission Successful');
            });
            // Clear out input boxes for next input
            $("#buildingname").val('');
            $("#desp").val('');
            $("#latnum").val('');
            $("#lngnum").val('');
            alert("Location submitted for review.\nWhen validated it will be added onto the map.\n\n Thanks!");
        } else {
            alert("Please fill in all columns. If unknown, type: NA");
        }
    });
}); 

//Make an Ajax Call for Weather using OpenWeathermap API
getweather();
function getweather(){
    var weatherurl = "https://api.openweathermap.org/data/2.5/weather?q=Chicago,us&appid=6c40b84bd4c1b447c8ff9daa4e5c3e1a";
    $.get(weatherurl, function(responce){
        var temp = responce.main.temp;
        temp = Math.round(((temp-273.15)*(9/5) +32));
        $(".msg").empty();
        $(".msg").append("It is "+temp+"&#176;F on campus right now.");
    });   
}