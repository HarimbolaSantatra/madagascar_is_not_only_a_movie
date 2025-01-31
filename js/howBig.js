import { width, height, mapScale,mapTranslate,path, drawRegion, drawMainTowns } from './app.js';

function drawSecondCountries(mapName,countryPathData,centerCoordinateData){
    let second_countries = topojson.feature(countryPathData, countryPathData.objects.countries);
    second_countries.features = second_countries.features.filter(function(d){ return d.properties.name==mapName});

    const averageCenter = centerCoordinateData.filter(function(d){ return d.map_name==mapName})[0];
    const projection2 = d3.geoOrthographic()
    .rotate([-averageCenter.long, -averageCenter.lat])                
    .scale(mapScale)
    .translate(mapTranslate)
    const path2 = d3.geoPath().projection(projection2);

    // Define the drag behavior using D3's drag() function
    const drag = d3.drag()
    .on('start', function () {
        // Bring the dragged element to the front
        d3.select(this).raise().classed('active', true);

        // Record the initial mouse position relative to the dragged element
        const [x, y] = d3.mouse(this);
        d3.select(this).attr('initial-x', x);
        d3.select(this).attr('initial-y', y);
        
    })
    .on('drag', function (d) {
        // Calculate the distance moved by the mouse
        const dx = d3.event.x - d3.select(this).attr('initial-x');
        const dy = d3.event.y - d3.select(this).attr('initial-y');

        // Update the position of the dragged element during dragging
        d3.select(this).attr('transform', `translate(${dx},${dy})`);

    })
    .on('end', function () {
        // Remove the 'active' class when dragging ends
        d3.select(this).classed('active', false);
        // drawSecondCountries(mapName,countriesPath,centerCoordinateData)
    });

    d3.select(".all_countries")
    .selectAll(".second_country")
        .data(second_countries.features, function(d){return d.properties.name})
        .join(
        enter => enter
        .append("path")
        .attr("class", "second_country")
          .attr("fill", "#FA6900")
        //   .attr('mask', 'url(#country-mask)')
          .attr("d", path2)
        //   .style("stroke", "none")
          .call(drag),
        update => update,
        exit => exit.remove()
          )
}

export function howBig (countries,world,all_country_coordinate,regions,townData){

    // Draw the map
    const svg = d3.select(".myDataviz"); 
                  // .call(zoomed);

    svg.append("g")
        .attr("class", "all_countries")
        .selectAll(".country")
        .data(countries.features)
        .join("path")
        .attr("class", "country")
          .attr("fill", "#00ccbc")
          .attr("d", path);
    
    drawRegion(regions);
    drawMainTowns(regions,townData);
    
    // Create a dropdown input
    const dropdown = d3.select(".mapOptions")
    .append("select")
    .attr("id", "countrySelect")
    .on("change", function() {
        const map_name = d3.select(this).property("value");
        drawSecondCountries(map_name,world,all_country_coordinate);
    });

    // Add the country names as options
    dropdown.selectAll("option")
    .data(all_country_coordinate)
    .enter()
    .append("option")
    .text(d => d.map_name)  
    .attr("value", d => d.map_name);

    // Add a random button to trigger the drawSecondCountries function
    d3.select(".mapOptions")
    .append("button")
    .attr("class", "randomButton")
    .text("Random Country")
    .on("click", function() {
        const randomIndex = Math.floor(Math.random() * all_country_coordinate.length);
        const map_name = all_country_coordinate[randomIndex].map_name;
        drawSecondCountries(map_name,world,all_country_coordinate);
        dropdown.property("value", map_name);
    });
}