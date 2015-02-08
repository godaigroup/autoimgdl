var brains = new(function(){
	var me = this;
	var rulesData = [],
		fileName ="",
		folderPath="",
		siteDomainAsNewFolder=false,
		downloadCount= 0,
		globalImageArr = [],
		processQue = -1;

	function hideCounter(){
		var x = setTimeout(function(){
			$(".g-counter").animate({"opacity":"0"}, function () {
				$(this).hide();
			});
			clearTimeout(x);
		},5000);
	}

	function displayDownloadCount(count){
		var text = "Images Detected: "+count;

		$(".g-counter h3").html(text);

		$(".g-counter").show().animate({"opacity":"1"});
	}

	function parseImgURL(url) {
		var parser = document.createElement('a'),
			searchObject = {},
			queries, split, i;
		// Let the browser do the work
		parser.href = url;
		// Convert query string to object
		queries = parser.search.replace(/^\?/, '').split('&');
		for( i = 0; i < queries.length; i++ ) {
			split = queries[i].split('=');
			searchObject[split[0]] = split[1];
		}
		var data = {
			protocol: parser.protocol,
			host: parser.host,
			hostname: parser.hostname,
			port: parser.port,
			pathname: parser.pathname,
			search: parser.search,
			searchObject: searchObject,
			hash: parser.hash
		};
		return data;
	}

	function pattenCheck(imgData){
		var urlObj = parseImgURL(imgData.src),
			arrLength = rulesData.length;

		for(var i=0;i<arrLength;){
			/* Store on Image Sizes */
			var currentRow = rulesData[i],
				ruleName   = currentRow[0];
			if(currentRow[1].length > 0){
				var patt = new RegExp(currentRow[1]);
				if(patt.test(imgData.src)){

					var obj = {};
					obj.imgData = imgData;
					obj.ruleName = ruleName;
					obj.urlObj = urlObj;
					obj.downloadCount = downloadCount;

					globalImageArr.push(obj);

					console.log("regex");
					downloadCount++;
					displayDownloadCount(downloadCount);
					break;
				}
			}
			/* Store on Regex */
			if(currentRow[2].length > 0){
				var widthHeight = currentRow[2].split(" x ");
				if(widthHeight[0] == imgData.width && widthHeight[1] == imgData.height){

					var obj = {};
					obj.imgData = imgData;
					obj.ruleName = ruleName;
					obj.urlObj = urlObj;
					obj.downloadCount = downloadCount;

					globalImageArr.push(obj);
					console.log("height");
					downloadCount++;
					displayDownloadCount(downloadCount);
					break;
				}
			}
			i++;
		}
	}

	function getImageData(self){
		var imgData = {};
			imgData.width  = self.naturalWidth;
			imgData.height = self.naturalHeight;
			imgData.src    = self.src;
		pattenCheck(imgData);
	}

	function asyncSetup(){
		processQue++;
		console.log(processQue);
		console.log(globalImageArr);
		if(globalImageArr.length>0){
			var obj = globalImageArr[processQue],
				imgData = "",
				ruleName = "",
				urlObj = "";

			if(obj.imgData != undefined){
				imgData = obj.imgData;
			}

			if(obj.ruleName != undefined){
				ruleName = obj.ruleName;
			}

			if(obj.urlObj != undefined){
				urlObj = obj.urlObj;
			}

			if(obj.downloadCount != undefined){
				downloadCount = obj.downloadCount;
			}

			if(processQue <= globalImageArr.length){
				self.port.emit("save-img",imgData,ruleName,urlObj,downloadCount);
			}
		}
	}

	function intilizeLocalRulesDataAndDownload(data){

		downloadCount=0;
		rulesData = data.table;
		fileName = data.fileName;
		folderPath = data.folderPath;
		siteDomainAsNewFolder = data.siteDomainAsNewFolder;

		$("body").prepend('<div class="g-counter"><h3></h3></div>');

		$.each($("img"),function(index,value){
			getImageData($(this)[0]);
		});

		asyncSetup();
		hideCounter();
	}

	this.init = function(){
		self.port.on("send-inti-data-to-contentScript",intilizeLocalRulesDataAndDownload);
		self.port.on("send-next-img",asyncSetup);
	}
});
brains.init();