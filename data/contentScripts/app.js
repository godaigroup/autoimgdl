var brains = new(function(){
	var me = this;
	var rulesData = [],
		fileName ="",
		folderPath="",
		globalImageArr = [];
	var AjaxRequestCount = 0,
		AjaxCompleteCount = 0;


	function hideCounter(){
		var x = setTimeout(function(){
			$(".g-counter").animate({"opacity":"0"}, function () {
				$(this).hide();
			});
			clearTimeout(x);
		},5000);
	}

	function displayDownloadCount(count){
		var text = "Images Downloaded: "+count;

		$(".g-counter h3").html(text);

		$(".g-counter").show().animate({"opacity":"1"});

		hideCounter();
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
			hash: parser.hash,
			windowHost:window.location.hostname
		};
		return data;
	}

	function pattenCheck(imgData){
		var urlObj = parseImgURL(imgData.src),
			arrLength = rulesData.length;

		for(var i=0;i<arrLength;){
			/* Store on Image Sizes */
			var currentRow = rulesData[i],
				ruleName   = currentRow[0],
				imageDimensions = currentRow[2].trim().split("x");

			if(currentRow[1].length > 0){
				var patt = new RegExp(currentRow[1]);
				if(currentRow[1]==".*"){
					var obj = {};
					obj.imgData = imgData;
					obj.ruleName = ruleName;
					obj.urlObj = urlObj;

					globalImageArr.push(obj);

					console.log("Global Image Arr - push"+globalImageArr);
					//console.log("regex");
					break;
				}else if(patt.test(imgData.src) && imageDimensions[0].length <= 0 && imageDimensions[1].length<=0 ){
					console.log("Patt"+patt);
					console.log("Img Src"+imgData.src);
					var obj = {};
					obj.imgData = imgData;
					obj.ruleName = ruleName;
					obj.urlObj = urlObj;

					globalImageArr.push(obj);

					console.log("Global Image Arr - push"+globalImageArr);
					//console.log("regex");
					break;
				}else if(patt.test(imgData.src) && (imageDimensions[0].length > 0 || imageDimensions[1].length > 0) ){
					/* Store on Regex */
					if(imageDimensions[0].length > 0 || imageDimensions[1].length > 0){
						var widthHeight = currentRow[2].trim().split("x");
						//Width Setting
						if(widthHeight[0].indexOf("-")>0 && widthHeight[1].indexOf("-")>0){


							// 100 - 200 400-500
							var wArr =  widthHeight[0].trim().split("-"),
								hArr =  widthHeight[1].trim().split("-");
							//Case when 100 - any
							if(wArr[1].indexOf("any")>=0 && hArr[1].indexOf("any")>=0){
								if( imgData.width>=parseInt(wArr[0]) && imgData.height >=parseInt(hArr[0]) ){
									var obj = {};
									obj.imgData = imgData;
									obj.ruleName = ruleName;
									obj.urlObj = urlObj;

									globalImageArr.push(obj);
									console.log("Global Image Arr - push"+globalImageArr);
									//console.log("height");
									break;
								}
							}else if( wArr[1].indexOf("any")>=0 && hArr[1].indexOf("any")<0 ){
								if( imgData.width>=parseInt(wArr[0]) && imgData.height>= parseInt(hArr[0]) && imgData.height<= parseInt(hArr[1])){
									var obj = {};
									obj.imgData = imgData;
									obj.ruleName = ruleName;
									obj.urlObj = urlObj;

									globalImageArr.push(obj);
									console.log("Global Image Arr - push"+globalImageArr);
									//console.log("height");
									break;
								}
							}else if( wArr[1].indexOf("any")<0 && hArr[1].indexOf("any")>=0 ){
								if( imgData.height>=parseInt(hArr[0]) && imgData.width>= parseInt(wArr[0]) && imgData.width<= parseInt(wArr[1])){
									var obj = {};
									obj.imgData = imgData;
									obj.ruleName = ruleName;
									obj.urlObj = urlObj;

									globalImageArr.push(obj);
									console.log("Global Image Arr - push"+globalImageArr);
									//console.log("height");
									break;
								}
							}else {
								if( imgData.width>= parseInt(wArr[0]) && imgData.width<= parseInt(wArr[1]) && imgData.height>= parseInt(hArr[0]) && imgData.height<= parseInt(hArr[1]) ){
									var obj = {};
									obj.imgData = imgData;
									obj.ruleName = ruleName;
									obj.urlObj = urlObj;

									globalImageArr.push(obj);
									console.log("Global Image Arr - push"+globalImageArr);
									//console.log("height");
									break;
								}
							}
						} else if(widthHeight[0].indexOf("-")>0 && widthHeight[1].indexOf("-")<0){
							//WIDTH CASE//
							//100-200 50
							var wArr =  widthHeight[0].trim().split("-");
							if(wArr[1].indexOf("any")>=0 && widthHeight[1].length>0){
								if( imgData.width>=parseInt(wArr[0]) && imgData.height ==  parseInt(widthHeight[1]) ){
									var obj = {};
									obj.imgData = imgData;
									obj.ruleName = ruleName;
									obj.urlObj = urlObj;

									globalImageArr.push(obj);
									console.log("Global Image Arr - push"+globalImageArr);
									//console.log("height");
									break;
								}
							}else if(wArr[1].indexOf("any")>=0 && widthHeight[1].length<=0){
								if( imgData.width>=parseInt(wArr[0])){
									var obj = {};
									obj.imgData = imgData;
									obj.ruleName = ruleName;
									obj.urlObj = urlObj;

									globalImageArr.push(obj);
									console.log("Global Image Arr - push"+globalImageArr);
									//console.log("height");
									break;
								}
							}else if(wArr[1].indexOf("any")<0 && widthHeight[1].length>0){
								if( imgData.width>=parseInt(wArr[0]) && imgData.width<=parseInt(wArr[1]) && imgData.height ==  parseInt(widthHeight[1]) ){
									var obj = {};
									obj.imgData = imgData;
									obj.ruleName = ruleName;
									obj.urlObj = urlObj;

									globalImageArr.push(obj);
									console.log("Global Image Arr - push"+globalImageArr);
									//console.log("height");
									break;
								}
							}else if(wArr[1].indexOf("any")<0 && widthHeight[1].length<=0){
								if( imgData.width>=parseInt(wArr[0]) && imgData.width<=parseInt(wArr[1]) ){
									var obj = {};
									obj.imgData = imgData;
									obj.ruleName = ruleName;
									obj.urlObj = urlObj;

									globalImageArr.push(obj);
									console.log("Global Image Arr - push"+globalImageArr);
									//console.log("height");
									break;
								}
							}

						} else if(widthHeight[0].indexOf("-")<0 && widthHeight[1].indexOf("-")>0){
							//HEIGHT CASE
							var hArr =  widthHeight[1].trim().split("-");
							if(hArr[1].indexOf("any")>=0 && widthHeight[0].length>0){
								if( imgData.height>=parseInt(hArr[0]) && imgData.width ==  parseInt(widthHeight[0]) ){
									var obj = {};
									obj.imgData = imgData;
									obj.ruleName = ruleName;
									obj.urlObj = urlObj;

									globalImageArr.push(obj);
									console.log("Global Image Arr - push"+globalImageArr);
									//console.log("height");
									break;
								}
							}else if(hArr[1].indexOf("any")>=0 && widthHeight[0].length<=0){
								if( imgData.height>=parseInt(hArr[0])){
									var obj = {};
									obj.imgData = imgData;
									obj.ruleName = ruleName;
									obj.urlObj = urlObj;

									globalImageArr.push(obj);
									console.log("Global Image Arr - push"+globalImageArr);
									//console.log("height");
									break;
								}
							}else if(hArr[1].indexOf("any")<0 && widthHeight[0].length>0){
								if( imgData.height>=parseInt(hArr[0]) && imgData.height<=parseInt(hArr[1]) && imgData.width ==  parseInt(widthHeight[0]) ){
									var obj = {};
									obj.imgData = imgData;
									obj.ruleName = ruleName;
									obj.urlObj = urlObj;

									globalImageArr.push(obj);
									console.log("Global Image Arr - push"+globalImageArr);
									//console.log("height");
									break;
								}
							}else if(hArr[1].indexOf("any")<0 && widthHeight[0].length<=0){
								if( imgData.height>=parseInt(hArr[0]) && imgData.height<=parseInt(hArr[1]) ){
									var obj = {};
									obj.imgData = imgData;
									obj.ruleName = ruleName;
									obj.urlObj = urlObj;

									globalImageArr.push(obj);
									console.log("Global Image Arr - push"+globalImageArr);
									//console.log("height");
									break;
								}
							}

						}
						else if(widthHeight[0].length>0 && widthHeight[1].length>0){
							if(widthHeight[0] == imgData.width && widthHeight[1] == imgData.height){

								var obj = {};
								obj.imgData = imgData;
								obj.ruleName = ruleName;
								obj.urlObj = urlObj;

								globalImageArr.push(obj);
								console.log("Global Image Arr - push"+globalImageArr);
								//console.log("height");
								break;
							}
						} else if(widthHeight[0].length>0 && widthHeight[1].length<=0){
							if(parseInt(widthHeight[0]) == imgData.width){
								var obj = {};
								obj.imgData = imgData;
								obj.ruleName = ruleName;
								obj.urlObj = urlObj;

								globalImageArr.push(obj);
								console.log("Global Image Arr - push"+globalImageArr);
								//console.log("height");
								break;
							}
						} else if(widthHeight[0].length<=0 && widthHeight[1].length>0){
							if(parseInt(widthHeight[1]) == imgData.height){
								var obj = {};
								obj.imgData = imgData;
								obj.ruleName = ruleName;
								obj.urlObj = urlObj;

								globalImageArr.push(obj);
								console.log("Global Image Arr - push"+globalImageArr);
								//console.log("height");
								break;
							}
						}
					}
				}
			} else {
				/* Store on Numb */
				if(imageDimensions[0].length > 0 || imageDimensions[1].length > 0){
					var widthHeight = currentRow[2].trim().split("x");
					//Width Setting
					if(widthHeight[0].indexOf("-")>0 && widthHeight[1].indexOf("-")>0){


						// 100 - 200 400-500
						var wArr =  widthHeight[0].trim().split("-"),
							hArr =  widthHeight[1].trim().split("-");
						//Case when 100 - any
						if(wArr[1].indexOf("any")>=0 && hArr[1].indexOf("any")>=0){
							if( imgData.width>=parseInt(wArr[0]) && imgData.height >=parseInt(hArr[0]) ){
								var obj = {};
								obj.imgData = imgData;
								obj.ruleName = ruleName;
								obj.urlObj = urlObj;

								globalImageArr.push(obj);
								console.log("Global Image Arr - push"+globalImageArr);
								//console.log("height");
								break;
							}
						}else if( wArr[1].indexOf("any")>=0 && hArr[1].indexOf("any")<0 ){
							if( imgData.width>=parseInt(wArr[0]) && imgData.height>= parseInt(hArr[0]) && imgData.height<= parseInt(hArr[1])){
								var obj = {};
								obj.imgData = imgData;
								obj.ruleName = ruleName;
								obj.urlObj = urlObj;

								globalImageArr.push(obj);
								console.log("Global Image Arr - push"+globalImageArr);
								//console.log("height");
								break;
							}
						}else if( wArr[1].indexOf("any")<0 && hArr[1].indexOf("any")>=0 ){
							if( imgData.height>=parseInt(hArr[0]) && imgData.width>= parseInt(wArr[0]) && imgData.width<= parseInt(wArr[1])){
								var obj = {};
								obj.imgData = imgData;
								obj.ruleName = ruleName;
								obj.urlObj = urlObj;

								globalImageArr.push(obj);
								console.log("Global Image Arr - push"+globalImageArr);
								//console.log("height");
								break;
							}
						}else {
							if( imgData.width>= parseInt(wArr[0]) && imgData.width<= parseInt(wArr[1]) && imgData.height>= parseInt(hArr[0]) && imgData.height<= parseInt(hArr[1]) ){
								var obj = {};
								obj.imgData = imgData;
								obj.ruleName = ruleName;
								obj.urlObj = urlObj;

								globalImageArr.push(obj);
								console.log("Global Image Arr - push"+globalImageArr);
								//console.log("height");
								break;
							}
						}



					} else if(widthHeight[0].indexOf("-")>0 && widthHeight[1].indexOf("-")<0){
						//WIDTH CASE//
						//100-200 50
						var wArr =  widthHeight[0].trim().split("-");
						if(wArr[1].indexOf("any")>=0 && widthHeight[1].length>0){
							if( imgData.width>=parseInt(wArr[0]) && imgData.height ==  parseInt(widthHeight[1]) ){
								var obj = {};
								obj.imgData = imgData;
								obj.ruleName = ruleName;
								obj.urlObj = urlObj;

								globalImageArr.push(obj);
								console.log("Global Image Arr - push"+globalImageArr);
								//console.log("height");
								break;
							}
						}else if(wArr[1].indexOf("any")>=0 && widthHeight[1].length<=0){
							if( imgData.width>=parseInt(wArr[0])){
								var obj = {};
								obj.imgData = imgData;
								obj.ruleName = ruleName;
								obj.urlObj = urlObj;

								globalImageArr.push(obj);
								console.log("Global Image Arr - push"+globalImageArr);
								//console.log("height");
								break;
							}
						}else if(wArr[1].indexOf("any")<0 && widthHeight[1].length>0){
							if( imgData.width>=parseInt(wArr[0]) && imgData.width<=parseInt(wArr[1]) && imgData.height ==  parseInt(widthHeight[1]) ){
								var obj = {};
								obj.imgData = imgData;
								obj.ruleName = ruleName;
								obj.urlObj = urlObj;

								globalImageArr.push(obj);
								console.log("Global Image Arr - push"+globalImageArr);
								//console.log("height");
								break;
							}
						}else if(wArr[1].indexOf("any")<0 && widthHeight[1].length<=0){
							if( imgData.width>=parseInt(wArr[0]) && imgData.width<=parseInt(wArr[1]) ){
								var obj = {};
								obj.imgData = imgData;
								obj.ruleName = ruleName;
								obj.urlObj = urlObj;

								globalImageArr.push(obj);
								console.log("Global Image Arr - push"+globalImageArr);
								//console.log("height");
								break;
							}
						}

					} else if(widthHeight[0].indexOf("-")<0 && widthHeight[1].indexOf("-")>0){
						//HEIGHT CASE
						var hArr =  widthHeight[1].trim().split("-");
						if(hArr[1].indexOf("any")>=0 && widthHeight[0].length>0){
							if( imgData.height>=parseInt(hArr[0]) && imgData.width ==  parseInt(widthHeight[0]) ){
								var obj = {};
								obj.imgData = imgData;
								obj.ruleName = ruleName;
								obj.urlObj = urlObj;

								globalImageArr.push(obj);
								console.log("Global Image Arr - push"+globalImageArr);
								//console.log("height");
								break;
							}
						}else if(hArr[1].indexOf("any")>=0 && widthHeight[0].length<=0){
							if( imgData.height>=parseInt(hArr[0])){
								var obj = {};
								obj.imgData = imgData;
								obj.ruleName = ruleName;
								obj.urlObj = urlObj;

								globalImageArr.push(obj);
								console.log("Global Image Arr - push"+globalImageArr);
								//console.log("height");
								break;
							}
						}else if(hArr[1].indexOf("any")<0 && widthHeight[0].length>0){
							if( imgData.height>=parseInt(hArr[0]) && imgData.height<=parseInt(hArr[1]) && imgData.width ==  parseInt(widthHeight[0]) ){
								var obj = {};
								obj.imgData = imgData;
								obj.ruleName = ruleName;
								obj.urlObj = urlObj;

								globalImageArr.push(obj);
								console.log("Global Image Arr - push"+globalImageArr);
								//console.log("height");
								break;
							}
						}else if(hArr[1].indexOf("any")<0 && widthHeight[0].length<=0){
							if( imgData.height>=parseInt(hArr[0]) && imgData.height<=parseInt(hArr[1]) ){
								var obj = {};
								obj.imgData = imgData;
								obj.ruleName = ruleName;
								obj.urlObj = urlObj;

								globalImageArr.push(obj);
								console.log("Global Image Arr - push"+globalImageArr);
								//console.log("height");
								break;
							}
						}

					}
					else if(widthHeight[0].length>0 && widthHeight[1].length>0){
						if(widthHeight[0] == imgData.width && widthHeight[1] == imgData.height){

							var obj = {};
							obj.imgData = imgData;
							obj.ruleName = ruleName;
							obj.urlObj = urlObj;

							globalImageArr.push(obj);
							console.log("Global Image Arr - push"+globalImageArr);
							//console.log("height");
							break;
						}
					} else if(widthHeight[0].length>0 && widthHeight[1].length<=0){
						if(parseInt(widthHeight[0]) == imgData.width){
							var obj = {};
							obj.imgData = imgData;
							obj.ruleName = ruleName;
							obj.urlObj = urlObj;

							globalImageArr.push(obj);
							console.log("Global Image Arr - push"+globalImageArr);
							//console.log("height");
							break;
						}
					} else if(widthHeight[0].length<=0 && widthHeight[1].length>0){
						if(parseInt(widthHeight[1]) == imgData.height){
							var obj = {};
							obj.imgData = imgData;
							obj.ruleName = ruleName;
							obj.urlObj = urlObj;

							globalImageArr.push(obj);
							console.log("Global Image Arr - push"+globalImageArr);
							//console.log("height");
							break;
						}
					}
				}
			}
			i++;
		}
	}

	function getImageData(self,ext){
		var imgData = {};
		if((typeof self.naturalWidth !== "undefined") || (typeof self.naturalHeight !== "undefined")){
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
			imgData.ext = ext;
			console.log("Enter - Patt Check");
			pattenCheck(imgData);
		}else{
			console.log(self);
			console.log($(self).width());
			console.log("I Failed");
		}
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
			console.log("ASYNC:"+imgData.src);
			self.port.emit("save-img",imgData,ruleName,urlObj,processQue,globalImageArray,downloadCounter);
		}else{
			//displayDownloadCount(downloadCounter);
		}
	}

	function intilizeLocalRulesDataAndDownload(data){
		rulesData = data.table;
		fileName = data.fileName;
		folderPath = data.folderPath;

		//$("body").prepend('<div class="g-counter"><h3>Processing...</h3></div>');

		//$(".g-counter").show().animate({"opacity":"1"});
		//console.log("START:"+window.location.href);

			globalImageArr = [];
			$.each($("img"),function(index,value){
				var url = $(this)[0].src,
					self = $(this)[0],
					extType = url.substring(url.lastIndexOf('.')+1);
				if((/jpg|jpeg|png|gif|tif/i).test(extType)){
					var ext = extType.match(/jpg|jpeg|png|gif|tif/i);
					//console.log(url);
					getImageData($(this)[0],ext);
					//console.log("EEEEEEEEEEEEEEEEEXXXXXXXXXXXXXXXXTTTTTTTTTTTTT:+"+ext);
				}else{
					AjaxRequestCount++;
					$(document).ajaxComplete(function () {
						if (AjaxRequestCount == AjaxCompleteCount) {
							asyncSetup(-1, globalImageArr, -1);
						}
					});
					var request = $.ajax({
						type: "HEAD",
						url: url,
						success: function(){
							var ct = request.getResponseHeader("content-type") || "";
							if ((/jpg|jpeg|png|gif|tif/i).test(ct)) {
								var ext =  ct.substr(ct.lastIndexOf('/') + 1).trim();
								var img = new Image;
									img.src = this.url;
									console.log(img);
								getImageData(img,ext);
								console.log("EEEEEEEEEEEEEEEEEXXXXXXXXXXXXXXXXTTTTTTTTTTTTT:+"+ext);
							}
							AjaxCompleteCount++;
						},
						error:function(xhr, ajaxOptions, thrownError){
							console.log("Error"+url);
							console.log("ERROR STATUS:"+xhr.status);
							console.log("ERROR THROWN:"+thrownError);
							AjaxCompleteCount++;
						}
					});
				}
			});

		if(AjaxRequestCount <= 0) {
			asyncSetup(-1, globalImageArr, -1);
		}
	}

	this.init = function(){
		self.port.on("send-inti-data-to-contentScript",intilizeLocalRulesDataAndDownload);
		self.port.on("send-next-img",asyncSetup);
	}
});
brains.init();