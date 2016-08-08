var io = require('socket.io-client'),
        yaml = require('js-yaml'),
        yaml_path = '../env_pubsubcl/pubsubcl.yml',
        fs = require('fs'),
        doc = yaml.safeLoad(fs.readFileSync(yaml_path, 'utf8')),
        http = require('http'),
        username = doc.username,
        pwd = doc.pwd,
        serverUrl = doc.server_url,
        host = doc.server_host,
        env_PORT = doc.env_port,
        channel_name = doc.channel_name;

performRequest('/pubsub/login', 'POST', {
    username: username,
    password: pwd,
    channel_name : channel_name
}, function ( result ) {
    connect_socket( result.token );
}, env_PORT );
    

function connect_socket(token) {
    console.log('trying to connect...');
    var socket = io.connect(serverUrl, {
        query: 'token=' + token
    });

    socket.on('connect', function () {        
        console.log('subscribed to ' + channel_name );
        this.emit('subscribe', channel_name );
    }).on('message', function (message) {
            try{
                console.log(message);
            }catch (e) {
                console.log(e);
            }    
        });
}

//calling api
function performRequest(endpoint, method, data, success,port_selected) {

    var dataString = JSON.stringify(data);
    var headers = {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(dataString, 'utf8')
    };

    var options = {
        host: host,
        path: endpoint,
        method: method,
        headers: headers,
        port: port_selected
    };
    var req = http.request(options, function (res) {
        res.setEncoding('utf8');
        var responseString = '';
        res.on('data', function (data) {
            responseString += data;
        });

        res.on('end', function () {
            var responseObject = JSON.parse(responseString);
            success(responseObject);
        });
    });
    req.on('error', function (e) {
        console.log(e);
        console.log('error on logging in to API');
    });

    req.write(dataString);
    req.end();
}

//docker inspect --format='{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}'