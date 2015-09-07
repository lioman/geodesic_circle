var center = [8.404444, 49.013611];
var centerPoint = new OpenLayers.Geometry.Point(center[0], center[1]);

var ol_wms = new OpenLayers.Layer.WMS(
    'OSM Mapnik',
    'http://irs.gis-lab.info/?',
    {
        layers: 'osm'
    },
    {attribution: '<a href="http://www.openstreetmap.org/copyright">© OpenStreetMap Contributors</a>'}
);

var sat_wms = new OpenLayers.Layer.WMS(
    'Landsat',
    'http://irs.gis-lab.info/?',
    {
        layers: 'landsat'
    },
    {attribution: 'Landsat - NASA'}
);

var map = new OpenLayers.Map("map", {
    center: new OpenLayers.LonLat(center[0], center[1]),
    units: 'm'
});


var featureLayer = new OpenLayers.Layer.Vector('Circle Layer');
var markers = new OpenLayers.Layer.Markers('Markers');

var size = new OpenLayers.Size(24, 24);
var offset = new OpenLayers.Pixel(-(size.w / 2), -size.h);
var icon = new OpenLayers.Icon('ic_place_black_24dp_1x.png', size, offset);
markers.addMarker(new OpenLayers.Marker(new OpenLayers.LonLat(center), icon));

var circle = OpenLayers.Geometry.Polygon.createRegularPolygon(centerPoint, 2.74, 150);
var circleFeature = new OpenLayers.Feature.Vector(circle, {}, {fill: false});

map.addLayers([sat_wms, ol_wms, markers]);
var geodesicCircle = new OpenLayers.Feature.Vector(
    drawGeodesicCircle(centerPoint, 200000, 100, 0, map.getProjectionObject())
);

featureLayer.addFeatures([circleFeature, geodesicCircle]);
map.addControl(new OpenLayers.Control.LayerSwitcher());
map.addLayer(featureLayer);
map.zoomToMaxExtent();

map.setCenter(center, 7);


function drawGeodesicCircle(origin, radius, sides, rotation, projection) {
    'use strict';
    if (projection.getCode() !== 'EPSG:4326') {
        origin.transform(projection, new OpenLayers.Projection('EPSG:4326'));
    }
    var latlon = new OpenLayers.LonLat(origin.x, origin.y);

    var angle;
    var new_lonlat, geom_point;
    var geodesicCirclePoints = [];

    for (var i = 0; i < sides; i++) {
        angle = (i * 360 / sides) + rotation;
        new_lonlat = OpenLayers.Util.destinationVincenty(latlon, angle, radius);
        new_lonlat.transform(new OpenLayers.Projection('EPSG:4326'), projection);
        geom_point = new OpenLayers.Geometry.Point(new_lonlat.lon, new_lonlat.lat);
        geodesicCirclePoints.push(geom_point);
    }
    var ring = new OpenLayers.Geometry.LinearRing(geodesicCirclePoints);
    return new OpenLayers.Geometry.Polygon([ring]);
}