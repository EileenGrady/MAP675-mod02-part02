"use strict"

const fs = require('fs');
const mapshaper = require('mapshaper');

// read original ped signal geojson in
fs.readFile(__dirname + "/../project-files/ped-signal-ada-compliance.geojson", "utf8", (err, geojson) => {
    if (err) throw err;

    const commands = '-filter remove-empty -o precision=.0001 format=geojson';

    mapshaper.applyCommands(commands, geojson, (err, geojson) => {
        if (err) throw err;

        // parse results so we can run filterFields function
        const newGeoJson = JSON.parse(geojson)

        // run filterFields function
        const outGeoJSON = filterFields(newGeoJson);

        // write new json to data directory
        fs.writeFile(__dirname + " /../data/ped-signals-filtered.json", JSON.stringify(outGeoJSON), "utf8", (err) => {
        if (err) throw err;
        console.log('done writing file');
        })

    })

})

// define filterFields function
function filterFields(geojson) {
    // shorthand to our features
    const features = geojson.features,
        newFeatures = []; // empty array for new features
  
    // loop through all the features
    features.forEach((feature) => {
      // on each loop, create an empty object
      const tempProps = {};
      // loop through each of the properties for that feature
      for (const prop in feature.properties) {
        // if it's a match
        // choose comment field which details ADA compliance to show in popup
        if (prop === 'oa_cmnt'|| prop === 'evnt_lat' || prop === 'evnt_lon') {
          // create the prop/value
          tempProps[prop] = feature.properties[prop];
        }
      }
      // now push a new feature to the newFeatures array
      // we will use the existing feature type and geometry,
      // but we can use our new properties as the "properties" value
      newFeatures.push({
        "type": feature.type,
        "geometry": feature.geometry,
        "properties": tempProps
      });
    });
    // finally, return a GeoJSON object FeatureCollection,
    // using the new features as the "features" value
    return {
      "type": "FeatureCollection",
      "features": newFeatures
    }
  }