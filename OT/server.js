
var ShareDB = require('sharedb');
let myType = {
	type: {
		name: "http:json11",
		uri: "http:json11",
		// 初始化 OT 编码器
		create: function (op) {
			console.log("create", op);
			return {
				myString:op.myString,
			}; // 初始状态为空字符串
		},
		// 将客户端提交的操作应用到服务器端数据,set的时候直接赋值了
		apply: function (snapshot, op) {
			console.log("apply", op);
			return op; // 直接返回操作，表示简单地应用操作
		},
		// 将服务器端数据转换为客户端可用的格式
		transform: function (ops, otherOps, side) {
			console.log("transform");
			return ops; // 简单地返回操作，不进行转换
		},
	},
};
ShareDB.types.register(myType.type)
var WebSocketJSONStream = require('@teamwork/websocket-json-stream')
var backend = new ShareDB();

var WebSocket = require('ws')
var http = require('http')
var express = require("express")
var app = express();
app.use(express.static("static"));
var server = http.createServer(app)

var webSocketServer = new WebSocket.Server({server: server})

var backend = new ShareDB()

var connection = backend.connect();
var doc = connection.get('examples', 'counter');

doc.create({ myString: "空数据" },myType.type.uri, () => {
    var app = express();
    app.use(express.static("./"));
    var server = http.createServer(app);

    // Connect any incoming WebSocket connection to ShareDB
    var wss = new WebSocket.Server({ server: server });
    wss.on("connection", function (ws) {
        var stream = new WebSocketJSONStream(ws);
        // 用来把发的json 变成 text
        // 收到的 text 变成json
        backend.listen(stream);
    });

    server.listen(8080);
    console.log("Listening on http://localhost:8080");
});

webSocketServer.on('connection', (webSocket) => {
  var stream = new WebSocketJSONStream(webSocket)
  backend.listen(stream)
})

