'use strict';

import {Position} from './model/Position.js';
import {Path} from './model/Path.js';
import {Areas} from './model/Areas.js';
import {Area} from './model/Area.js';

// Import controls
import {CollectionControl} from './controls/collection_control.js';
import {CoordinatesControl} from './controls/coordinates_control.js';
import {LocalCoordinatesControl} from './controls/local_coordinates_control.js';
import {RegionBaseCoordinatesControl} from './controls/region_base_coordinates_control.js';
import {GridControl} from './controls/grid_control.js';
import {LocationLookupControl} from './controls/location_lookup_control.js';
import {MapLabelControl} from './controls/map_label_control.js';
import {PlaneControl} from './controls/plane_control.js';
import {RegionLabelsControl} from './controls/region_labels_control.js';
import {RegionLookupControl} from './controls/region_lookup_control.js';
import {TitleLabel} from './controls/title_label.js';

$(document).ready(function () {

    var map = L.map('map', {
        //maxBounds: L.latLngBounds(L.latLng(-40, -180), L.latLng(85, 153))
        zoomControl: false,
        renderer: L.canvas()
    }).setView([-79, -137], 7);

    map.plane = 0;

    map.updateMapPath = function() {
        if (map.tile_layer !== undefined) {
            map.removeLayer(map.tile_layer);
        }
        map.tile_layer = L.tileLayer('https://raw.githubusercontent.com/Explv/osrs_map_full_2019_05_29/master/' + map.plane + '/{z}/{x}/{y}.png', {
            minZoom: 4,
            maxZoom: 11,
            attribution: 'Map data',
            noWrap: true,
            tms: true
        });
        map.tile_layer.addTo(map);
        map.invalidateSize();
    }

    map.updateMapPath();
    map.getContainer().focus();

    map.addControl(new TitleLabel());
    map.addControl(new CoordinatesControl());
    map.addControl(new RegionBaseCoordinatesControl());
    map.addControl(new LocalCoordinatesControl());
    map.addControl(L.control.zoom());
    map.addControl(new PlaneControl());
    map.addControl(new LocationLookupControl());
    map.addControl(new MapLabelControl());
    map.addControl(new CollectionControl({ position: 'topright' }));
    map.addControl(new RegionLookupControl());
    map.addControl(new GridControl());
    map.addControl(new RegionLabelsControl());
    
    var prevMouseRect, prevMousePos;
    map.on('mousemove', function(e) {
        var mousePos = Position.fromLatLng(map, e.latlng, map.plane);

        if (prevMousePos !== mousePos) {

            prevMousePos = mousePos;

            if (prevMouseRect !== undefined) {
                map.removeLayer(prevMouseRect);
            }

            prevMouseRect = mousePos.toLeaflet(map);
            prevMouseRect.addTo(map);
        }
    });

    /*** The code here is what I added ***/
    async function showPaths (url) {
        let res = await axios.get(url)
        let nodes = res.data.nodes
        let connections = res.data.connections

        let link = function (nodeId) {
            let path = new Path(map)
            for (let n = 0; n < connections.length; n++) {
                let currNodeId = connections[n][0]
                let nextNodeId = connections[n][1]
                if (currNodeId == nodeId) {
                    path.add(new Position(nodes[currNodeId].x,nodes[currNodeId].y))
                    path.add(new Position(nodes[nextNodeId].x,nodes[nextNodeId].y))
                    map.addLayer(path.featureGroup)
                    link(nextNodeId)
                }
            }
        }

        link(1)
    }

    showPaths('json/res.json')

/* ====================================================== */
    // async function showPaths (url) {
    //     let res = await axios.get(url)
    //     let nodes = res.data.nodes
    //     let connections = res.data.connections
    //     let id1 = connections[0][0]
    //     let id2 = connections[0][1]
    //     let p1 = new Position(nodes[id1].x,nodes[id1].y)
    //     let p2 = new Position(nodes[id2].x,nodes[id2].y)
    //     let path = new Path(map)
    //     path.add(p1)
    //     path.add(p2)
    //     map.addLayer(path.featureGroup)
    // }

    // showPaths('json/res.json')

/* ====================================================== */
    // let path1 = new Path(map)
    // let pos11 = new Position(3274,3364,0)
    // let pos12 = new Position(3124,3361,0)
    // let pos13 = new Position(3017,3390,0)
    // path1.add(pos11)
    // path1.add(pos12)
    // path1.add(pos13)
    // map.addLayer(path1.featureGroup)

    // let path2 = new Path(map)
    // let pos21 = new Position(3275,3276,0)
    // let pos22 = new Position(3259,3213,0)
    // let pos23 = new Position(3204,3211,0)
    // let pos24 = new Position(3194,3273,0)
    // let pos25 = new Position(3113,3272,0)
    // let pos26 = new Position(3085,3232,0)
    // path2.add(pos21)
    // path2.add(pos22)
    // path2.add(pos23)
    // path2.add(pos24)
    // path2.add(pos25)
    // path2.add(pos26)
    // map.addLayer(path2.featureGroup)

    // let areas = new Areas(map)
    // let area1 = new Area(
    //     new Position(3303,3393,0),
    //     new Position(3369,3345,0)
    // )
    // let area2 = new Area(
    //     new Position(2911,3392,0),
    //     new Position(2978,3328,0)
    // )
    // areas.add(area1)
    // areas.add(area2)
    // map.addLayer(areas.featureGroup)

/* ====================================================== */
    // function vPathTorPath (vPathArray) {
    //     let rPathArray = []
    //     vPathArray.forEach(vPoint => {
    //         let rPoint = Position.toLatLng(map, vPoint[0], vPoint[1])
    //         rPathArray.push([rPoint.lat, rPoint.lng])
    //     })
    //     return rPathArray
    // }
  
    // async function showPaths (url) {
    //     let res = await axios.get(url)
    //     let vPaths = res.data
    //     vPaths.forEach(vPath => {
    //         let rPath = vPathTorPath(vPath)
    //         L.polyline(rPath, {color: '#00ff00'}).addTo(map)
    //     })
    // }
  
    // showPaths('json/vpaths.json')
});
