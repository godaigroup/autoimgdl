var data = require("sdk/self").data;
var buttons = require('sdk/ui/button/action');
var tabs = require("sdk/tabs");
var pageMod = require("sdk/page-mod");
var ss = require("sdk/simple-storage"); // For packaged data scripts
var panels = require("sdk/panel");
var self = require("sdk/self");
var globalDuplicateCounter = 0;

if (ss.storage.dataObj == undefined){
	var dataObj = {};
	dataObj.appStatus = "true";
	ss.storage.dataObj = dataObj;
}


/* Download Files */
const {Cu} = require('chrome');
const {Downloads} = Cu.import("resource://gre/modules/Downloads.jsm", null);
const {OS} = Cu.import("resource://gre/modules/osfile.jsm", {});

var storageAPI = new (function(){
	 function detectStorageLocation(imgData,ruleName,urlObj){
		var data = ss.storage.dataObj,
			folderPathArr = data.folderPath.trim().split("%"),
			drive = folderPathArr.shift(),
			locationString = "";

		 console.log("detectData:"+data.folderPath);
		 console.log("Arr"+folderPathArr);
		var imgUrl = urlObj;

		 var url      = imgData.src,
			 filename = url.substring(url.lastIndexOf('/')+1);

		 for( var i=0; i<folderPathArr.length; i++){
			 if(folderPathArr[i].length>0){
				 if(folderPathArr[i] == "sitedomain"){
					 locationString = locationString + "\\\\"+ imgUrl.hostname;
				 } else if(folderPathArr[i] == "rulename"){
					 if(ruleName.length>0){
						 locationString = locationString + "\\\\" + ruleName;
					 } else {}
				 } else if(folderPathArr[i] == "dimensions"){
					 locationString = locationString + "\\\\" + imgData.width+"x"+imgData.height;
				 } else if(folderPathArr[i] == "original"){
					 locationString = locationString + "\\\\" + filename;
				 } else if(folderPathArr[i] == "ext") {
					 var ext =  filename.substring(filename.lastIndexOf('.')+1);
					 locationString = locationString + "\\\\" + ext;
				 } else {
					 locationString = locationString + "\\\\" + folderPathArr[i].replace(/\\/g,"");
				 }
			 }
		 }
		 drive = drive.replace(/\\/g,"");
		 locationString = drive+locationString;
		console.log("location:"+locationString);
		 return locationString;
	}

	function detectFileName(imgData,ruleName,urlObj){
		var data = ss.storage.dataObj,
			fileNameType = data.fileName.trim().split("%"),
			locationString = "";

		var url      = imgData.src,
			filename = url.substring(url.lastIndexOf('/')+1),
			fileExt = filename.substring(filename.lastIndexOf('.')+1);

		for( var i=0; i<fileNameType.length; i++) {
			if(fileNameType[i].length>0) {
				if (fileNameType[i] == "sitedomain") {
					locationString = locationString + urlObj.hostname;
				} else if (fileNameType[i] == "rulename") {
					if (ruleName.length > 0) {
						locationString = locationString + ruleName;
					} else {
					}
				} else if (fileNameType[i] == "dimensions") {
					locationString = locationString + imgData.width + "x" + imgData.height;
				} else if (fileNameType[i] == "ext") {
					locationString = locationString + fileExt;
				} else if (fileNameType[i] == "original") {
					locationString = locationString + filename;
				} else {
					locationString = locationString + fileNameType[i].replace(/\\/g, "");
				}
			}
		}
		return locationString+"."+fileExt;
	}

	function createDirectory(path)
	{
		//OS.File.makeDir(path, { ignoreExisting: true, from: "F:\\garette" });
		var folderArr = path.split("\\\\");
		var drive = folderArr.shift();
		var folder = "";
		for( var i=0; i<folderArr.length; i++){
			if(i>0){
				folder = folder+"\\\\"+folderArr[i];
			}else{
				folder = drive+"\\\\"+folderArr[i];
			}
			OS.File.makeDir(folder);
		}
	}



	function checkHigherLevelDuplicates(randomlyNamedFilePath,imgData,location,baseFileName){
		globalDuplicateCounter++;
		var ext = baseFileName.substring(baseFileName.lastIndexOf('.')+1),
			name = baseFileName.substring(baseFileName.lastIndexOf('.'),0),
			newfileName  = name+"_"+globalDuplicateCounter+"."+ext;

		newNamePath = location+"\\\\"+newfileName;

		var promise = OS.File.exists(newNamePath);
		promise = promise.then(
			function onSuccess(exists) {
				if (exists) {
					compareFileSize(newNamePath,randomlyNamedFilePath,imgData,location,baseFileName);
				} else {
					OS.File.remove(randomlyNamedFilePath);
					var download = Downloads.fetch(imgData.src,newNamePath);
					download = download.then(
						function onSuccess() {
							console.log("Download Orig Success");
							globalDuplicateCounter = 0;
							targetPage.port.emit("send-next-img");
						},
						function onFailure(reason) {
							console.log("Downlload Orig Failure");
						}
					);
				}
			},
			function onFailure(reason) {
				console.log("failure exists");
			}
		);
	}

	function compareFileSize(orignialFilePath,randomlyNamedFilePath,imgData,location,baseFileName){
		var fileSizeA = OS.File.stat(orignialFilePath);
		fileSizeA = fileSizeA.then(
			function onSuccess(infoA) {
				if (infoA.size) {
					console.log("Exist:A");
					var fileSizeB = OS.File.stat(randomlyNamedFilePath);
					fileSizeB = fileSizeB.then(
						function onSuccess(infoB) {
							if (infoB.size) {
								if(infoA.size == infoB.size){
									OS.File.remove(randomlyNamedFilePath);
									console.log("removed file:"+randomlyNamedFilePath);
									globalDuplicateCounter = 0;
									targetPage.port.emit("send-next-img");
								}else{
									checkHigherLevelDuplicates(randomlyNamedFilePath,imgData,location,baseFileName);
									console.log("Non Duplicates");
								}
							} else {
								console.log("No info:B");
							}
						},
						function onFailure(reason) {
							console.log("failure size:B");
						}
					);
				} else {
					console.log("No info:A");
				}
			},
			function onFailure(reason) {
				console.log("failure size:A");
			}
		);
	}

	function saveToDiskAndCheckDuplicates(location,fileName,imgData){
		var originalFilePath = location+"\\\\"+fileName;
		var promise = OS.File.exists(originalFilePath);
		promise = promise.then(
			function onSuccess(exists) {
				if (exists) {
					var number = Math.floor((Math.random() * 100) + 1);
					var ext = fileName.substring(fileName.lastIndexOf('.')+1),
						name = fileName.substring(fileName.lastIndexOf('.'),0),
						newfileName  = name+"_"+number+"."+ext;
						 newNamePath = location+"\\\\"+newfileName;

					//saveToDiskAndCheckDuplicates(location,newfileName,imgData,number);

					var downloadDuplicates = Downloads.fetch(imgData.src,newNamePath);
					downloadDuplicates = downloadDuplicates.then(
						function onSuccess() {
							console.log(newNamePath);
							compareFileSize(originalFilePath,newNamePath,imgData,location,fileName);
							console.log("Download Exist Success");
						},
						function onFailure(reason) {
							console.log("Download Exist Failure");
						}
					);

				} else {
					var download = Downloads.fetch(imgData.src,originalFilePath);
					download = download.then(
						function onSuccess() {
							console.log("Download Orig Success");
							targetPage.port.emit("send-next-img");
						},
						function onFailure(reason) {
							console.log("Downlload Orig Failure");
						}
					);
					console.log("Doesnt Exist");
				}
			},
			function onFailure(reason) {
				console.log("failure exists");
			}
		);
	}

	this.downloadFile = function(imgData,ruleName,urlObj,downloadCount)
	{
		var location = detectStorageLocation(imgData,ruleName,urlObj);
		var fileName = detectFileName(imgData,ruleName,urlObj);
		createDirectory(location);
		console.log("file-name:"+location+fileName);
		saveToDiskAndCheckDuplicates(location, fileName,imgData);
	}

});
var targetPage = null;

