var brains = new(function(){
	var me = this;
	var rulesData = [],
		fileName ="",
		folderPath="",
		globalImageArr = [];

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

					globalImageArr.push(obj);

					console.log("Global Image Arr - push"+globalImageArr);
					console.log("regex");
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

					globalImageArr.push(obj);
					console.log("height");
					break;
				}
			}
			i++;
		}
	}

	function getImageData(self){
		var imgData = {};
			if((self.naturalWidth).toString().length>0){
				imgData.width  = self.naturalWidth;
			}else{
				imgData.width  = self.width;
			}

			if((self.naturalHeight).toString().length>0){
				imgData.height = self.naturalHeight;
			}else{
				imgData.height = self.height;
			}
			imgData.src    = self.src;
		pattenCheck(imgData);
	}

	function asyncSetup(processQue,globalImageArray,downloadCounter){
		processQue++;
		downloadCounter++;
		if(processQue <= globalImageArray.length-1){
			var obj = globalImageArray[processQue],
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

			self.port.emit("save-img",imgData,ruleName,urlObj,processQue,globalImageArray,downloadCounter);
		}else{
			displayDownloadCount(downloadCounter);
		}
	}

	function intilizeLocalRulesDataAndDownload(data){
		rulesData = data.table;
		fileName = data.fileName;
		folderPath = data.folderPath;

		$("body").prepend('<div class="g-counter"><h3></h3></div>');

		$("body").click(function(){
			$.each($("img"),function(index,value){
				var url = $(this)[0].src,
					filename = url.substring(url.lastIndexOf('/')+1),
					fileExt = filename.substring(filename.lastIndexOf('.')+1);
				if((/jpg|jpeg|png|gif|tif/i).test(fileExt)){
					getImageData($(this)[0]);
				}
			});
			asyncSetup(-1,globalImageArr,-1);
		});

			hideCounter();
	}

	this.init = function(){
		self.port.on("send-inti-data-to-contentScript",intilizeLocalRulesDataAndDownload);
		self.port.on("send-next-img",asyncSetup);
	}
});
brains.init();