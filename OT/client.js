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