function startApp_attachScripts () {
	targetPage = pageMod.PageMod({
		include: "*",
		contentStyleFile: self.data.url("./css/contentScript.style.css"),
		contentScriptFile: [self.data.url("./utils-js/jquery.min.js"),self.data.url("./contentScripts/app.js")],
		onAttach: function(worker) {
			worker.port.emit("send-inti-data-to-contentScript",ss.storage.dataObj);
			/* Get Url on matching Regex Rules */
			worker.port.on("save-img",function(imgData,ruleName,urlObj,downloadCount){
				storageAPI.downloadFile(imgData,ruleName,urlObj,downloadCount);
				console.log(imgData);
				console.log(ruleName);
			});
		}
	});
}

if(ss.storage.dataObj.appStatus == "true"){
	startApp_attachScripts();
}

/* Panels */
var gPanel = panels.Panel({
	width:750,
	height:500,
	contentURL: self.data.url("options.html"),
	contentScriptFile: [self.data.url("./utils-js/jquery.min.js"),self.data.url("./bootstrap/bootstrap.min.js"),self.data.url("./bootstrap/toggle.min.js"),self.data.url("./contentScripts/service.addon.js"),self.data.url("./contentScripts/options.js")],
	contentStyleFile: [self.data.url("./bootstrap/bootstrap.min.css"),self.data.url("./css/options.style.css"),self.data.url("./bootstrap/toggle.min.css")]
});

/* Load Data to Options Content Script */
gPanel.on("show",function(){
	gPanel.port.emit("load-init-data",ss.storage.dataObj);
});

/* Get Data from options */
gPanel.port.on("send-data-from-options-to-app",function(data){
	ss.storage.dataObj = data;
	console.log(ss.storage.dataObj);
	if(targetPage.length>0){
		targetPage.port.emit("send-inti-data-to-contentScript",ss.storage.dataObj);
	}
});
gPanel.port.on("on-off-app",function(data){
	gPanel.hide();
	ss.storage.dataObj.appStatus = data;
	console.log(ss.storage.dataObj);
	if(data == "false"){
		if(targetPage != undefined){
			targetPage.destroy();
		}
		console.log("off-----------------");
	}else{
		startApp_attachScripts();
		console.log("on-----------------");
	}
});
/* Panels */

buttons.ActionButton({
	id: "mozilla-link",
	label: "Garrett Gee",
	icon: {
		"16": "./icons/icon-16.png",
		"32": "./icons/icon-32.png",
		"64": "./icons/icon-64.png"
	},
	onClick: handleClick
});

function handleClick() {
	gPanel.show();
}



