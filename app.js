const express = require('express');
const app = express();

const mongoClient = require('mongodb').MongoClient;
const nodemailer = require('nodemailer');

const fs  = require('fs');
const path = require("path");

const multer = require('multer');
const fileUpload = require('express-fileupload');

const AWS = require('aws-sdk');
const personal_info = require("/credential/personal_info");

app.use(express.json());
app.use(express.static('public'));

const s3 = new AWS.S3({
    accessKeyId: personal_info.keyId,
    secretAccessKey: personal_info.accessKey,
    region: "ap-northeast-2"
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
      },
      filename: function (req, file, cb) {
        cb(null, new Date().valueOf() + path.extname(file.originalname));
      }
});

AWS.config.update({region: 'ap-northeast-2'});
AWS.config.loadFromPath('./credentials.json');

const url = "mongodb://localhost:27017";
const upload = multer({storage: storage});

/* min ~ max까지 랜덤으로 숫자를 생성하는 함수 */
var generateRandom = function (min, max) {
    var ranNum = Math.floor(Math.random()*(max-min+1)) + min;
    return ranNum;
}

var rekognition = new AWS.Rekognition();

// 인물분류
function searchByImage(image, cb) {
    var params = {
        CollectionId: "kinders",
        Image: {
            Bytes: image.data.buffer
        }
    };

    rekognition.searchFacesByImage(params, function(err, data) {
        if(err) {
            console.log(err, err.stack);

            cb({})
        }
        else {
            console.log(data);
            const imageMatches = data.FaceMatches.filter(function(match){ return match.Face.ExternalImageId !== undefined;})
                .map(function(image){return image.Face.ExternalImageId;})
                .map(function(s3ObjectKey){return "https://kindersbucket.s3.ap-northeast-2.amazonaws.com/"+s3ObjectKey;})

            cb(imageMatches);
        }
    });
}

