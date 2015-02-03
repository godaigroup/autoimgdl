var data = require("sdk/self").data;
var buttons = require('sdk/ui/button/action');
var tabs = require("sdk/tabs");
var pageMod = require("sdk/page-mod");
var ss = require("sdk/simple-storage"); // For packaged data scripts
var panels = require("sdk/panel");
var self = require("sdk/self");

pageMod.PageMod({
	include: "*.mozilla.org",
	contentScriptFile: [self.data.url("./utils-js/jquery.min.js"),self.data.url("./contentScripts/app.js")]
});

/* Imp for Arrays
if (!ss.storage.pages)
	ss.storage.pages = [];*/

var gPanel = panels.Panel({
	width:750,
	height:700,
	contentURL: self.data.url("options.html"),
	contentScriptFile: [self.data.url("./utils-js/jquery.min.js"),self.data.url("./bootstrap/bootstrap.min.js"),self.data.url("./bootstrap/toggle.min.js"),self.data.url("./contentScripts/service.addon.js"),self.data.url("./contentScripts/options.js")]
});

/* Load Data to Options Content Script */
gPanel.port.emit("load-init-data");

/* Get Data from options */
gPanel.port.on("send-data-from-options-to-app",function(data){
	//console.log(data);
	ss.storage.dataObj = data;
	console.log(ss.storage.dataObj);
});

buttons.ActionButton({
	id: "mozilla-link",
	label: "Garette Gee",
	icon: {
		"16": "./icons/icon-16.png",
		"32": "./icons/icon-32.png",
		"64": "./icons/icon-64.png"
	},
	onClick: handleClick
});

function handleClick(state) {
	//tabs.open("https://www.google.com/");
	gPanel.show();
}

gPanel.port.on("options-updated",function(data){
	console.log("i recieved: "+data);
});



const {Cu} = require('chrome');
const {Downloads} = Cu.import("resource://gre/modules/Downloads.jsm", null);
const {OS} = Cu.import("resource://gre/modules/osfile.jsm", {});


function downloadFile(url)
{
	Downloads.fetch(url, "D:\\example-download.html");

	console.log("example-download.html has been downloaded.");
}

//downloadFile("http://www.mozilla.org/");

function createDirectory(path)
{
	OS.File.makeDir(path, { ignoreExisting: true, from: "D:\\garette" });
}

//createDirectory("D:\\garette\\test\\testdir");
