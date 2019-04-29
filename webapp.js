var http = require('http'),
      fs = require('fs'),
     url = require('url'),
     qs = require('querystring');

http.createServer(function(request, response){
    var path = url.parse(request.url).pathname;
    if (request.url === '/room.css') {
        fs.readFile('./room.css', function(err, file) {  
            if(err) {  
                console.log(err); 
                return;
            }
            console.log("Room served")
            response.writeHead(200, { 'Content-Type': 'text/css' });
            response.end(file, "utf-8");
        });
      }

    if(path=="/room"){
        if(request.method === 'GET'){
            fs.readFile('./room.html', function(err, file) {  
                if(err) {  
                    console.log(err); 
                    return;
                }
                console.log("Room served")
                response.writeHead(200, { 'Content-Type': 'text/html' });
                response.end(file, "utf-8");
            });
        } else if(request.method === 'POST') {
            
            var queryData = "";
            request.on('data', function(data) {
                queryData += data;
                if(queryData.length > 1e6) {
                    queryData = "";
                    response.writeHead(413, {'Content-Type': 'text/plain'}).end();
                    request.connection.destroy();
                }
            });
    
            request.on('end', function() {
                var testData = qs.parse(queryData);
                console.log(testData);
            });
    
        } 
        /* else {
            response.writeHead(405, {'Content-Type': 'text/plain'});
            response.end();
        } */
    }
}).listen(8002);
console.log("Server initialized");