mongoClient.connect(url, (err, db) => {
    if (err) {
        console.log(err);
        console.log('Error while connecting mongo client');
    }
    else {
        const myDb = db.db('myDb');
        const collection = myDb.collection('myTable2');
        const collectiong = myDb.collection('myTable3');
        const collectionImg = myDb.collection('myimages');

        // 사용자 사진 목록
        var uploadfiles = upload.array("photo");
        // 그룹 사진 목록
        var groupImage = upload.array("Image");

        // 이메일 인증
        app.post('/check', (req, res)=> {
            const sendEmail  = req.body.email;

            const smtpTransport = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: email,
                    pass: password
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            const Checking = generateRandom(111111,999999)

            console.log(req.body.email);

            const mailOptions = {
                from: "Triple, 여행을 편안하게",
                to: sendEmail,
                subject: "[Triple] 인증 관련 이메일 입니다",
                text: "오른쪽 숫자 6자리를 입력해주세요 : " + Checking
            };

            const mailToCheking = {
                email : req.body.email,
                Checking : Checking
            }

            console.log(Checking);

            smtpTransport.sendMail(mailOptions, (error) => {
                if (error) {
                    console.log("에러입니다.");
                    console.log(error);
                }
                else {
                    /* 클라이언트에게 인증 번호를 보내서 사용자가 맞게 입력하는지 확인! */
                    console.log("정상 실행");
                    res.status(200).send(mailToCheking);
                }
                smtpTransport.close();
            });


        });

        // 회원가입
        app.post('/signup', (req, res) => {

            const newUser = {
                email : req.body.email,
                name : req.body.name,
                password : req.body.password,
                job : req.body.job,
            };

            const query = {email: newUser.email};

            collection.findOne(query, (err, result) => {
                if(result == null) {
                    collection.insertOne(newUser, (err, result) => {
                        res.status(200).send();
                    });
                } else {
                    res.status(404).send();
                }
            });

        });

        // 로그인
        app.post('/login', (req, res) =>{

            console.log(req.body);

            const query = {
                email: req.body.email,
                password: req.body.password
            }

            collection.findOne(query, (err, result) => {
                if(result!=null){
                    const objToSend = {
                        email : result.email,
                        name : result.name,
                        password : result.password,
                        job : result.job
                    }

                    res.status(200).send(JSON.stringify(objToSend));
                } else {
                    result.status(404).send();
                    console.log("오류");
                }
            });
        })

        // 사용자 사진 목록 등록
        app.post('/groupimage', (req, res)=>{
            console.log(req.body);

            uploadfiles(req, res, err => {
                console.log(req.files);
                console.log("파일 업로드 완료");
                console.log(req.body);

                const query = {email: req.body.email};
                const imagesData = {
                    email : req.body.email,
                    files : req.files
                }
                collectionImg.findOne(query, (err, result) => {
                    if(result == null) {
                        collectionImg.insertOne(imagesData, (err, result) => {
                            res.status(200).send();
                        });
                    } else {
                        res.status(400).send();
                    }
                });
                res.end();
            });

        });

        // 그룹 이미지 받기 - 감정인식 완료된 사진그룹 받아서 인물분류
        app.post('/myimage', function(req, res){
            console.log(req.body);
            groupImage(req, res, err => {
                console.log(req.files);
                console.log("이미지 업로드");

                const query = {email: req.body.email};
                var paths = req.files.map(file => file.path);
                var pathsArray = String(paths).split(",");
                var originalnameArray = req.files.map(file => file.originalname);

                for(var i in pathsArray) {
                    var param = {
                    'Bucket':'kindersbucket',
                    'Key': 'image/' + originalnameArray[i],
                    'ACL':'public-read',
                    'Body':fs.createReadStream(pathsArray[i]),
                    'ContentType':'image/png'
                    }

                    s3.upload (param, function (err, data) {
                        if (err) {
                        console.log("S3 Upload Error", err);
                        } if (data) {
                        console.log("S3 Upload Success", data.Location);
                        }
                    });
                }

                if (!req.files)
                    return res.status(400).send('No files were uploaded.');

                // 인물 분류
                searchByImage(req.files, function(images){ })
            });
        });

        // 탈퇴하기
        app.post('/leave', (req, res) => {
            const query = {
                email: req.body.email,
                password: req.body.password
            }

            collection.findOne(query, (err, result) => {
                if(result != null) {
                    collection.deleteOne(result, (err, obj) => {
                        res.status(200).send();
                        console.log("탈퇴 완료.");
                    });
                }
                else {
                    res.status(404).send();
                    console.log("탈퇴하려는 회원의 정보가 없습니다.");
                }
            });

        })

        // group id 생성
       app.get('/groupid', (req, res) => {
            function randomString() {
                var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
                var string_length = 10;
                var randomstring = '';
                for (var i = 0; i < string_length; i++) {
                    var rnum = Math.floor(Math.random() * chars.length);
                    randomstring += chars.substring(rnum, rnum + 1);
                }

                res.status(200).send(randomstring);

                // group id 중복 확인
                collectiong.findOne(group_id, (err, result) => {
                    if(result != null) {
                        randomString();
                    }
                    else {
                        debug("중복 확인" + randomString)
                        res.status(200).send(randomstring);
                    }
                });
            }
            randomString();
       })

        // 새로운 group 추가
        app.post('/add_group', (req, res) => {

            const newGroup = {
                group_id: req.body.groupid,
                group_email: req.body.email,
                group_name: req.body.groupname,
                group_date: req.body.groupdate,
                group_place: req.body.groupplace,
                group_schoolinfo: req.body.scohoolinfo,
            };

            const q_email = { email: newGroup.email };

            collectiong.findOne(q_email, (err, result) => {
                if (result = ! null) {
                    collectiong.insertOne(newGroup, (err, result) => {
                        res.status(200).send("새로운 그룹 추가 성공");
                    });
                } else {
                    res.status(400).send("새로운 그룹 추가 실패");
                    console.log("실패")
                }
            });
        });

        // 그룹 삭제하기
        app.post('/delete_group', (req, res) => {
            const q_group = {
                group_email: req.body.email,
                group_name: req.body.groupname
            }

            var query = {};
            const q_email = { email: req.body.email }

            collection.findOne(q_email, (err, result) => {
                var myemail = 'group_email_' + result.name;
                query[myemail]=req.body.email;
            })

            // 그룹장이 그룹 삭제
            collectiong.findOne(q_group, (err, result) => {
                if (result != null) {
                    collectiong.deleteOne(result, (err, obj) => {
                        res.status(300).send("그룹 삭제가 완료되었습니다.");
                    });
                }
                else {
                    // 그룹 멤버가 그룹 삭제
                    collectiong.findOne({$and: [{ group_name: req.body.groupname }, query]}, (err, result) => {
                        if(result != null){
                            collectiong.updateOne({group_name: req.body.groupname}, { $unset:  query })
                            res.status(200).send("그룹 삭제 완료");
                        }
                        else{
                            res.status(400).send("그룹 삭제에 오류가 발생했습니다.");
                        }
                    });
                }
            });

        });

        // 그룹 검색하기
        app.post('/search_group', (req, res) => {
            const q_searchid = { group_id: req.body.searchid }
            collectiong.findOne(q_searchid, (err, result) => {
                if (result != null) {
                    res.status(200).send(result.group_name);
                } else {
                    res.status(400).send("존재하지 않는 그룹 id입니다.");
                }
            });
        });

        // 검색한 그룹 추가하기
        app.post('/add_search_group', (req, res) => {
            // 이메일 field 생성
            var myemail = ''
            const q_email = { email: req.body.email }
            collection.findOne(q_email, (err, result) => {
                myemail = 'group_email_' + result.name;
            })
            const q_groupid = { group_id: req.body.groupid }

            // id에 newgroup 추가
            collectiong.findOne(q_groupid, (err, result) => {
                if (result = ! null) {
                    collectiong.updateOne({group_id: req.body.groupid}, {$set: {[myemail]: req.body.email}}, false, true)
                    res.status(200).send("그룹에 유저 추가 성공");
                } else {
                    res.status(400).send("그룹에 유저 추가 실패");
                }
            });

        });

        // 그룹 정보 가져오기
        app.post('/group', (req, res) => {
            collectiong.find( {group_name: req.body.groupname }).toArray(function (err, result) {

                if(result != null){
                    var group_id = result[0].group_id
                    var group_date = result[0].group_date
                    var group_place = result[0].group_place
                    var group_schoolinfo = result[0].group_schoolinfo

                    const objToSendGroup = {
                        group_id,
                        group_date,
                        group_place,
                        group_schoolinfo
                    }
                    res.status(200).send(JSON.stringify(objToSendGroup));

                }else{
                    res.status(400).send("그룹 정보 가져오기 실패")
                }

            });

        })

        // 홈 화면 조회하기
        app.post('/home', (req, res) => {
            var arr_name = []
            var query = {};
            const q_email = { email: req.body.email }
            collection.findOne(q_email, (err, result) => {
                var myemail = 'group_email_' + result.name;
                query[myemail]=req.body.email;
            })

            collectiong.find({$or: [{ group_email: req.body.email }, query]}, { projection: { group_name: 1 } }).toArray(function (err, result) {
                if(result != null){
                    collectiong.find({$or: [{ group_email: req.body.email }, query]}, { projection: { group_name: 1 } }).toArray(function (err, result) {
                        for (var i = 0; i < result.length; i++) {
                            arr_name[i] = result[i].group_name
                        }
                        res.status(200).send(arr_name)
                    });
                }
                else{
                    res.status(400).send("홈 화면 조회하기 에러")
                }
            });
    })
}
});

app.listen(3000, () => {
    console.log("listening on port 3000....");
});