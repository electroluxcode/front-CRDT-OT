



# 0.ot

ot算法最主要使用的库是sharedb，下面的示例会用sharedb来进行示例。解决冲突可以简单理解为op的相互合并，中心服务器用来 处理 op合并的规则，一般来说是根据落点进行合并（右边合并进左边）

## 0.1 ot 类型



op 类型示例



```ts
interface t{
    p: [path, idx | index];
    na: number // 添加 xx 到路径 p
    li: object // 添加 对象到路径 p
    ld: number // 删除路径 p
	lm: index // 交换路径 p 的 idx 和 index


	si: string // 修改路径 p 的值，这个时候 p的第二个值是offset
    sd: string // 修改路径 p 的值，这个时候 p的第二个值是offset
}

// 扩展类型
{p:PATH, t:SUBTYPE, o:OPERATION}


```







## 0.1. helloworld



### 0.1.1 基础实例化

简单的说就是新建了一个ws

```js
// 1.初始化
var ShareDB = require('sharedb');
var backend = new ShareDB();

// 2.初始化ws 
var WebSocket = require('ws')
var http = require('http')
var express = require("express")
var app = express();
app.use(express.static("static"));
var server = http.createServer(app)

var webSocketServer = new WebSocket.Server({server: server})

// 3.接受 ws 然后 变成 stream
var backend = new ShareDB()


```



### 0.1.2 server

总结一下就是 获取sharedb实例后 create一下

`ShareDB-connect`  -> ` 获取当前实例，get`->`create的过程连接express`

这个既可以是服务端 也可以是 客户端

- 初始化sharedb实例 connection 和 doc
- create 第一个初始 data ，然后绑定  express

```js
// 1.初始化
var ShareDB = require('sharedb');
var backend = new ShareDB();

var WebSocket = require('ws')
var http = require('http')

// express
var express = require("express")
var app = express();
app.use(express.static("static"));
var server = http.createServer(app)


var webSocketServer = new WebSocket.Server({server: server})

// 3.接受 ws 然后 变成 stream
var backend = new ShareDB()

var connection = backend.connect();
var doc = connection.get('examples', 'counter');

doc.create({ numClicks: 0 }, () => {
    var app = express();
    app.use(express.static("static"));
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



```











### 0.1.3. client

- 获取sharedb实例
- 定义 `submitOp` 发送事件 和 `on("op")` 接收事件

```ts
var ReconnectingWebSocket = require('reconnecting-websocket');
var sharedb = require('sharedb/lib/client');


// 1. 初始化连接
var socket = new ReconnectingWebSocket('ws://' + window.location.host, [], {
  // ShareDB handles dropped messages, and buffering them while the socket
  // is closed has undefined behavior
  maxEnqueuedMessages: 0
});
var connection = new sharedb.Connection(socket);
var doc = connection.get('examples', 'counter');


function showNumbers() {
  document.querySelector('#num-clicks').textContent = doc.data.numClicks;
};

// 2. 初始化init
doc.subscribe(showNumbers);

// 3.初始化消息传递
doc.on('op', showNumbers);

function increment() {
  // Increment `doc.data.numClicks`. See
  // https://github.com/ottypes/json0 for list of valid operations.
  doc.submitOp([{p: ['numClicks'], na: 1}]);
}
```







## 0.2 定义自己的类型



### 0.2.1 server

在之前的基础上，提前注册type就行



```ts
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
```

然后注意在 create的时候需要

```ts
doc.create({ myString: "空数据" },myType.type.uri, callback
```

完整源码如下

```ts

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


```







### 0.2.2 client



与上面一样，注册type就行，完整源码如下

```ts
var ReconnectingWebSocket = require('reconnecting-websocket');
var sharedb = require('sharedb/lib/client');
// 定义自己的类型
let myType = {
	type: {
		name: "http:json11",
		uri: "http:json11",

		// 初始化 OT 编码器
		create: function (e) {
			console.log("create",e);
			return e
		},
		// 将客户端提交的操作应用到服务器端数据
		apply: function (snapshot, op) {
			console.log("apply",op,snapshot);
			return op; // 直接返回操作，表示简单地应用操作
		},
		// 将服务器端数据转换为客户端可用的格式
		transform: function (ops, otherOps, side) {
			console.log("transform", {otherOps, side});
			return ops; // 简单地返回操作，不进行转换
		},
	},
};
var socket = new ReconnectingWebSocket('ws://' + window.location.host, [], {
  maxEnqueuedMessages: 0
});
sharedb.types.register(myType.type);
var connection = new sharedb.Connection(socket);
var doc = connection.get('examples', 'counter');


function showString() {
  console.log("收到消息", {  doc });
  document.querySelector('input').value = doc.data.myString;
};

// 2. 初始化init
doc.subscribe(showString);

// 3.初始化消息传递
doc.on('op', showString);

function oninputChange() {
	console.log()
    doc.submitOp({myString:document.querySelector('input').value});
}
global.oninputChange = oninputChange;
```



### 0.2.3 ui

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    
<div style="font-family: Helvetica Neue, Helvetica, Arial, sans-serif; font-size: 36px;">
    Input: 
    <input type="text" onchange="oninputChange()">
  </div>
    <script type="" src="dist.js"></script>
</body>
</html>
```

