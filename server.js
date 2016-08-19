var express = require('express')
var multer  = require('multer')
var crypto = require('crypto')
var path = require('path');
var cors = require('cors');
//var upload = multer({ dest: 'uploads/' })
var mongodb = require('mongodb');
var app = express();
var uri  = 'mongodb://priyank:gahtori@ds051843.mlab.com:51843/resource_upload';
var MongoClient = mongodb.MongoClient;
app.use(cors());

//save the filename along with extension
var storage = multer.diskStorage({
  destination: './uploads/',
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      if (err) return cb(err)

      cb(null, raw.toString('hex') + path.extname(file.originalname))
    })
  }
})

var upload = multer({ storage: storage })

//allow static files
app.use('/uploads', express.static(__dirname + '/uploads'));
//app.use(express.static('uploads'));

app.post('/upload', upload.single('resource'), function (req, res, next) {
  console.log(req.file);
  console.log(req.body);

  //upload file's meta-data to DB
  connectAndUpload(res,req.file);

  // req.file is the `resource` file
  // req.body will hold the text fields, if there were any
})

app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, './index.html'));
//  res.send('hello world');
});


//connecting to database
function connectAndUpload(res,data){
// Use connect method to connect to the Server
MongoClient.connect(uri, function (err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
    //send the response
    res.status(500).send(err);

  } else {
    //HURRAY!! We are connected. :)
    console.log('Connection established to', uri);

    // do some work here with the database.
    // Get the documents collection
    var collection = db.collection('resources');
    //var data = {'name':'asdf','realname':'pqrg'};
    // Insert some data`
    collection.insert(data, function (err, result) {
        if (err) {
          console.log(err);
          //send the response
          res.status(500).send(err);
        } else {
          console.log('Inserted %d documents into the "resources" collection. The documents inserted with "_id" are:', result.length, result);
          //send the response
          res.send(result);
        }

        //Close connection
        db.close();
      });
  }
});
}


// Initialize the app.
 var server = app.listen(process.env.PORT || 8080, function () {
   var port = server.address().port;
   console.log("App now running on port", port);
 });
