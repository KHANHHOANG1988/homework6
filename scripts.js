var citySearchInput = $("#citySearchInput");
var cityInput = $("#cityInput");
var searchedCities = $("#cityBtns");

var cityHist;

var currentWeather = $("#currentWeather");
var ForcastDiv = $("#Forcast");

var authKey = "83561f855ee04884321f75c4f332dfb9";
var forcastQuery = "https://api.openweathermap.org/data/2.5/forecast?appid="+authKey+"&q=";
var currentWeatherQuery = "https://api.openweathermap.org/data/2.5/weather?appid="+authKey+"&q=";
var uvQuery = "https://api.openweathermap.org/data/2.5/uvi?appid="+authKey;

function printButtons(){
    searchedCities.empty();

    for(city of cityHist){
        searchedCities.prepend( $("<button/>",{class:"btn btn-secondary btn-white city-btn", 'data-city':city, text:city}) )
    }
    saveHist();

}

function saveHist(){
    localStorage.setItem('history',JSON.stringify(cityHist));
}


function loadHist(){
    cityHist = JSON.parse(localStorage.getItem('history'));
    if(cityHist === null){
        cityHist = [];
    }
}


function printWeatherForCity(cityName){
    $.ajax({
        url:currentWeatherQuery+cityName,
        method:"GET",
        error:function (xhr, ajaxOptions, thrownError){
            if(xhr.status==404) {
                currentWeather.empty();
                currentWeather.append($("<h4/>",{text: "I'm sorry, but '"+cityHist.pop()+"' could not be found by Open Weather API.  I took the liberty of removing this from your history.  Please try another city!" }));
                printButtons();
            }
        }
    })
    .then(function(response){
        currentWeather.empty();
        currentWeather.append([
            $("<div/>",{class:"card-body"}).append([
                $('<div/>',{text:"Temperature: "+((response.main.temp - 273.15)*(9/5) + 32).toFixed(1)+"°F"}),
                $('<div/>',{text:"Humidity: "+response.main.humidity+"%"}),
                $('<div/>',{text:"Wind Speed: "+response.wind.speed+" MPH"}),
                $('<div/>',{id:"uvIndex",text:"UV Index: "})
            ])
        ])
        printWeatherForecast(cityName)
        getUV(response);
    });
}
function getUV(response){
    $.ajax({
    url:uvQuery+"&lat="+response.coord.lat+"&lon="+response.coord.lon,
    method:"GET"
})
    .then(function(uvresponse){
        
        var uv = uvresponse.value;
        var uvScale;

        if(uv < 2 ){
            uvScale = "uvFavorable"
        } else if(uv < 6 ){
            uvScale = "uvModerate"
        } else if(uv < 9 ){
            uvScale = "uvSevere"
        } else{
            uvScale = "uvEx"
        }
        
        $("#uvIndex").append( $("<span/>",{class:"uv "+uvScale, text:uv}) );
    });
}


function printWeatherForecast(cityName){
    $.ajax({
        url:forcastQuery+cityName,
        method:"GET",
    })
    .then(function(response){
        ForcastDiv.empty()
        for (chunk of response.list){
            if(chunk.dt_txt.includes("12:00:00")){
                ForcastDiv.append( 
                    $("<div/>",{class:"card bg-primary text-center text-white border border-white p-2 col-xs-12 col-sm-6 col-md-4 col-lg"}).append([
                        $("<div/>",{class:"font-weight-bold", text:moment.unix(chunk.dt).format("MM/DD/YYYY")}),
                        $('<div/>',{text:"Temp: "+((chunk.main.temp - 273.15)*(9/5) + 32).toFixed(1)+"°F"}),
                        $('<div/>',{text:"Humidity: "+chunk.main.humidity+"%"})
                    ])
                )

            }
        }
    });
}


function cityAdded(event){
    event.preventDefault();
    newCity = cityInput.val().toLowerCase().trim();

    if(cityHist.indexOf(newCity) < 0){
        cityHist.push(newCity)
    }
    else{
        printWeatherForCity(newCity);
        return;
    }

    cityInput.val("");

    printWeatherForCity(newCity);

    printButtons();
}


$(window).on("load", function(){
    loadHist();
    printButtons();
});

citySearchInput.on("submit", cityAdded);

$(document).on("click",".city-btn", function(){
    city = $(this).attr("data-city");
    printWeatherForCity(city);
})