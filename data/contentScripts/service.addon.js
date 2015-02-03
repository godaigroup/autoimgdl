var service = new(function(){
	this.sendDataFromSettingToApp = "send-data-from-options-to-app";
	"use strict";
	this.send = function(message,data){
		self.port.emit(message,data);
	};

	this.recieve = function(message,cbk){

	}
});