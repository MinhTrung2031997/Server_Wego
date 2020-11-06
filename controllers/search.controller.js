const detailLocation = require('../models/detailLocation.model');
const mainLocation = require('../models/mainLocation.model');
const planLocation = require('../models/planLocation.model');
const axios = require('axios');
const keyApi = 'fdef9ef84fmsh2b629839a43ad16p1a7925jsn6dd919bd6305';

const optimizeDirection = async (stops) => {
  let data = await axios({
    method: 'GET',
    url: 'https://trueway-directions2.p.rapidapi.com/FindDrivingRoute',
    headers: {
      'content-type': 'application/octet-stream',
      'x-rapidapi-host': 'trueway-directions2.p.rapidapi.com',
      'x-rapidapi-key': keyApi,
      useQueryString: true,
    },
    params: {
      optimize: 'true',
      stops: stops,
    },
  })
    .then((response) => {
      if (response.data.route.geometry) response.data.route.geometry = ''; // remove detail coordinate because not use and slow api
      return response.data;
    })
    .catch((error) => {
      console.log(error);
      return null;
    });
  return data;
};

const determineHeadTailPoint = (location) => {
  let sortLatitude = [...location.sort((a, b) => a.latitude - b.latitude)]; //sort location by increase latitude
  let sortLongitude = [...location.sort((a, b) => a.longitude - b.longitude)]; //sort location by increase longitude
  let lengthArr = location.length - 1;
  let deltaLatitude = sortLatitude[lengthArr].latitude - sortLatitude[0].latitude; // calculator delta latitude
  let deltaLongitude = sortLongitude[lengthArr].longitude - sortLongitude[0].longitude; // calculator delta longitude
  let headTailPoint = deltaLatitude >= deltaLongitude ? sortLatitude : sortLongitude;
  return headTailPoint;
};

const getLatLngInArray = (array) => {
  let stops = array.reduce((acc, cur) => {
    //get latitude longitude in array
    if (acc.length == 0) {
      acc = acc + cur['latitude'] + ',' + cur['longitude'];
    } else {
      acc = acc + ';' + cur['latitude'] + ',' + cur['longitude'];
    }
    return acc;
  }, '');
  return stops;
};

module.exports = {
    searchLocation: async (req, res, next) => {
        let {textSearch} = req.params;
        textSearch = textSearch.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // remove accent
        let locationMain = await mainLocation.find({noAccent: { $regex: textSearch, $options: "i" }})
                            .select({ "code": 1, "title": 1, "_id": 0}); // search in main location
        let locationDetail = await detailLocation.find({noAccent: { $regex: textSearch, $options: "i" }})
                             .select({ "code": 1, "title": 1, "_id": 0}); // search in detail location
        let allLocation = locationDetail.concat(locationMain); // concatenate array
        let reduceAllLocation = allLocation.reduce((acc, cur) => {
            let check = (acc[cur.code] || "").includes(cur.title) // check if title exist or not
            acc[cur.code] = check ? (acc[cur.code] || "") : (acc[cur.code] || "") + cur.title + ", ";
            return acc;
        },{});
        let code = Object.keys(reduceAllLocation); // get key array object
        let infoLocation = await mainLocation.find({'code': {$in : code}}).lean(); // convert code to main location and return
        let result = infoLocation.map(el => ({...el, resultSearch: reduceAllLocation[el.code]})); // add key value to object
        res.send({data:result});
    },
    getDetailLocation: async (req, res, next) => {
        let {code} = req.params;
        let result = await detailLocation.find({'code': code});
        res.send({data: result});
    },
    getPlanLocation: async (req, res, next) => {
        let {code} = req.params;
        let location = await planLocation.find({'code': code});
        let headTailPoint = determineHeadTailPoint(location); // determine start point and end point for direction
        let stops = getLatLngInArray(headTailPoint); // get latitude longitude to call api route
        let dataOptimizeDirection = await optimizeDirection(stops); // call api optimize route direction
        if(dataOptimizeDirection){
            let arrangeListLocation = []; // arrange array follow api return
            for(let i = 0; i < headTailPoint.length; i++){
                arrangeListLocation.push(headTailPoint[dataOptimizeDirection.route.waypoints_order[i]]);
            }
            res.send({
                data: dataOptimizeDirection,
                location: arrangeListLocation
            });
        }else{
            res.send({
                data: [],
                location: location
            });
        }
        
    },
    getMainLocation: async (req, res, next) => {
        let result = await mainLocation.find();
        res.send({data: result});
    },
    optimizeRoute: async (req, res) => {
        let {location} = req.body;
        // let removeDuplicateLocation = [
        //     ...new Map(location.map(obj => [`${obj.title}:${obj.code}`, obj]))
        //     .values()
        // ];

        let headTailPoint = location; // determine start point and end point for direction
        let stops = getLatLngInArray(headTailPoint); // get latitude longitude to call api route
        let dataOptimizeDirection = await optimizeDirection(stops); // call api optimize route direction
        if(dataOptimizeDirection){
            let arrangeListLocation = []; // arrange array follow api return
            for(let i = 0; i < headTailPoint.length; i++){
                arrangeListLocation.push(headTailPoint[dataOptimizeDirection.route.waypoints_order[i]]);
            }
            res.send({
                data: dataOptimizeDirection,
                location: arrangeListLocation
            });
        }else{
            res.send({
                data: [],
                location: location
            });
        }
    }
}
