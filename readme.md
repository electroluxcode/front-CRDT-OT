# 0.sharedb-ot



## 0.1 ot

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







## 0.1. server



### 0.1.1 基础实例化

```js
// 1.初始化
var ShareDB = require('sharedb');
var backend = new ShareDB();

// 2.初始化ws 
var WebSocket = require('ws')
var http = require('http')
var server = http.createServer(app)

var webSocketServer = new WebSocket.Server({server: server})

// 3.接受 ws 然后 变成 stream
var backend = new ShareDB()
webSocketServer.on('connection', (webSocket) => {
  var stream = new WebSocketJSONStream(webSocket)
  backend.listen(stream)
})


```



### 0.1.2 连接指定id实例

#### 0.1.2.1 server

这个既可以是服务端 也可以是 客户端

- 初始化
- 初始化 connection 和 doc
- create 第一个初始 data ，然后绑定 # 1.1 上面的 初始流程
- 

```js
var backend = new ShareDB();
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

```



### 0.1.2.2 client

```js
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







## 0.2. client

