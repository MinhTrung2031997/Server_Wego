const detailLocation = require('../models/detailLocation.model');
const mainLocation = require('../models/mainLocation.model');
const planLocation = require('../models/planLocation.model');
const axios = require("axios");
const keyApi = 'fdef9ef84fmsh2b629839a43ad16p1a7925jsn6dd919bd6305';

const optimizeDirection = async stops => {
    let data = await axios({
        "method":"GET",
        "url":"https://trueway-directions2.p.rapidapi.com/FindDrivingRoute",
        "headers":{
        "content-type":"application/octet-stream",
        "x-rapidapi-host":"trueway-directions2.p.rapidapi.com",
        "x-rapidapi-key": keyApi,
        "useQueryString":true
        },"params":{
        "optimize":"true",
        "stops": stops
        }
        })
        .then((response)=>{
            if(response.data.route.geometry)
                response.data.route.geometry = ""; // remove detail coordinate because not use and slow api
            return response.data;
        })
        .catch((error)=>{
            console.log(error)
            return null;
        })
    return data;
}

const determineHeadTailPoint = location => {
    let sortLatitude = [...location.sort((a,b) => a.latitude - b.latitude)]; //sort location by increase latitude
    let sortLongitude = [...location.sort((a,b) => a.longitude - b.longitude)]; //sort location by increase longitude
    let lengthArr = location.length-1;
    let deltaLatitude = sortLatitude[lengthArr].latitude - sortLatitude[0].latitude; // calculator delta latitude
    let deltaLongitude = sortLongitude[lengthArr].longitude - sortLongitude[0].longitude; // calculator delta longitude
    let headTailPoint = deltaLatitude >= deltaLongitude ? sortLatitude : sortLongitude;
    return headTailPoint;
}

const getLatLngInArray = array => {
    let stops = array.reduce((acc, cur) => { //get latitude longitude in array
        if(acc.length == 0){
            acc = acc + cur['latitude'] + "," + cur['longitude'];
        }else{
            acc = acc + ";" + cur['latitude'] + "," + cur['longitude'];
        }
        return acc;
    },"");
    return stops;
}

module.exports = {
    getDataSearch: (req, res, next) => {
        res.send({data: data});
    },
    searchLocation: async (req, res, next) => {
        let {textSearch} = req.params;
        textSearch = textSearch.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // remove accent
        let locationMain = await mainLocation.find({noAccent: { $regex: textSearch, $options: "i" }})
                            .select({ "code": 1, "_id": 0}); // search in main location
        let valueMain = locationMain.map(({ code }) => code);
        let locationDetail = await detailLocation.find({noAccent: { $regex: textSearch, $options: "i" }})
                             .select({ "code": 1, "_id": 0}); // search in detail location
        let valueDetail = locationDetail.map(({ code }) => code);
        let valueCode = valueMain.concat(valueDetail); // concatenate code main and code detail location
        let code = [...new Set(valueCode)];
        let result = await mainLocation.find({'code': {$in : code}}) // convert code to main location and return
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
        let removeDuplicateLocation = [
            ...new Map(location.map(obj => [`${obj.title}:${obj.code}`, obj]))
            .values()
        ];

        let headTailPoint = determineHeadTailPoint(removeDuplicateLocation); // determine start point and end point for direction
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
                location: removeDuplicateLocation
            });
        }
        
    }
};

