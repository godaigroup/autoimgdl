var addRule = new(function(){
	"use strict";
	var me = this,
		table       = $(".table"),
		tr          = $(".table tr"),
		ruleName    = $("#rule-name"),
		patternRx   = $("#pattern"),
		imageHeight = $("#image-height"),
		imageWidth  = $("#image-width"),
		addBtn      = $(".add-btn"),
		deleteBtn   = $(".delete-btn"),
		saveBtn     = $(".save-btn");

	this.init = function(){
		addBtn.on("click",addRow);
		tr.on("click",highlightRow);
		deleteBtn.on("click",deleteRow);
		saveBtn.on('click',save);
		load_data();

	};

	function addRow(){
		var nextRow = table[0].rows.length,
			row             = table[0].insertRow(nextRow),
			cell1           = row.insertCell(0),
			cell2           = row.insertCell(1),
			cell3           = row.insertCell(2),
			cell4           = row.insertCell(2);

		cell1.innerHTML = nextRow;
		cell2.innerHTML = ruleName.val();
		cell3.innerHTML = patternRx.val();
		cell4.innerHTML = imageWidth.val()+" x "+imageHeight.val();

		//New Dom Iteration so Bind and unbind events and clear Cache.
		$(".table tr").off("click",highlightRow);
		$(".table tr").on("click",highlightRow);
	}

	function highlightRow(){
		if(!$(this).hasClass("uneditable")){
			if($(this).hasClass("warning")){
				$(this).removeClass("warning");
			}else{
				$(this).addClass("warning");
			}
		}
	}

	function deleteRow(){
		$(".warning").remove();
		var rowLength = $(".table")[0].rows.length-1;

		for(var i = 1; i<= rowLength;){
				var x = $(".table")[0].rows[i].cells[0];
				x.innerHTML = i;
			i++
		}
	}

	 function packageDataToSend(){
		var data ={
			table:[],
			fileName              :$("#file-name").val(),
			folderPath            :$("#folder-path").val(),
			siteDomainAsNewFolder :false
		};
		var rowLength = $(".table")[0].rows.length-1;
		for(var i = 1; i<= rowLength;){
			var col = [];
			for(var y=1;y<=3;){
				var x = $(".table")[0].rows[i].cells[y];
				col.push(x.innerHTML);
				y++;
			}
			data.table.push(col);
			i++;
		}
		return data;
	}

	function save(){
		console.log(packageDataToSend());
		service.send(service.sendDataFromSettingToApp,packageDataToSend());
	}

	function load_data(){
		self.port.on("load-init-data", function() {
			alert("hello");
			$("html").hide();
		});
	}
});
addRule.init();