const data = [
    {
        "title": "Hồ Chí Minh",
        "image": "images/main/8ca97c9f3b7eb09da31b280daf9c920a638dd3e2.jpg",
        "desc": "Thành phố với các địa danh thuộc địa của Pháp như Nhà thờ Đức Bà, Bảo tàng chứng tích chiến tranh & các khu chợ nhộn nhịp.",
        "data": [
            {
                "title": "Khu di tích lịch sử Địa Đạo Củ Chi",
                "image": "images/details/thumb/hochiminh/cc00e69ee88c9874d195e55205b905972ee5bfc8.jpg",
                "desc": "Mê cung địa đạo & di tích thời chiến"
            },
            {
                "title": "Chợ Bến Thành",
                "image": "images/details/thumb/hochiminh/12bba3a60fdc2827f1ce2e0932856fdfc57f04a6.jpg",
                "desc": "Nơi mua đồ lưu niệm & ẩm thực địa phương"
            },
            {
                "title": "Dinh Độc Lập",
                "image": "images/details/thumb/hochiminh/621ee7abda4247ec9efc4de75ccfff8558192738.jpg",
                "desc": "Cơ quan đầu não của chính phủ thời chiến"
            },
            {
                "title": "Nhà thờ Đức Bà Sài Gòn",
                "image": "images/details/thumb/hochiminh/a5d440a9671e8f373a550bc879191046670f82a9.jpg",
                "desc": "Nhà thờ phong cách châu Âu từ thế kỷ 19"
            },
            {
                "title": "Bảo tàng Chứng tích Chiến tranh",
                "image": "images/details/thumb/hochiminh/e0d2103c2a2fcc7409bbff0f432777b0b1ff9600.jpg",
                "desc": "Nơi trưng bày quân khí & ảnh về quân đội"
            },
            {
                "title": "Bưu Điện Trung Tâm Thành Phố",
                "image": "images/details/thumb/hochiminh/e657d5602e5a96455bd61e9dbed8a4d46286bb22.jpg",
                "desc": "Bưu điện lớn thế kỷ 19"
            },
            {
                "title": "Tháp Bitexco Financial Tower",
                "image": "images/details/thumb/hochiminh/6f08f9b6b37e66c67448ffd0421a38ee9e4e0e07.jpg",
                "desc": "Tòa nhà chọc trời với trung tâm mua sắm"
            },
            {
                "title": "Nhà hát Thành phố Hồ Chí Minh",
                "image": "images/details/thumb/hochiminh/0e0e56030efdb7e233b385d2c1a73eb3aedecefb.jpg",
                "desc": "Phòng hòa nhạc & sân khấu ba lê"
            },
            {
                "title": "Khu Du lịch Văn hóa Suối Tiên",
                "image": "images/details/thumb/hochiminh/50c6958ac9e11fdf333d3e281032c8adfcca5b3a.jpg",
                "desc": "Công viên giải trí lấy cảm hứng từ Phật"
            },
            {
                "title": "Phạm Ngũ Lão",
                "image": "images/details/thumb/hochiminh/a0d8ce1f70a476d24fa014a421d4e2cd955050fa.jpg",
                "desc": "Du lịch bụi và cuộc sống về đêm"
            },
            {
                "title": "UBND Thành phố Hồ Chí Minh",
                "image": "images/details/thumb/hochiminh/8e1c331f37b7b55ae36a6f1816a4efeceea6c952.jpg",
                "desc": "Nhà hát opera, kiến trúc và tòa thị chính"
            },
            {
                "title": "Chợ Lớn",
                "image": "images/details/thumb/hochiminh/d875cda53b505a76e071ef679772735d4d7ecfca.jpg",
                "desc": "Mua sắm cá nhân"
            },
            {
                "title": "Chùa Ngọc Hoàng",
                "image": "images/details/thumb/hochiminh/b462d8900a9173e6bf57e86fe73a77d957ab2b79.jpg",
                "desc": "Đền, bộ rùa, Điện thờ, phật giáo và kiến trúc"
            },
            {
                "title": "Bảo tàng Thành phố Hồ Chí Minh",
                "image": "images/details/thumb/hochiminh/43d8b8b48cad256f8ff13f25aca72146050ead03.jpg",
                "desc": "Bảo tàng vua chúa trưng bày đồ cổ"
            },
            {
                "title": "Bà Thiên Hậu Pagoda",
                "image": "images/details/thumb/hochiminh/73225106e2be5a0026180bbc45b172d48f665527.jpg",
                "desc": "Ngôi chùa Trung Hoa xây vào năm 1760"
            },
            {
                "title": "Saigon Skydeck",
                "image": "images/details/thumb/hochiminh/adf08e83e3a02d9f32708e41d78d321b93080bd8.jpg",
                "desc": "Sân ngắm cảnh"
            },
            {
                "title": "Công viên Văn hóa Đầm Sen",
                "image": "images/details/thumb/hochiminh/2a908dd88588a2b64a546a62933b7f7f10d091ec.jpg",
                "desc": "Công viên rực rỡ với các điểm tham quan"
            },
            {
                "title": "Thảo Cầm Viên Sài Gòn",
                "image": "images/details/thumb/hochiminh/341fdae7e54d950d7f8ba459783244038b4f8148.jpg",
                "desc": "Vườn thú có động vật có vú và bò sát"
            },
            {
                "title": "Bùi Viện",
                "image": "images/details/thumb/hochiminh/7e3583a70a7b14c272d494eed1367bb16cdbcc90.jpg",
                "desc": "Bia, du lịch bụi và cuộc sống về đêm"
            },
            {
                "title": "Nguyễn Huệ",
                "image": "images/details/thumb/hochiminh/29e2dcfb7f9e1890556ba1ab31b3acc6cee38956.jpg",
                "desc": "Âm nhạc"
            }
        ],
        "plantrip": [
            {
                "desc": "Chợ nổi tiếng để mua đồ thủ công, lưu niệm, quần áo & hàng hóa khác đồng thời thưởng thức ẩm thực địa phương.",
                "title": "Chợ Bến Thành",
                "image": "images/plantrip/hochiminh/46210e4f92fb78a9a72aa5aa97c20dd33012c8b8.jpg",
                "timemove": "1"
            },
            {
                "desc": "Bưu điện trung tâm hoành tráng hoàn thành năm 1891, với sảnh chính có mái vòm & mặt sơn mang dấu ấn thời gian.",
                "title": "Bưu Điện Trung Tâm Thành Phố",
                "image": "images/plantrip/hochiminh/7a1e290791adba3d1893bb7286e58c3dab1f2f3f.jpg",
                "timemove": "15 phút bằng cách đi bộ"
            },
            {
                "desc": "Nhà thờ Công giáo được xây dựng bằng gạch Pháp vào những năm 1880 và có các tháp chuông Rô-măng cao 58m.",
                "title": "Nhà thờ Đức Bà Sài Gòn",
                "image": "images/plantrip/hochiminh/003e3183295e5a39c81bc8f1041b762d8c14b93c.jpg",
                "timemove": "Ít hơn 5 phút bằng xe hơi"
            },
            {
                "desc": "Quần thể địa đạo rộng lớn từng được sử dụng bởi quân đội Việt Cộng, cùng các vật trưng bày và đài tưởng niệm.",
                "title": "Khu di tích lịch sử Địa Đạo Củ Chi",
                "image": "images/plantrip/hochiminh/b306f93327cc3678e366369e983886166eb386df.jpg",
                "timemove": "1,5 giờ bằng xe hơi"
            }
        ]
    },
    {
        "title": "Vịnh Hạ Long",
        "image": "images/main/ed7f7a658fe684b05eb9067a9c23b62d7993a2ad.jpg",
        "desc": "Vịnh của Việt Nam với hàng ngàn đảo đá vôi, các hang động như Đầu Gỗ, thuyền mành và làng nổi.",
        "data": [
            {
                "title": "Đảo Tuần Châu",
                "image": "images/details/thumb/vinhhalong/ed18b20c48e3df71df9b304cddc35bf0710988f0.jpg",
                "desc": "Cảng, bến du thuyền và cá heo"
            },
            {
                "title": "Vịnh Bái Tử Long",
                "image": "images/details/thumb/vinhhalong/5389f99f3d85dd1a77ae4fd78ef9927170267434.jpg",
                "desc": "Vịnh"
            },
            {
                "title": "Halong Bay Vietnam",
                "image": "images/details/thumb/vinhhalong/9766106b0cf10010a0a7a80c234ea3510e827043.jpg",
                "desc": "Điểm thu hút khách du lịch"
            },
            {
                "title": "Sun World Halong Park",
                "image": "images/details/thumb/vinhhalong/31c9dc9db10caa62d01135c0e706c8b1c9b0e58a.jpg",
                "desc": "Công viên giải trí, công viên và công viên nước"
            },
            {
                "title": "Cửa Vạn",
                "image": "images/details/thumb/vinhhalong/1d3561716015ac18187126f16d20feba97a83a15.jpg",
                "desc": "Khai thác thủy sản"
            },
            {
                "title": "Sun World Halong Complex",
                "image": "images/details/thumb/vinhhalong/86e0edcc385488af30ed54a0fed23c602f9038e1.jpg",
                "desc": "Công viên với tàu lượn & màn trình diễn"
            },
            {
                "title": "Cáp treo Nữ Hoàng",
                "image": "images/details/thumb/vinhhalong/6170545b20e13badf3f0dcd5967e35531f7c7036.jpg",
                "desc": "Cáp treo hai tầng vượt vịnh"
            },
            {
                "title": "Núi Bài Thơ",
                "image": "images/details/thumb/vinhhalong/8b5fcb0d37b3a882798a4ec2e795632e76e0361b.jpg",
                "desc": "Núi"
            },
            {
                "title": "Halong Park (Dragon Park)",
                "image": "images/details/thumb/vinhhalong/5a0777300b3f5ed20b84be45fbb55269acb934f2.jpg",
                "desc": "Công viên, công viên giải trí và công viên nước"
            },
            {
                "title": "Bảo tàng Quảng Ninh",
                "image": "images/details/thumb/vinhhalong/4a50498c47028300ffec72497bde66c03fff9436.jpg",
                "desc": "Bảo tàng hiện đại về lịch sử Việt Nam"
            },
            {
                "title": "Bồ Hòn",
                "image": "images/details/thumb/vinhhalong/e9f2b8b44fb49f8c4687d287d4f67e9cabae06a3.jpg",
                "desc": "Tuyến đường"
            },
            {
                "title": "Bãi tắm",
                "image": "images/details/thumb/vinhhalong/17140fc13907c5f58db6b8bfdde178d1ae863a46.jpg",
                "desc": "Bãi biển"
            },
            {
                "title": "Tiên Ông",
                "image": "images/details/thumb/vinhhalong/1aacd5b08decf9c1563b425f09f1b9bc01e8516f.jpg",
                "desc": "Hang"
            },
            {
                "title": "Ba Trai Dao",
                "image": "images/details/thumb/vinhhalong/d711017f964078469cb1643457a36e12eda3f41c.jpg",
                "desc": "Bãi biển"
            },
            {
                "title": "Typhoon Water Park Hạ Long",
                "image": "images/details/thumb/vinhhalong/9c7f4525bb93a1ff51d5c7639df58675c2f2d3ab.jpg",
                "desc": "Công viên nước và công viên"
            },
            {
                "title": "Đảo Rều",
                "image": "images/details/thumb/vinhhalong/597fe2bf0c08a76c20609e86228bcfb7005937e3.jpg",
                "desc": "Đảo"
            },
            {
                "title": "Halong Majestic Cruise",
                "image": "images/details/thumb/vinhhalong/bb18ff3f0ce54534b37863896e2a25744b7020f1.jpg",
                "desc": "Điểm thu hút khách du lịch"
            },
            {
                "title": "Sun Wheel Hạ Long",
                "image": "images/details/thumb/vinhhalong/11756d11357dd87ed8463c1ef45b71baaa6bf43d.jpg",
                "desc": "Vòng đu quay"
            },
            {
                "title": "Bồ Nâu",
                "image": "images/details/thumb/vinhhalong/7fc97c3edbf4866c4891d363a9803dda9ff2cd9c.jpg",
                "desc": "Hang"
            },
            {
                "title": "Công viên vịnh Rồng",
                "image": "images/details/thumb/vinhhalong/fc4d14d4505e8c12074e458fd46c2e029e62f8d6.jpg",
                "desc": "Công viên"
            }
        ],
        "plantrip": [
            {
                "desc": "Tuần Châu là một phường đảo thuộc thành phố Hạ Long, Quảng Ninh, Việt Nam.",
                "title": "Đảo Tuần Châu",
                "image": "images/plantrip/vinhhalong/493f88f77109c9d9e1f9f7d9c2948005269b146e.jpg",
                "timemove": "1"
            },
            {
                "desc": "Not yet description",
                "title": "Halong Majestic Cruise",
                "image": "images/plantrip/vinhhalong/2caec1f36905381a04f2eba228ecf94b83a3d272.jpg",
                "timemove": "20 phút bằng xe hơi"
            },
            {
                "desc": "Not yet description",
                "title": "Vịnh Hạ Long",
                "image": "images/plantrip/vinhhalong/a2e8d606ce15d543275e50ecad787b2798b1e388.jpg",
                "timemove": "3"
            },
            {
                "desc": "Công viên và công viên giải trí",
                "title": "Halong Park (Dragon Park)",
                "image": "images/plantrip/vinhhalong/98484fcd0a5cbac196f4659d9dc60dbdad3bd1af.jpg",
                "timemove": "4"
            },
            {
                "desc": "Cầu Bãi Cháy nằm trên quốc lộ 18, nối hai phần của thành phố Hạ Long là Hòn Gai và Bãi Cháy qua vịnh Cửa Lục nơi đổ ra vịnh Hạ Long, thuộc địa phận tỉnh Quảng Ninh.",
                "title": "Cầu Bãi Cháy",
                "image": "images/plantrip/vinhhalong/4231da9bef200df9d6dce09b4949ed9a012d3101.jpg",
                "timemove": "Ít hơn 5 phút bằng xe hơi"
            },
            {
                "desc": "Leo và núi",
                "title": "Núi Bài Thơ",
                "image": "images/plantrip/vinhhalong/2c18a5230548803f4a838edf45f4987dd0c38d0f.jpg",
                "timemove": "10 phút bằng xe hơi"
            },
            {
                "desc": "Not yet description",
                "title": "Vòng Quay Mặt Trời Hạ Long",
                "image": "images/plantrip/vinhhalong/b68d885a58d65b790eb913d93a351336e2a02c55.jpg",
                "timemove": "10 phút bằng xe hơi"
            }
        ]
    },
    {
        "title": "Hà Nội",
        "image": "images/main/9d4b777dc2ddac7ce59e2dfffe6f29aa19f20b12.jpg",
        "desc": "Thủ đô của Việt Nam, nơi có Đền Bạch Mã, Chợ Đồng Xuân & Nhà hát lớn Hà Nội theo phong cách tân cổ điển.",
        "data": [
            {
                "title": "Hồ Hoàn Kiếm",
                "image": "images/details/thumb/hanoi/8eecd4ccd0bb7111d3e2bba82b4bcbec0c775a29.jpg",
                "desc": "Hồ và bộ rùa"
            },
            {
                "title": "Lăng Chủ tịch Hồ Chí Minh",
                "image": "images/details/thumb/hanoi/65069f09ff4a58550b29ec68e8d7b068739c491b.jpg",
                "desc": "Nơi an nghỉ cuối cùng của Bác Hồ"
            },
            {
                "title": "Hoàng Thành Thăng Long",
                "image": "images/details/thumb/hanoi/e2f1af1f934b0b21817820723b4d21f4923a422e.jpg",
                "desc": "Hoàng thành từ thế kỷ 11"
            },
            {
                "title": "Chùa Một Cột",
                "image": "images/details/thumb/hanoi/8679d5448262239932bb354f6258ca08860975f4.jpg",
                "desc": "Ngôi chùa thờ Phật cổ xưa được xây lại"
            },
            {
                "title": "Hồ Tây",
                "image": "images/details/thumb/hanoi/7ddbcea01823c2405781441f1977ad0970e7e7ec.jpg",
                "desc": "Hồ và công viên nước"
            },
            {
                "title": "Di Tích Lịch Sử Nhà Tù Hỏa Lò",
                "image": "images/details/thumb/hanoi/043395206bf8d4a6951c03a28df20323ef9750df.jpg",
                "desc": "Bảo tàng tôn tạo từ khu canh gác cũ."
            },
            {
                "title": "Đền Ngọc Sơn",
                "image": "images/details/thumb/hanoi/f848dfee7d56c170a87c2e85c0cce195349522fc.jpg",
                "desc": "Hồ, bộ rùa và kiến trúc"
            },
            {
                "title": "Bảo tàng Dân tộc học Việt Nam",
                "image": "images/details/thumb/hanoi/3abe69a0852c8359d329c43a302c289daf040630.jpg",
                "desc": "Bảo tàng trưng bày các hiện vật văn hóa"
            },
            {
                "title": "Chùa Trấn Quốc",
                "image": "images/details/thumb/hanoi/5f1718c46ab2269a6eec80255dd359217566ff1e.jpg",
                "desc": "Chùa Phật giáo cổ nằm trên đảo yên bình"
            },
            {
                "title": "Nhà Thờ Lớn Hà Nội",
                "image": "images/details/thumb/hanoi/0148c4308873722ddb54b63d625a1f91f683d909.jpg",
                "desc": "Nhà thờ chính tòa, nhà thờ cơ Đốc giáo, kiến trúc và kiến trúc gothic"
            },
            {
                "title": "Đồng Xuân",
                "image": "images/details/thumb/hanoi/e7d4e0c9f61d2ddffc41640309f372d346554cf8.jpg",
                "desc": "Thị trường, mua sắm cá nhân và hồ"
            },
            {
                "title": "Bảo Tàng Hồ Chí Minh",
                "image": "images/details/thumb/hanoi/dca5747448dc900e0d7f979c34876de9a30badea.jpg",
                "desc": "Bảo tàng trưng bày về CT Hồ Chí Minh"
            },
            {
                "title": "Khu Phố Cổ Hà Nội",
                "image": "images/details/thumb/hanoi/3a27cf2b7eac17dee3ebcb1aee3349478c84b4f6.jpg",
                "desc": "Mua sắm cá nhân và hồ"
            },
            {
                "title": "Bảo tàng Mỹ thuật Việt Nam",
                "image": "images/details/thumb/hanoi/9f74f4bae6367421f32acbbaab3b07f0445e6b89.jpg",
                "desc": "Bảo tàng, nghệ thuật và bảo tàng nghệ thuật"
            },
            {
                "title": "Cầu Long Biên",
                "image": "images/details/thumb/hanoi/d2d4e936a940ff9f79d00cf3c4d27fbb95952306.jpg",
                "desc": "Gustave eiffel, chiến tranh việt nam và lịch sử"
            },
            {
                "title": "Văn phòng Chủ tịch nước",
                "image": "images/details/thumb/hanoi/59cbca06b1b00b72fdeb58d070417d32258790a4.jpg",
                "desc": "Cung điện, lăng mộ và kiến trúc"
            },
            {
                "title": "Bảo tàng Lịch sử Quân sự Việt Nam",
                "image": "images/details/thumb/hanoi/02a77a1e08e91ef9b7ff945a9e2f8172a7cf37cb.jpg",
                "desc": "Bảo tàng lịch sử quân đội quốc gia"
            },
            {
                "title": "Nhà Hát Múa Rối Thăng Long",
                "image": "images/details/thumb/hanoi/09a6e3d31d2aaf3a387be8c00d82fa4d25074c96.jpg",
                "desc": "Sân khấu và hồ"
            },
            {
                "title": "Tháp Rùa",
                "image": "images/details/thumb/hanoi/4d0a78988982c0defcc80cd095cc993133a3b6da.jpg",
                "desc": "Hồ, bộ rùa, họ rùa cạn, kiến trúc và lịch sử"
            },
            {
                "title": "Bảo tàng Lịch sử Quốc gia",
                "image": "images/details/thumb/hanoi/768d453abb9819d3e846ee2bd1802e89d3d24dfb.jpg",
                "desc": "Triển lãm thời tiền sử và hiện đại"
            }
        ],
        "plantrip": [
            {
                "desc": "Hồ Hoàn Kiếm còn được gọi là Hồ Gươm, là một hồ nước ngọt tự nhiên nằm ở trung tâm thành phố Hà Nội.",
                "title": "Hồ Hoàn Kiếm",
                "image": "images/plantrip/hanoi/ed444934b11241ea05f74196fa218eadc2822f2a.jpg",
                "timemove": "1"
            },
            {
                "desc": "Nhà thờ Lớn Hà Nội là nhà thờ chính tòa của Tổng giáo phận Hà Nội, nơi có ngai tòa của tổng Giám mục.",
                "title": "Nhà Thờ Lớn Hà Nội",
                "image": "images/plantrip/hanoi/84a14845dba044ce26904c4ddedc27ec6b71bd77.jpg",
                "timemove": "Ít hơn 5 phút bằng xe hơi"
            },
            {
                "desc": "Tàn tích của nhà tù nhiều tầng dành cho tù binh ch.tranh Việt Nam chỉ còn lại khu canh gác, nay là bảo tàng.",
                "title": "Di Tích Lịch Sử Nhà Tù Hỏa Lò",
                "image": "images/plantrip/hanoi/9262df1c16f9499aa5c82df412c54b6cbe20ecc9.jpg",
                "timemove": "10 phút bằng cách đi bộ"
            },
            {
                "desc": "Văn Miếu - Quốc Tử Giám là quần thể di tích đa dạng và phong phú hàng đầu của thành phố Hà Nội, nằm ở phía nam Kinh thành Thăng Long.",
                "title": "Văn Miếu - Quốc Tử Giám",
                "image": "images/plantrip/hanoi/4dcfdf5ac79dd9ccd48de9581a4a52c70401df0e.jpg",
                "timemove": "10 phút bằng xe hơi"
            },
            {
                "desc": "Ngôi chùa thờ Phật đã được xây lại, vốn được dựng lên vào năm 1049 với thiết kế hoa sen.",
                "title": "Chùa Một Cột",
                "image": "images/plantrip/hanoi/4a18d04b17b339ddc3e806fc53f55934d24d8a5e.jpg",
                "timemove": "10 phút bằng xe hơi"
            },
            {
                "desc": "Bảo tàng được xây dựng vào năm 1979, là nơi lưu giữ các kỷ vật và hình ảnh về Chủ tịch Hồ Chí Minh.",
                "title": "Bảo Tàng Hồ Chí Minh",
                "image": "images/plantrip/hanoi/0db30e120cc67476352affb2d9ebaad1f5c78fb0.jpg",
                "timemove": "Ít hơn 5 phút bằng cách đi bộ"
            },
            {
                "desc": "Thi hài của Chủ tịch Hồ Chí Minh, lãnh tụ nước Việt Nam, được đặt tại lăng mộ và khu di tích lịch sử này.",
                "title": "Lăng Chủ tịch Hồ Chí Minh",
                "image": "images/plantrip/hanoi/e130e5776f2667f2c7aabeda6a71d255fa789f96.jpg",
                "timemove": "Ít hơn 5 phút bằng cách đi bộ"
            },
            {
                "desc": "Đền Quán Thánh, tên chữ là Trấn Vũ Quán, có từ đời Lý Thái Tổ, thờ Huyền Thiên Trấn Vũ, là một trong bốn vị thần được lập đền thờ để trấn giữ bốn cửa ngõ thành Thăng Long khi xưa.",
                "title": "Đền Quán Thánh",
                "image": "images/plantrip/hanoi/cbf2983e66bb83c93a564e711332262a57047f9a.jpg",
                "timemove": "10 phút bằng cách đi bộ"
            },
            {
                "desc": "Chùa Phật giáo được xây trong thế kỷ 6 tọa lạc trên một hòn đảo nhỏ và thơ mộng có nhiều mộ tháp.",
                "title": "Chùa Trấn Quốc",
                "image": "images/plantrip/hanoi/49b562dc5cd260d7a51bcc334b97217c7daab7d4.jpg",
                "timemove": "10 phút bằng cách đi bộ"
            }
        ]
    },
    {
        "title": "Thành phố Hội An",
        "image": "images/main/50688b53797e730a0f697ce6268e60a1accfa9d8.jpg",
        "desc": "Thành phố ven biển được biết đến với Phố Cổ lịch sử, Bảo tàng Gốm sứ, bức tranh ẩm thực & các bãi biển gần đó.",
        "data": [
            {
                "title": "Chùa Cầu Hội An Quảng Nam",
                "image": "images/details/thumb/hanoi/0f14704cf2777e754feee1338bb180084ccb5f31.jpg",
                "desc": "Cây cầu tinh xảo từ những năm 1700"
            },
            {
                "title": "Bãi biển An Bàng",
                "image": "images/details/thumb/hanoi/dd9027cc53e387434a96266472f9e3ff54e13937.jpg",
                "desc": "Bãi biển cát trắng có cây xanh & mái che"
            },
            {
                "title": "Phung Hung Old House",
                "image": "images/details/thumb/hanoi/f2558187a733f1d1dc8c9192922752be3c81b370.jpg",
                "desc": "Căn nhà cổ xưa với nội thất cổ"
            },
            {
                "title": "Chợ Hội An",
                "image": "images/details/thumb/hanoi/89fd6b89d48dcbec965f91a597ccee859a58646c.jpg",
                "desc": "Mua sắm cá nhân"
            },
            {
                "title": "Phố Cổ Hội An",
                "image": "images/details/thumb/hanoi/438a62c3ff989fcff90a19c56055ea5d92253311.jpg",
                "desc": "Cảng thị bảo tồn & trung tâm thương mại"
            },
            {
                "title": "Cua Dai Beach",
                "image": "images/details/thumb/hanoi/ca543f74d5431a1c4b1dde61ecc9f00c04c6f4c6.jpg",
                "desc": "Bãi biển"
            },
            {
                "title": "Hoi An Night Market - Chợ Đêm Hội An",
                "image": "images/details/thumb/hanoi/fb7079661e2f86e991d505d5d7b9591e1c3a16f5.jpg",
                "desc": "Chợ đêm"
            },
            {
                "title": "Làng gốm Thanh Hà, Hội An",
                "image": "images/details/thumb/hanoi/0e2729e75758efbc244af8aabd242810bec78908.jpg",
                "desc": "Đồ gốm"
            },
            {
                "title": "Assembly Hall Of Fujian Chinese",
                "image": "images/details/thumb/hanoi/f7c83ac9addbb6b494e8e2ade8973ae1e562aac7.jpg",
                "desc": "Bảo tồn di sản"
            },
            {
                "title": "Công Ty Du Lịch Phát Huy",
                "image": "images/details/thumb/hanoi/a2d278a02b1f38495047423723a89e3af82fef33.jpg",
                "desc": "Rừng"
            },
            {
                "title": "Bảo tàng Văn hóa Sa Huỳnh",
                "image": "images/details/thumb/hanoi/2429d0b993e9511dd00021fcbfdbb2f7cbcd7979.jpg",
                "desc": "Bảo tàng"
            },
            {
                "title": "Tra Que Vegetable Village",
                "image": "images/details/thumb/hanoi/1794f187b4e264786b71d86ae59f26f72c4b2ac4.jpg",
                "desc": "Điểm thu hút khách du lịch"
            },
            {
                "title": "Trung tâm Quản lý Bảo tồn Di sản Văn hóa Hội An",
                "image": "images/details/thumb/hanoi/456f82d643f682458863a66050e1bde926cbd362.jpg",
                "desc": "Bảo tàng lịch sử địa phương"
            },
            {
                "title": "Đình",
                "image": "images/details/thumb/hanoi/999d0db875f0a339532cd3babd9b9096ce702ed3.jpg",
                "desc": "Đền, kiến trúc, văn học, lịch sử và nghệ thuật"
            },
            {
                "title": "Khu di tích lịch sử cách mạng Rừng Dừa Bảy Mẫu",
                "image": "images/details/thumb/hanoi/db20baae4971047598b9b8c92e8eb8088eec3d60.jpg",
                "desc": "Thắng cảnh"
            },
            {
                "title": "Quan Công Miếu",
                "image": "images/details/thumb/hanoi/99033604c682b7f43fd62fe99dc406708af9b38f.jpg",
                "desc": "Nơi thờ cúng"
            },
            {
                "title": "Hoi An Impression Theme Park",
                "image": "images/details/thumb/hanoi/dc38e51ca81c40d9a8aaf5c53d6b6f6d2ce825e1.jpg",
                "desc": "Công viên giải trí"
            },
            {
                "title": "Công viên Đất nung Thanh Hà",
                "image": "images/details/thumb/hanoi/a8860eb06d8acff48fe9bc0938c3091c9ef84ff1.jpg",
                "desc": "Địa điểm ngoài trời với đồ gốm cổ truyền"
            },
            {
                "title": "Làng gốm Thanh Hà, Hội An",
                "image": "images/details/thumb/hanoi/c97cc113ee3dea436fb0172f5144fd388a7bc90d.jpg",
                "desc": "Điểm thu hút khách du lịch"
            }
        ],
        "plantrip": [
            {
                "desc": "Đền",
                "title": "Quan Công Miếu",
                "image": "images/plantrip/hoian/4f6d35da36f9ff0e3c3410f652e4b68e04cca245.jpg",
                "timemove": "1"
            },
            {
                "desc": "Khu di tích nhộn nhịp có cảng thị được bảo tồn và trung tâm thương mại phản ánh sự ảnh hưởng từ nước ngoài.",
                "title": "Phố Cổ Hội An",
                "image": "images/plantrip/hoian/b769b92cce5b496fc19df448bccd7514f7695901.jpg",
                "timemove": "Ít hơn 5 phút bằng cách đi bộ"
            },
            {
                "desc": "Not yet description",
                "title": "Nhà Cổ Tấn Ký",
                "image": "images/plantrip/hoian/efb8b523ec45cdbea63823833887402f54fff9a5.jpg",
                "timemove": "Ít hơn 5 phút bằng cách đi bộ"
            },
            {
                "desc": "Not yet description",
                "title": "Nhà Cổ Tấn Ký",
                "image": "images/plantrip/hoian/efb8b523ec45cdbea63823833887402f54fff9a5.jpg",
                "timemove": "Ít hơn 5 phút bằng cách đi bộ"
            },
            {
                "desc": "Cây cầu gỗ từ thế kỷ 18 được chạm khắc tinh xảo & có lối đi dành cho người đi bộ.",
                "title": "Chùa Cầu Hội An Quảng Nam",
                "image": "images/plantrip/hoian/0f3f4015dff6c9ad258c200ef63ee29ac059b869.jpg",
                "timemove": "Ít hơn 5 phút bằng cách đi bộ"
            },
            {
                "desc": "Bãi biển yên tĩnh, rợp bóng cây với bãi cát trắng, mái che nắng, ghế dài và quán ăn.",
                "title": "Bãi biển An Bàng",
                "image": "images/plantrip/hoian/9239b5b0fb705e0df8cc57c89ab71ce6026250c2.jpg",
                "timemove": "15 phút bằng xe hơi"
            }
        ]
    },
    {
        "title": "Thành phố Huế",
        "image": "images/main/0fd79109c5b5fa3de55aea34b340d52311d58f56.jpg",
        "desc": "Cố đô của triều đình nhà Nguyễn, nơi có Kinh thành được xây dựng từ thế kỷ 19, Hoàng Thành và chùa Thiên Mụ.",
        "data": [
            {
                "title": "Kinh thành Huế",
                "image": "images/details/thumb/hue/1959e42daa1d94094d0820f957daaf7f1d5999b3.jpg",
                "desc": "Hoàng cung trong tử cấm thành"
            },
            {
                "title": "Chùa Thiên Mụ",
                "image": "images/details/thumb/hue/48536924afba49b4057cf3398523fb7b1ec9ee38.jpg",
                "desc": "Ngôi chùa 7 tầng lâu đời"
            },
            {
                "title": "Lăng Khải Định",
                "image": "images/details/thumb/hue/e9a3f8c6fb12eae73d55259ae87aa17ba3eb6f6b.jpg",
                "desc": "Lăng mộ hoành tráng của một vị hoàng đế"
            },
            {
                "title": "Lăng Tự Đức",
                "image": "images/details/thumb/hue/9bb0109b418859750dba5e042f7241273464cfe0.jpg",
                "desc": "Quần thể lăng mộ với cảnh quan đẹp mắt"
            },
            {
                "title": "Chợ Đông Ba",
                "image": "images/details/thumb/hue/ff448f3aad90bda26490f1d3a9d5f06ade851514.jpg",
                "desc": "Thị trường và mua sắm cá nhân"
            },
            {
                "title": "Cầu Trường Tiền",
                "image": "images/details/thumb/hue/0f3eb25c8135213e7f18861d29ad92809e2c0866.jpg",
                "desc": "Gustave eiffel, sông và kiến trúc"
            },
            {
                "title": "Bảo tàng Cổ vật Cung đình Huế",
                "image": "images/details/thumb/hue/2e336b1c6dc01ca4c439709bc0aeb29cf7371211.jpg",
                "desc": "Bảo tàng, nghệ thuật và kiến trúc"
            },
            {
                "title": "Thế Tổ miếu",
                "image": "images/details/thumb/hue/3ec29d1d1c30710e39775d7292a0158868c0141a.jpg",
                "desc": "Đền thờ các hoàng đế xây từ khoảng 1820"
            },
            {
                "title": "Hồ Thủy Tiên",
                "image": "images/details/thumb/hue/15b53ee1bcea9b6f4e0df9d6f462e505ed46f55e.jpg",
                "desc": "Công viên nước, hồ và công viên"
            },
            {
                "title": "Cầu Ngói Thanh Toàn",
                "image": "images/details/thumb/hue/9a605a2dd5edc4694e709c68803939d1f44a2d62.jpg",
                "desc": "Kiến trúc"
            },
            {
                "title": "Ngọ Môn",
                "image": "images/details/thumb/hue/c474685f2e50e3540e99cfcfa3f6831407e0bc9b.jpg",
                "desc": "Cổng lớn thế kỷ 19 dẫn vào Hoàng thành"
            },
            {
                "title": "Điện Thái Hòa",
                "image": "images/details/thumb/hue/9817d72bd7210da0fe0816e9460765d5863d1e33.jpg",
                "desc": "Cung điện thế kỷ 19 và dấu ấn lịch sử"
            },
            {
                "title": "Đại Nội",
                "image": "images/details/thumb/hue/9166b07976ef673622c298e41e45ee790daece1a.jpg",
                "desc": "Quần thể cung điện tráng lệ từ thế kỷ 19"
            },
            {
                "title": "Chùa Từ Hiếu",
                "image": "images/details/thumb/hue/ba0700a360b9df095186e6cf0ca67e5db0f98f65.jpg",
                "desc": "Đền, tu viện, lịch sử, phật giáo và kiến trúc"
            },
            {
                "title": "Đồi Vọng Cảnh",
                "image": "images/details/thumb/hue/8a696cfd155e7e3237736be75d1c2cb845b68610.jpg",
                "desc": "Núi và tự nhiên"
            },
            {
                "title": "núi Ngự Bình",
                "image": "images/details/thumb/hue/fb9a1ba025e406f33dc24dc891eda0e114e35d8b.jpg",
                "desc": "Núi và sông"
            },
            {
                "title": "Lăng Gia Long",
                "image": "images/details/thumb/hue/b136028353bf835d3b7f5fc23cdb5fa9dab4d0ba.jpg",
                "desc": "Mộ và lăng mộ"
            },
            {
                "title": "Hồ Thuỷ Tiên",
                "image": "images/details/thumb/hue/2f4e6d04112d1a42c1f38466c973cd2e4929c387.jpg",
                "desc": "Công viên nước"
            },
            {
                "title": "Cung An Định",
                "image": "images/details/thumb/hue/7dccdc046f7f4a9dcfca56609d579fc9a1bb10af.jpg",
                "desc": "Hoàng cung trước đây và hiện là bảo tàng"
            },
            {
                "title": "Điện Hòn Chén",
                "image": "images/details/thumb/hue/6f2d8cc0bceafe145e0c3972e3eb5bc21e01fa31.jpg",
                "desc": "Điện thờ"
            }
        ],
        "plantrip": [
            {
                "desc": "Lăng mộ của một hoàng đế Việt Nam với kiến ​​trúc phức tạp và các chi tiết trang trí công phu.",
                "title": "Lăng Khải Định",
                "image": "images/plantrip/hue/c7185f77ea140551a883e7d2b92e7b4230c894ce.jpg",
                "timemove": "1"
            },
            {
                "desc": "Quần thể lăng mộ và đền thờ tôn vinh một vị vua thế kỷ 19 với khung cảnh nên thơ và hồ sen.",
                "title": "Lăng Tự Đức",
                "image": "images/plantrip/hue/1f49092418431137310e490ba549334779a95e55.jpg",
                "timemove": "15 phút bằng xe hơi"
            },
            {
                "desc": "Cung điện truyền thống từ thế kỷ 19 tổ chức tham quan và triển lãm về hoàng thành và triều Nguyễn.",
                "title": "Điện Thái Hòa",
                "image": "images/plantrip/hue/8a04e994e7851c6f042358b935405ef04a58eb98.jpg",
                "timemove": "15 phút bằng xe hơi"
            },
            {
                "desc": "Cổng chính dẫn vào Hoàng thành được xây năm 1833 có lầu nằm bên trên được sử dụng để tổ chức các nghi lễ.",
                "title": "Ngọ Môn",
                "image": "images/plantrip/hue/db02c0ed715104e7e9024ce2b6a363b3a5b7bb0e.jpg",
                "timemove": "Ít hơn 5 phút bằng cách đi bộ"
            },
            {
                "desc": "Hoàng cung cổ kính tọa lạc trong quần thể rộng lớn có tường bao quanh của tử cấm thành.",
                "title": "Kinh thành Huế",
                "image": "images/plantrip/hue/b3b64303d450fe79a23c9fc804ad5e702a757e1e.jpg",
                "timemove": "5"
            },
            {
                "desc": "Ngôi chùa 7 tầng nổi tiếng này là nơi cư trú của các nhà sư, có cảnh quan đẹp, được xây dựng vào năm 1601.",
                "title": "Chùa Thiên Mụ",
                "image": "images/plantrip/hue/fb0d9a1f17f213338e7de16569b47f7cb313f8ab.jpg",
                "timemove": "10 phút bằng xe hơi"
            },
            {
                "desc": "Cầu Trường Tiền còn được gọi là Cầu Tràng Tiền, là chiếc cầu dài 402,60 m, gồm 6 nhịp dầm thép hình vành lược, khẩu độ mỗi nhịp 67 m.",
                "title": "Cầu Trường Tiền",
                "image": "images/plantrip/hue/5d306e0c9930f79cbbb57885ae76d71185c43e47.jpg",
                "timemove": "10 phút bằng xe hơi"
            },
            {
                "desc": "Núi Ngự Bình, gọi ngắn gọn là núi Ngự, trước có tên là Hòn Mô hay Núi Bằng; là một hòn núi đất cao 103 m ở bờ phải sông Hương, cách trung tâm thành phố Huế 4 km về phía Nam.",
                "title": "núi Ngự Bình",
                "image": "images/plantrip/hue/3b71b1c286f82890261f6ac535e624df494171bc.jpg",
                "timemove": "15 phút bằng xe hơi"
            }
        ]
    },
    {
        "title": "Đà Nẵng",
        "image": "images/main/75ce423f2f1326af3e35bad0557c725e4cc14477.jpg",
        "desc": "Thành phố cảng với bảo tàng điêu khắc Hindu, khu nghỉ dưỡng trên các bãi biển đầy cát, chùa và Ngũ Hành Sơn.",
        "data": [
            {
                "title": "Núi Ngũ Hành Sơn Đà Nẵng",
                "image": "images/details/thumb/danang/79b338f388be2caff01c94bbb82c0748c9e8acb9.jpg",
                "desc": "Núi hùng vĩ có hang động & chùa chiền"
            },
            {
                "title": "Khu đền tháp Mỹ Sơn",
                "image": "images/details/thumb/danang/cfc2c893d6bcb5cf16f360d5631d1d7c41c61be5.jpg",
                "desc": "Đền, tàn tích, di chỉ khảo cổ, thánh địa và chiến tranh việt nam"
            },
            {
                "title": "Bảo tàng Điêu khắc Chăm Đà Nẵng",
                "image": "images/details/thumb/danang/ddf4e576e6a71ee636881ffe6210e6c7c407eefd.jpg",
                "desc": "Bảo tàng nhỏ có các tác phẩm điêu khắc"
            },
            {
                "title": "Cầu Rồng",
                "image": "images/details/thumb/danang/dabb60dac2b755a5511da5f5597b1cb2ae1aba64.jpg",
                "desc": "Sông"
            },
            {
                "title": "Cầu Sông Hàn",
                "image": "images/details/thumb/danang/a27af64ebd450d8497192cf487c519045a29f50a.jpg",
                "desc": "Cây cầu quay nổi tiếng bắc qua sông Hàn"
            },
            {
                "title": "Chùa Linh Ứng",
                "image": "images/details/thumb/danang/c9e34ea0bcff7e8a8cd34a6f8ba04dbed5be0754.jpg",
                "desc": "Ngôi chùa trên đồi với tầm nhìn mãn nhãn"
            },
            {
                "title": "Bãi biển Mỹ Khê",
                "image": "images/details/thumb/danang/884d65e7001a2c134a021470c10381a71c815bfd.jpg",
                "desc": "Bãi biển"
            },
            {
                "title": "Sun World Danang Wonders",
                "image": "images/details/thumb/danang/4378c672c2368c94ae74f2ae361b58db457510c4.jpg",
                "desc": "CV có tàu lượn & khu vực theo chủ đề"
            },
            {
                "title": "Chợ Hàn",
                "image": "images/details/thumb/danang/faeb4d3bd5ff81f6462641e7bbc579822069c490.jpg",
                "desc": "Chợ bán đồ ăn và quần áo nhộn nhịp"
            },
            {
                "title": "Giáo xứ Chính tòa Đà Nẵng",
                "image": "images/details/thumb/danang/31b8295511d52b070ed993bcfe84646bac8eb1cd.jpg",
                "desc": "Nhà thờ Công giáo màu hồng trong đô thị"
            },
            {
                "title": "Bãi biển Mỹ Khê",
                "image": "images/details/thumb/danang/c5765d5cc478187d50c855444cc2bdc5ede810e6.jpg",
                "desc": "Bãi biển, parasailing, hải sản và khu nghỉ dưỡng ven biển"
            },
            {
                "title": "Vòng quay Mặt Trời",
                "image": "images/details/thumb/danang/6df5b5fef658725daf7222819150ef5d6bd7bcd8.jpg",
                "desc": "Vòng đu quay"
            },
            {
                "title": "Cầu Thuận Phước",
                "image": "images/details/thumb/danang/8366e581dd005800e2f8e0015a5a5d39c04039d7.jpg",
                "desc": "Cầu"
            },
            {
                "title": "Bãi biển Non Nước",
                "image": "images/details/thumb/danang/284b8b79cdd293302506502e2958e7828c46a795.jpg",
                "desc": "Bãi biển"
            },
            {
                "title": "Chợ Cồn",
                "image": "images/details/thumb/danang/5796f37ded262b2a6394450a9fa911073eaa72cb.jpg",
                "desc": "Mua sắm cá nhân và thị trường"
            },
            {
                "title": "Bán đảo Sơn Trà",
                "image": "images/details/thumb/danang/1c1127211dee2b6061e431eb1537446f1fddd417.jpg",
                "desc": "Du lịch bụi"
            },
            {
                "title": "Bảo tàng Đà Nẵng",
                "image": "images/details/thumb/danang/ec0ee1c721a7efbb15d06775f7a09c6d139754ac.jpg",
                "desc": "Bảo tàng"
            },
            {
                "title": "Chùa Pháp Lâm",
                "image": "images/details/thumb/danang/231e6dbf91712d08a1018708e5c4454fb9eff364.jpg",
                "desc": "Chùa phật giáo"
            },
            {
                "title": "Cầu Trần Thị Lý",
                "image": "images/details/thumb/danang/797ac8b311286a04da89dd554349be60efeac446.jpg",
                "desc": "Cầu"
            },
            {
                "title": "Kinh thành Huế",
                "image": "images/details/thumb/danang/1959e42daa1d94094d0820f957daaf7f1d5999b3.jpg",
                "desc": "Hoàng cung trong tử cấm thành"
            }
        ],
        "plantrip": [
            {
                "desc": "Thắng cảnh Ngũ Hành Sơn có nhiều hang động và chùa chiền được xây cất công phu với cảnh sắc hữu tình.",
                "title": "Núi Ngũ Hành Sơn Đà Nẵng",
                "image": "images/plantrip/danang/85a4b37b480434d29f4913446c18148322c295ed.jpg",
                "timemove": "1"
            },
            {
                "desc": "Cầu Rồng là cây cầu thứ 6 và là cây cầu mới nhất bắc qua sông Hàn.",
                "title": "Cầu Rồng",
                "image": "images/plantrip/danang/49634d948d10abf313e6662e0d981daae5e465ec.jpg",
                "timemove": "20 phút bằng xe hơi"
            },
            {
                "desc": "Bảo tàng nhỏ gọn trưng bày một bộ sưu tập các tác phẩm điêu khắc và văn hóa như trang phục và dụng cụ.",
                "title": "Bảo tàng Điêu khắc Chăm Đà Nẵng",
                "image": "images/plantrip/danang/f0022196d9925483223752ad5ec8ce96d274a6f3.jpg",
                "timemove": "Ít hơn 5 phút bằng cách đi bộ"
            },
            {
                "desc": "Hoàng cung cổ kính tọa lạc trong quần thể rộng lớn có tường bao quanh của tử cấm thành.",
                "title": "Kinh thành Huế",
                "image": "images/plantrip/danang/b3b64303d450fe79a23c9fc804ad5e702a757e1e.jpg",
                "timemove": "2 giờ bằng xe hơi"
            }
        ]
    },
    {
        "title": "Thành phố Nha Trang",
        "image": "images/main/6b8007d30e45eef923317809cbee735b382be82c.jpg",
        "desc": "Thành phố nghỉ mát ở Việt Nam có các bãi biển, đảo, khu bảo tồn biển & địa điểm tôn giáo tháp Po Nagar.",
        "data": [
            {
                "title": "Tháp Bà PoNagar",
                "image": "images/details/thumb/nhatrang/1685ff10ab91ee5361804c4eb8dab01198fabc3f.jpg",
                "desc": "Ngôi đền trên triền núi với đồ trưng bày"
            },
            {
                "title": "Chùa Long Sơn",
                "image": "images/details/thumb/nhatrang/c07dda0fc79b43793b51134d3d9cc734e48d913c.jpg",
                "desc": "Ngôi chùa với tượng Phật trên đỉnh đồi"
            },
            {
                "title": "Tuyến cáp treo Vinpearl Land",
                "image": "images/details/thumb/nhatrang/ddbb77d17617fc87d220aec414a236674648d92d.jpg",
                "desc": "Công viên giải trí và công viên nước"
            },
            {
                "title": "Nha Trang - Vinpearl Land",
                "image": "images/details/thumb/nhatrang/f5dec5c7cefc260e93d8fd4ebcb50f239e214715.jpg",
                "desc": "Công viên giải trí, công viên nước và công viên"
            },
            {
                "title": "Ba Ho Waterfalls Cliff Jumping",
                "image": "images/details/thumb/nhatrang/26a1dacffe0ae8993dce5086c7a087c5ea3706bd.jpg",
                "desc": "Vách đá trong rừng nhiệt đới xanh mướt"
            },
            {
                "title": "Hòn Mun",
                "image": "images/details/thumb/nhatrang/2d255ae269b1e5303a72dc3c0377676305e0ac55.jpg",
                "desc": "Lặn có bình khí, lặn ống thở và rạn san hô"
            },
            {
                "title": "Vũng Ninh Vân",
                "image": "images/details/thumb/nhatrang/f23dec2c86d732f98abf4da202af4ac6b5658a1e.jpg",
                "desc": "Tuần trăng mật và lãng mạn"
            },
            {
                "title": "Hòn Tằm",
                "image": "images/details/thumb/nhatrang/3415571aff5f361e1216b88c89ecea47c1d59608.jpg",
                "desc": "Đảo"
            },
            {
                "title": "Nhà thờ Chánh Tòa Kitô Vua",
                "image": "images/details/thumb/nhatrang/c9de091cb8411bb8a3b8d3d6b2c09e5a014b1cdc.jpg",
                "desc": "Nhà thờ phong cách Gô-tích từ đầu TK 20"
            },
            {
                "title": "Chợ Đầm",
                "image": "images/details/thumb/nhatrang/d66f6b5f87df5c365d8c7a7f26a9782414bde4b2.jpg",
                "desc": "Khu chợ bày bán thực phẩm & đồ lưu niệm"
            },
            {
                "title": "Vinpearl Waterpark",
                "image": "images/details/thumb/nhatrang/04661750c10a12fe897e53320225f6f9a8548b22.jpg",
                "desc": "Công viên giải trí, công viên nước và công viên"
            },
            {
                "title": "Hòn Chồng",
                "image": "images/details/thumb/nhatrang/5a72af86fd92dd4e742aa18c11303b196d7a4b90.jpg",
                "desc": "Tuyến đường"
            },
            {
                "title": "Thủy cung Trí Nguyên",
                "image": "images/details/thumb/nhatrang/39ffa5db63f6ffcd7d40b7e522ec730ecb3a1f0e.jpg",
                "desc": "Bể thủy sinh"
            },
            {
                "title": "hòn Lao",
                "image": "images/details/thumb/nhatrang/9f5429fe909b76234692c13d8f693079aa01bbcf.jpg",
                "desc": "Đảo"
            },
            {
                "title": "Hòn Chồng Promontory",
                "image": "images/details/thumb/nhatrang/0a0a67c59000a27902945f75458664d268a8d418.jpg",
                "desc": "Thắng cảnh"
            },
            {
                "title": "Trần Phú",
                "image": "images/details/thumb/nhatrang/bd50a51828ce6b9d71d44227d32fcdf6aaefce59.jpg",
                "desc": "Bãi biển"
            },
            {
                "title": "Tháp Trầm Hương Nha Trang",
                "image": "images/details/thumb/nhatrang/3f7bb420f604f3bd132f34edfcf234304d5f482b.jpg",
                "desc": "Điểm thu hút khách du lịch"
            },
            {
                "title": "Viện Hải Dương Học (Bảo tàng Hải Dương Học)",
                "image": "images/details/thumb/nhatrang/91ef3a09f70528774bb719e8e9b40b13f1923255.jpg",
                "desc": "Bảo tàng"
            },
            {
                "title": "Night Market",
                "image": "images/details/thumb/nhatrang/c8178e02ab252142561f608893bca4fd819a5ff4.jpg",
                "desc": "Mua sắm cá nhân"
            },
            {
                "title": "Khu du lịch Đảo Khỉ",
                "image": "images/details/thumb/nhatrang/65626e60add97fcc695112ebea086f19966ec6b8.jpg",
                "desc": "Điểm thu hút khách du lịch"
            }
        ],
        "plantrip": [
            {
                "desc": "Ngôi chùa thờ Phật hiện đại với một tượng Phật lớn trên đỉnh đồi và tầm nhìn toàn cảnh thành phố.",
                "title": "Chùa Long Sơn",
                "image": "images/plantrip/nhatrang/3ee30acec33527868bde19a13bf00f27929ab260.jpg",
                "timemove": "1"
            },
            {
                "desc": "Nhà thờ phong cách Gô-tích có niên đại từ đầu thế kỷ 20, với tháp chuông, trần nhà mái vòm và kính màu.",
                "title": "Nhà thờ Chánh Tòa Kitô Vua",
                "image": "images/plantrip/nhatrang/fda52ebdfaa627ee0e3ce565957bff4ec09f88de.jpg",
                "timemove": "Ít hơn 5 phút bằng xe hơi"
            },
            {
                "desc": "Là khu chợ chính của thành phố, tòa nhà 3 tầng này có rất nhiều quầy bán thực phẩm và đồ lưu niệm.",
                "title": "Chợ Đầm",
                "image": "images/plantrip/nhatrang/8d1ceef51c09a4c944c092c72056f4844b5b2c4b.jpg",
                "timemove": "10 phút bằng xe hơi"
            },
            {
                "desc": "Nhà cũ của vị bác sĩ phát hiện ra vi khuẩn dịch hạch và thành lập nên Viện Pasteur.",
                "title": "Bảo Tàng Alexandre Yersin",
                "image": "images/plantrip/nhatrang/e762e1e176ca7190ed5829810c18c662ef590419.jpg",
                "timemove": "10 phút bằng cách đi bộ"
            },
            {
                "desc": "Ngôi đền 3 tầng thanh bình nằm trên đỉnh núi với 2 tháp nhà thờ là nơi trưng bày hiện vật & hình ảnh lịch sử.",
                "title": "Tháp Bà PoNagar",
                "image": "images/plantrip/nhatrang/945a5a30eaae7d81fd4bc2939513e923b23668c5.jpg",
                "timemove": "10 phút bằng xe hơi"
            }
        ]
    },
    {
        "title": "tt. Sa Pa",
        "image": "images/main/20cdc3eeb5d629a55cf67aea3d1d0f164494f3b3.jpg",
        "desc": "Thị trấn miền núi là căn cứ khởi hành chuyến đi bộ dài ngày, tham quan thác nước và leo đỉnh Phang Xi Pang.",
        "data": [
            {
                "title": "Thung Lũng Mường Hoa",
                "image": "images/details/thumb/sapa/2b849b1d765e114d8bef2bef2c8ee8b5dca97647.jpg",
                "desc": "Lặn lội giữa đồng lúa & làng mạc"
            },
            {
                "title": "Cáp treo Fansipan Legend",
                "image": "images/details/thumb/sapa/84ac316a320b891404936285ed88cd574afa052e.jpg",
                "desc": "Tuyến cáp treo lên đỉnh Fansipan"
            },
            {
                "title": "Hàm Rồng",
                "image": "images/details/thumb/sapa/40e8eea5fcd1c638bc25cb603395f7cbc26a2f4c.jpg",
                "desc": "Núi"
            },
            {
                "title": "Ham Rong Mountain, Sapa",
                "image": "images/details/thumb/sapa/f6d4f471fce85a8570d855f5a82fbf492707f582.jpg",
                "desc": "Núi"
            },
            {
                "title": "Chợ Sapa",
                "image": "images/details/thumb/sapa/89aef55a68144d9dc4d596dea3bf86a219329405.jpg",
                "desc": "Thị trường và mua sắm cá nhân"
            },
            {
                "title": "Chợ Tình Sapa",
                "image": "images/details/thumb/sapa/31f2d7c7c26a9d28f8b265093a20186a6c9f9057.jpg",
                "desc": "Chợ"
            },
            {
                "title": "Topas Ecolodge",
                "image": "images/details/thumb/sapa/7d6b9b18b65b247d808d519350e6deed0ffa2611.jpg",
                "desc": "Điểm quan tâm"
            },
            {
                "title": "Hồ Sa Pa",
                "image": "images/details/thumb/sapa/b5dbb581512a6b8a54d5c6ca33aecf951f73851a.jpg",
                "desc": "Hồ"
            },
            {
                "title": "Nhà Thờ Đá Sapa",
                "image": "images/details/thumb/sapa/8a09297d821d81e73da4059fa80869e85f0f3477.jpg",
                "desc": "Nhà thờ Công giáo có tháp chuông bằng đá"
            },
            {
                "title": "cổng trời",
                "image": "images/details/thumb/sapa/bb5084c7ddaf490d82cf5553d40fc4a2284003a3.jpg",
                "desc": "Mốc lịch sử"
            },
            {
                "title": "Đền Mẫu Thượng Sa Pa",
                "image": "images/details/thumb/sapa/39ec44ca647c40ef623658faf04838b18781ccfe.jpg",
                "desc": "Đền"
            },
            {
                "title": "Núi Hàm Rồng-Sapa",
                "image": "images/details/thumb/sapa/db31c7263b649141376bfc7a562196a25be0c337.jpg",
                "desc": "Khu bảo tồn thiên nhiên"
            },
            {
                "title": "Vườn hoa Hàm Rồng",
                "image": "images/details/thumb/sapa/ee4772ac7f1841454fe45bedecdd5f220512b934.jpg",
                "desc": "Hoa lá, cây cảnh và toàn cảnh Sa Pa"
            },
            {
                "title": "Indigo Cat",
                "image": "images/details/thumb/sapa/c4e79c43e1fa842ba7f92b1356b6872a9414e3f9.jpg",
                "desc": "Thủ công mỹ nghệ"
            },
            {
                "title": "Sapa Museum",
                "image": "images/details/thumb/sapa/8bef00814596227107b3bd7a628f12e113e8942a.jpg",
                "desc": "Bảo tàng văn hóa có bán đồ thủ công"
            },
            {
                "title": "Sapa Tourist Information Center",
                "image": "images/details/thumb/sapa/16ad2ae3769e118539c0d23419eb08f54b108b35.jpg",
                "desc": "Trung tâm thông tin cho khách"
            },
            {
                "title": "Thung Lũng Hoa Hồng",
                "image": "images/details/thumb/sapa/751bc2b8bcc8998fe7ac69c4702b9c9e2f8f1671.jpg",
                "desc": "Điểm quan tâm"
            },
            {
                "title": "Ga Cáp treo Fansipan Legend",
                "image": "images/details/thumb/sapa/0434ed1e4034a7ca0e62b3f30cc50155fc118a9d.jpg",
                "desc": "Điểm quan tâm"
            },
            {
                "title": "Mountain Bar & Pub",
                "image": "images/details/thumb/sapa/d93e3857c23d4df5b3da73ad978a812e7bad0478.jpg",
                "desc": "DJ"
            },
            {
                "title": "Đền Mẫu Sơn",
                "image": "images/details/thumb/sapa/813af2a4d32281423d01967ad6f9735380128dc9.jpg",
                "desc": "Nơi thờ cúng"
            }
        ],
        "plantrip": [
            {
                "desc": "Thung lũng xinh đẹp nổi tiếng với những lối đi leo bộ xuyên qua những thửa ruộng bậc thang & làng cổ.",
                "title": "Thung Lũng Mường Hoa",
                "image": "images/plantrip/sapa/683a9e3d2a29b32bf3675e4b1a83d619f30acabf.jpg",
                "timemove": "1"
            },
            {
                "desc": "Vườn hoa trên đỉnh núi với các thảm hoa khoe sắc, cây cảnh tạo hình nghệ thuật và khu ngắm toàn cảnh Sa Pa.",
                "title": "Vườn hoa Hàm Rồng",
                "image": "images/plantrip/sapa/2dd412c3314723565759ed0c2a702c180aa176c5.jpg",
                "timemove": "10 phút bằng xe hơi"
            },
            {
                "desc": "Được người Pháp xây dựng năm 1895, nhà thờ bằng đá này có tháp chuông và kiến trúc Gothic La Mã.",
                "title": "Nhà Thờ Đá Sapa",
                "image": "images/plantrip/sapa/f110f6ef66c4db9e4e27a10444b004502c4bf7e4.jpg",
                "timemove": "Ít hơn 5 phút bằng cách đi bộ"
            },
            {
                "desc": "Bảo tàng với kiến trúc truyền thống có cửa hàng mỹ nghệ & lưu niệm bán đồ thủ công được làm tại địa phương.",
                "title": "Sapa Museum",
                "image": "images/plantrip/sapa/28179a2420241be3f4f013767fe237fa954836ba.jpg",
                "timemove": "Ít hơn 5 phút bằng cách đi bộ"
            },
            {
                "desc": "Tuyến cáp treo nối Sapa và đỉnh Fansipan, có đền chùa, nhà hàng và cửa hàng ở cả ga đến và ga đi.",
                "title": "Cáp treo Fansipan Legend",
                "image": "images/plantrip/sapa/561ab0ef0b1f11a7fef2d38ca48888d6bb60cfe1.jpg",
                "timemove": "Ít hơn 5 phút bằng cách đi bộ"
            },
            {
                "desc": "Thác nước lớn nên thơ, có thể thấy từ đường lớn, là điểm đến ưa thích của người đi xe đạp và đi bộ đường dài.",
                "title": "Khu du lịch Thác Bạc",
                "image": "images/plantrip/sapa/69a444dedffe1a72f9809fc2d23b37137bbf69c6.jpg",
                "timemove": "35 phút bằng xe hơi"
            },
            {
                "desc": "Đèo Ô Quý Hồ, đèo Ô Quy Hồ hay đèo Hoàng Liên Sơn là đèo trên quốc lộ 4D ở vùng giáp ranh hai tỉnh Lào Cai và Lai Châu, Việt Nam.",
                "title": "Đèo Ô Quy Hồ",
                "image": "images/plantrip/sapa/f0f66763487f3b6c049978d8dbcc37ba8a198e45.jpg",
                "timemove": "10 phút bằng xe hơi"
            },
            {
                "desc": "Núi",
                "title": "Đỉnh Phan Xi Păng",
                "image": "images/plantrip/sapa/bb76638053018ab328ecff70e8741f72741f9a62.jpg",
                "timemove": "10 phút bằng xe hơi"
            }
        ]
    },
    {
        "title": "Thành phố Đà Lạt",
        "image": "images/main/7f592e8e03cd0401e7ebf9d778f34e1b1801d595.jpg",
        "desc": "Thị trấn nghỉ mát thuộc địa Pháp với các địa điểm thuộc địa như Nhà thờ Đà Lạt, hồ & thác Pongour.",
        "data": [
            {
                "title": "Biệt thự Hằng Nga",
                "image": "images/details/thumb/dalat/71ddec3de246f8a3783cdd3c4f05666d004e657a.jpg",
                "desc": "Nhà khách có lối kiến trúc kỳ dị"
            },
            {
                "title": "Hồ Tuyền Lâm",
                "image": "images/details/thumb/dalat/8dbd6778954e7efd602c014fe67c46a9416047ca.jpg",
                "desc": "Hồ và chèo thuyền kayak"
            },
            {
                "title": "Khu Du Lịch Thác Datanla",
                "image": "images/details/thumb/dalat/ab2b20348644ae02660180c48e4770be5b1c21a4.jpg",
                "desc": "Thác nước nhỏ có khu vui chơi và đi bộ"
            },
            {
                "title": "Chùa Linh Phước",
                "image": "images/details/thumb/dalat/cacb047179870633b54a21c4ba2028cdfcfd3c5f.jpg",
                "desc": "Ngôi chùa khảm thủy tinh và gốm sứ"
            },
            {
                "title": "Chợ Đà Lạt",
                "image": "images/details/thumb/dalat/130fc82c00d7d92931501bcf0302ccf8798785bf.jpg",
                "desc": "Mua sắm cá nhân và thị trường"
            },
            {
                "title": "Khu Du Lịch Thác Prenn",
                "image": "images/details/thumb/dalat/a0c9f3136ab4436d0ff0c40117838cac04365d5d.jpg",
                "desc": "Công viên có thác nước và trò cưỡi voi"
            },
            {
                "title": "Vườn Hoa Đà Lạt",
                "image": "images/details/thumb/dalat/d271bc22bc52e1134231553f9d2cb82c2a7ff63e.jpg",
                "desc": "Vườn hoa phong cảnh rộng lớn"
            },
            {
                "title": "Đường Hầm Điêu Khắc",
                "image": "images/details/thumb/dalat/8d6802a948be0f75cadd81a541edd79e9491fe33.jpg",
                "desc": "Công viên với tác phẩm điêu khắc đất sét"
            },
            {
                "title": "Dinh III Bảo Đại",
                "image": "images/details/thumb/dalat/64d265c8bcc792897a67dd580d4d9ca1bd75fe15.jpg",
                "desc": "Cung điện, kiến trúc và vườn"
            },
            {
                "title": "Chợ đêm Đà Lạt",
                "image": "images/details/thumb/dalat/ca8a9f6d9763f481309f648469c1624079cfe0e4.jpg",
                "desc": "Mua sắm cá nhân"
            },
            {
                "title": "Nhà Thờ Chánh Tòa Giáo Phận Đà Lạt | Nhà Thờ Con Gà",
                "image": "images/details/thumb/dalat/0eee874c8cb4cabfb21601390554038dab2467d6.jpg",
                "desc": "Nhà thờ chính tòa, kiến trúc và lịch sử"
            },
            {
                "title": "Khu Du Lịch Thác Voi - Đà Lạt",
                "image": "images/details/thumb/dalat/66a9e379b161b06a6c8f8d5e33e04ef7fb041bff.jpg",
                "desc": "Thác nước ấn tượng giữa không gian xanh"
            },
            {
                "title": "Hồ Xuân Hương",
                "image": "images/details/thumb/dalat/f0e21b656df9ef7a59dd7200390aefc2d6bf27ae.jpg",
                "desc": "Hồ"
            },
            {
                "title": "Nhà Thờ Domaine De Marie",
                "image": "images/details/thumb/dalat/b98795e7c43966c1b7234d8d198f682693a07134.jpg",
                "desc": "Nhà thờ cơ Đốc giáo, nữ tu viện, kiến trúc, tu viện và lịch sử"
            },
            {
                "title": "Quảng trường Lâm Viên",
                "image": "images/details/thumb/dalat/125a99de221d5b4e08b5075b08fa9fe5f4700614.jpg",
                "desc": "Vườn"
            },
            {
                "title": "Xuan Huong Lake",
                "image": "images/details/thumb/dalat/bff49c012a034b791761078bc6d2946cf4a48b9f.jpg",
                "desc": "Hồ"
            },
            {
                "title": "Chùa Linh Sơn",
                "image": "images/details/thumb/dalat/f9ae279f1f88ddea0686a531e74a60bcf9cec9bf.jpg",
                "desc": "Chùa thanh tịnh & vườn hoa trên đỉnh núi"
            },
            {
                "title": "Hồ Than Thở",
                "image": "images/details/thumb/dalat/5b2eed67d1b965bbd79d43277b7155c2c4add774.jpg",
                "desc": "Hồ"
            },
            {
                "title": "Thung Lũng Vàng",
                "image": "images/details/thumb/dalat/3ec3745a18e4796392721c2e470c4f6f35447612.jpg",
                "desc": "Du lịch sinh thái tại CV cảnh quan"
            },
            {
                "title": "Đồi Mộng Mơ",
                "image": "images/details/thumb/dalat/dca3c31631ce6a6355e24ecad40fd1a0ebda3ac3.jpg",
                "desc": "Điểm quan tâm"
            }
        ],
        "plantrip": [
            {
                "desc": "Khu trưng bày nghệ thuật với các tác phẩm điêu khắc bằng đất sét khổng lồ đủ thể loại từ thằn lằn đến tàu hỏa.",
                "title": "Đường Hầm Điêu Khắc",
                "image": "images/plantrip/dalat/079ddfe6126000b7af5fcabe1d9d760cdc4b6a5a.jpg",
                "timemove": "1"
            },
            {
                "desc": "Hồ Tuyền Lâm là một hồ nước thuộc thành phố Đà Lạt tỉnh Lâm Đồng.",
                "title": "Hồ Tuyền Lâm",
                "image": "images/plantrip/dalat/fbcea65bb8f81199bd0cb4d51a50f508fe0415bb.jpg",
                "timemove": "25 phút bằng xe hơi"
            },
            {
                "desc": "Thiền Viện Trúc Lâm là thiền viện thuộc thiền phái Trúc Lâm Yên Tử.",
                "title": "Thiền viện Trúc Lâm Phụng Hoàng",
                "image": "images/plantrip/dalat/a4bda03b81296d0d5a9d6495642941b86070bcd5.jpg",
                "timemove": "5 phút bằng xe hơi"
            },
            {
                "desc": "Danh thắng có nhiều thác nước nhỏ, xe lượn, cáp treo và đường đi bộ đông đảo khách du lịch ghé thăm.",
                "title": "Khu Du Lịch Thác Datanla",
                "image": "images/plantrip/dalat/6ccd5865a26a93dee1d1a393415713be7c68c17a.jpg",
                "timemove": "5 phút bằng xe hơi"
            },
            {
                "desc": "Biệt thự cổ quái có kiến trúc mô phỏng thân cây cổ thụ; du khách có thể nhìn toàn cảnh thành phố từ mái nhà.",
                "title": "Biệt thự Hằng Nga",
                "image": "images/plantrip/dalat/ce29414e41819cbcca948a6bd9c59973f9cd33e4.jpg",
                "timemove": "15 phút bằng xe hơi"
            },
            {
                "desc": "Nhà thờ Domaine de Marie còn được gọi là Nhà thờ Vinh Sơn, Nhà thờ Mai Anh.",
                "title": "Nhà Thờ Domaine De Marie",
                "image": "images/plantrip/dalat/d5390b0b00fa22abbc342376c970789a98a6f0c9.jpg",
                "timemove": "10 phút bằng xe hơi"
            }
        ]
    },
    {
        "title": "Phú Quốc",
        "image": "images/main/ab4d7d9bd570f9210398fdda566bad87ff679960.jpg",
        "desc": "Đảo Việt Nam có các khu nghỉ mát bãi biển, thị trấn Dương Đông và một công viên quốc gia có núi và rừng rậm."
    },
    {
        "title": "Mũi Né",
        "image": "images/main/4c7421f88307a8a7cd5774f046d244306eaa8d79.jpg",
        "desc": "Khu nghỉ mát bãi biển nổi tiếng với lướt ván buồm, cồn cát đỏ cao vút và tàn tích tháp Chăm từ TK 9 gần đó."
    },
    {
        "title": "Thành phố Ninh Bình",
        "image": "images/main/202fc123bd2a0ce432d49fa996e7af79404f5165.jpg",
        "desc": "Hang, du lịch bụi, đền và đạp xe"
    },
    {
        "title": "Phong Nha - Ke Bang National Park Headquarter",
        "image": "images/main/effdf99af72413b3f7e7305e7d0e14d986171e0a.jpg",
        "desc": "Rừng mưa phòng hộ ở Việt Nam, là nơi có hang đá vôi cổ, hang động lớn như Phong Nha & nhiều động vật hoang dã."
    },
    {
        "title": "Sa Pa",
        "image": "images/main/dd9af2007b995628cd0b97edb85f423de4e77f3d.jpg",
        "desc": "Du lịch bụi, sương mù và núi"
    },
    {
        "title": "Cần Thơ",
        "image": "images/main/02443fe83fe2b314798bee5c83e33c6c97b92b83.jpg",
        "desc": "Thành phố bên sông nổi tiếng với chợ nổi Cái Răng - Phong Điền cùng chuyến đi thuyền trên đường thủy n.thôn."
    },
    {
        "title": "Thành phố Hạ Long",
        "image": "images/main/65cb7998153a9f9189673d9209d29d6068301538.jpg",
        "desc": "Thành phố biển Việt Na, là trạm dừng chân để khám phá các hòn đảo đá vôi ở Vịnh Hạ Long bằng thuyền buồm."
    },
    {
        "title": "Thành phố Phan Thiết",
        "image": "images/main/a2ef4d971c9277e6ef3c5564b3760f6898affeb3.jpg",
        "desc": "Thành phố cảng ven biển có bến cảng và sân gôn, cùng với bãi biển Mũi Né gần đó, có cồn cát và tàn tích cổ."
    },
    {
        "title": "Thành phố Vũng Tàu",
        "image": "images/main/db26459eb82bc5daad618789a0d68e1675b9f8e6.jpg",
        "desc": "Thành phố cảng & khu nghỉ mát với các bãi biển, nhà thuộc địa Villa Blanche & tượng Jesus 32m trên núi Small."
    },
    {
        "title": "Hải Phòng",
        "image": "images/main/ea6d970017b2359d2cabdcc78ebb92d6b0b028bd.jpg",
        "desc": "Thành phố cảng xanh với nhà hát opera thời Pháp thuộc cùng ngôi đền Phật giáo nổi bật."
    },
    {
        "title": "Cù Lao Chàm",
        "image": "images/main/70b3f3bcfeb351e6cfa2ffeb21a0ab8d876373bf.jpg",
        "desc": "Lặn ống thở, lặn có bình khí và hải sản"
    },
    {
        "title": "Mai Châu",
        "image": "images/main/e6d69fc67686511f1b24b868d00a8fab19b8faec.jpg",
        "desc": "Du lịch bụi, đạp xe, hang và phiêu lưu"
    },
    {
        "title": "Thành phố Mỹ Tho",
        "image": "images/main/9783f8a1c6e8fcbf7bd166a9096223da6df82615.jpg",
        "desc": "Sông, vườn cây ăn trái và du lịch bụi"
    },
    {
        "title": "Côn Đảo",
        "image": "images/main/4419ea2e03e0523357223f4c1c533b3a68474f01.jpg",
        "desc": "Đảo ở Việt Nam nổi tiếng với những bãi biển, Ngọn hải đăng Bảy Cạnh & Bảo tàng Côn Đảo."
    },
    {
        "title": "Vườn Quốc Gia Cúc Phương",
        "image": "images/main/0558354d34c92b042c776de79087d88e95d4fecd.jpg",
        "desc": "Vườn quốc gia có đường mòn và hang động"
    },
    {
        "title": "Thành phố Châu Đốc",
        "image": "images/main/69f3c954b3bcdfdc0aef06524fdcfa9c223a712d.jpg",
        "desc": "Núi, du lịch bụi, đền và sông"
    },
    {
        "title": "Hoa Lư",
        "image": "images/main/d074270bed2aedb5e2ca3f2218331e1cef727949.jpg",
        "desc": "Hang, đền, đạp xe và du lịch sinh thái"
    },
    {
        "title": "Thành phố Qui Nhơn",
        "image": "images/main/270f675e6bc05ab75ab97f54e5249b1b05f46036.jpg",
        "desc": "Du lịch bụi, hải sản, văn học và bãi biển"
    },
    {
        "title": "Vịnh Lan Hạ",
        "image": "images/main/63e2f5643944afee915e837528080fbb7af5cfdd.jpg",
        "desc": "Chèo thuyền kayak, hang, đầm phá và leo"
    },
    {
        "title": "Thành phố Hà Giang",
        "image": "images/main/d34bb2bebc79371f4f736075d3e5fd468c135686.jpg",
        "desc": "Du lịch bụi, phiêu lưu và núi"
    },
    {
        "title": "Hồ Tây",
        "image": "images/main/0fce2e2c2adbca56d8accdd79e60f5e0163acd59.jpg",
        "desc": "Hồ và công viên nước"
    },
    {
        "title": "thành phố Bến Tre",
        "image": "images/main/cd988bac1eda93e5c73770dbd2c1a500b26c46b8.jpg",
        "desc": "Du lịch sinh thái, du lịch bụi và vườn"
    },
    {
        "title": "Hồ Ba Bể",
        "image": "images/main/2959050e8b873eea95ac687706b60a1fa8dd1379.jpg",
        "desc": "Hồ, du lịch bụi và du lịch sinh thái"
    },
    {
        "title": "Thành phố Đồng Hới",
        "image": "images/main/e8c377f82815083e152a4e8a17f243f0e5094936.jpg",
        "desc": "Hang, du lịch bụi và hải sản"
    },
    {
        "title": "Cái Bè",
        "image": "images/main/0f03e7e0eac1435d0adf2c54d395b8a986abadde.jpg",
        "desc": "Thị trường, vườn cây ăn trái và sông"
    },
    {
        "title": "Vườn Quốc Gia Cát Bà",
        "image": "images/main/bf8fd550bd56c00e00ce2e3ffd8944474293081e.jpg",
        "desc": "Khu bảo tồn linh trưởng quý hiếm"
    },
    {
        "title": "tt. Lăng Cô",
        "image": "images/main/748828154c4fc4e55ceb0da86148883ebd393a8b.jpg",
        "desc": "Làng ở Việt Nam nổi tiếng với biển Lăng Cô, đèo Hải Vân và đời sống chim chóc ở Vườn Quốc gia Bạch Mã."
    },
    {
        "title": "Thành phố Vĩnh Long",
        "image": "images/main/d69749733d17ab9577aa4c3d8c5da1e0e7521ccf.jpg",
        "desc": "Vườn cây ăn trái và du lịch sinh thái"
    },
    {
        "title": "Vườn quốc gia Bạch Mã",
        "image": "images/main/ad520402bd5ce4982d4bbfa20b00d68575ffd308.jpg",
        "desc": "Du lịch sinh thái, rừng và núi"
    },
    {
        "title": "Thành phố Lào Cai",
        "image": "images/main/8a92ff3461e4b8696ac71859185f632b0ec450b3.jpg",
        "desc": "Du lịch bụi"
    },
    {
        "title": "Bắc Hà",
        "image": "images/main/6cb653b59af0eac0c0593b101d8dfe22ae33028d.jpg",
        "desc": "Thị trường, đua ngựa và đi bộ đường dài"
    },
    {
        "title": "Thành phố Buôn Ma Thuột",
        "image": "images/main/725c177ea5e5d7cf584b3d082cdb723e7f1a7ba1.jpg",
        "desc": "Du lịch bụi, hồ, thác và voi"
    },
    {
        "title": "Đồng Văn",
        "image": "images/main/58bf9f27dca258f0bfdfc24040fa12eb0e4c83f3.jpg",
        "desc": "Du lịch bụi, thác và núi"
    },
    {
        "title": "Thành phố Điện Biên Phủ",
        "image": "images/main/fe18054e6ee498d46acd29b52eb1e3e35539341b.jpg",
        "desc": "Lịch sử, du lịch bụi và bảo tàng"
    },
    {
        "title": "Thành phố Vinh",
        "image": "images/main/f2196b08cbce40677ca41ca73fd7e4a7649badc5.jpg",
        "desc": "Đền và văn học"
    },
    {
        "title": "Khu bảo tồn thiên nhiên Pù Luông",
        "image": "images/main/0eb5b9ad698b22257070a03ddb5a6b5f28171e63.jpg",
        "desc": "Khu vực tự nhiên nên thơ với lối đi bộ"
    },
    {
        "title": "Vườn Quốc Gia Cát Tiên",
        "image": "images/main/5607d7c9de3c18da6dfb5842a1551bd03461473f.jpg",
        "desc": "Rừng nhiệt đới ở miền nam Việt Nam nơi có đường mòn đi bộ, động vật hoang dã quý hiếm và hồ Cá Sấu."
    },
    {
        "title": "Thành phố Cam Ranh",
        "image": "images/main/dedc6a83622711f5c4821ca99f10e95790428b34.jpg",
        "desc": "Du lịch bụi, họ tôm hùm càng và cảng"
    },
    {
        "title": "Mù Cang Chải",
        "image": "images/main/5324eb0c65ad0a16a41353967db13611db1e8615.jpg",
        "desc": "Dù lượn, du lịch bụi, nhảy dù và núi"
    }
]
