
		function success(msg) { 
			//console.log(data1[0]);
          //var jsonString = data1[0];
          var jsonPretty = JSON.stringify(msg, null, 2);
          console.log(jsonPretty);

          $('#results').text(jsonPretty);
          console.log(msg);
      }
		function error(msg) { 
		  //alert(msg)
		  //var jsonString = data1[0];
          var jsonPretty = JSON.stringify(msg, null, 2);
          //console.log(jsonPretty)
          //document.body.innerHTML += JSON.stringify(xhr,null,10)
          //document.body.innerHTML = jsonPretty
          //console.log(xhr);
			console.log(msg); 
			$('#results').text(jsonPretty);
		}

		// READ ================================================================
		// ReadMany
		// Return: Array
		function readAudit(){
		audit.read({}, success, error)
		return false;
		}

		function displayAudits(){
		audit.read({}, function(audits){
				//console.log(data1[0]);
          //var jsonString = data1[0];
          var jsonPretty = JSON.stringify(audits, null, 2);
          console.log(jsonPretty)
          //document.body.innerHTML += JSON.stringify(xhr,null,10)
          //document.body.innerHTML = jsonPretty
          //console.log(xhr);

			var tableStr = "<table style=\"width:90%; margin:auto\" class=\"table\">";
			tableStr += "<tr>";
				tableStr += "<th scope=\"col\" style=\"text-align:center;\">";
				tableStr += "ID";
				tableStr += "</th>";
				tableStr += "<th scope=\"col\" style=\"text-align:center;\">";
				tableStr += "Description";
				tableStr += "</th>";
				tableStr += "<th scope=\"col\" style=\"text-align:center;\">";
				tableStr += "Edit";
				tableStr += "</th>";
				tableStr += "<th scope=\"col\" style=\"text-align:center;\">";
				tableStr += "Delete";
				tableStr += "</th>";
			for(var i in audits){
				var audit = audits[i];
				tableStr += "<tr>";
				tableStr += "<td scope=\"col\" style=\"text-align:center;\">";
				tableStr += Number(i)+1;
				tableStr += "</td>";
				tableStr += "<td scope=\"col\" style=\"text-align:center;\">";
				tableStr += audits[i].Description;
				tableStr += "</td>";
				tableStr += "<td scope=\"col\" style=\"text-align:center;\">";
				tableStr += '<button class="btn btn-light" onclick="displayUpdateAuditForm(\''+audits[i]._id+'\');">';
				tableStr += "Edit";
				tableStr += "</button>";
				tableStr += "</td>";
				tableStr += "<td scope=\"col\" style=\"text-align:center;\">";
				tableStr += '<button class="btn btn-light" onclick="deleteAuditByID(\''+audits[i]._id+'\');">';
				tableStr += "Delete";
				tableStr += "</button>";
				tableStr += "</td>";
				tableStr += "</tr>";
			}
			tableStr += "</table>";
 		  
 		  $('#results').html(tableStr);	


		}, error)

		}

		//setup
		audit = AUDIT;
		displayAudits();

		// Read one via id
		// Return: Object
		// audit.get("5bb5e8b8467ec74b5ec111f7", success, error);

		// CREATE ==============================================================
		// Ceate one
		function createAudit(){

		// var websheet_model_id = $('#auditForm input[name=websheet_model_id]').val();
		var Description = $('#auditForm input[name=Description]').val();
		var AuditLogic = $('#auditForm input[name=AuditLogic]').val();
		var LoanTypes = $('#auditForm input[name=LoanTypes]').val();
		var ApplicableLogic = $('#auditForm input[name=ApplicableLogic]').val();
		var Category = $('#auditForm div[id=Category] .btn:first-child').val();
		var DetailsURL = $('#auditForm input[name=DetailsURL]').val();
		var LockAudit = $('#auditForm input[id=LockAudit]').is(":checked")?"true":"false";
		// var LockAudit = $('#auditForm input[name=LockAudit]').val();
		var MessageCmd = $('#auditForm input[name=MessageCmd]').val();
		var States = $('#auditForm input[name=States]').val();

		
		audit.create(
							{
							    "Description": Description,
						        "AuditLogic": AuditLogic,
						        "LoanTypes": LoanTypes,
						        "ApplicableLogic": ApplicableLogic,
						        "Category": Category,
						        "DetailsURL": DetailsURL,
						        "LockAudit": LockAudit,
						        "MessageCmd": MessageCmd,
						        "States": States
						        "HardCoded": HardCoded,
						        "IncludeUponPossing": IncludeUponPossing,
						        "JiraIssue": JiraIssue,
						        "LoanStages": LoanStages,
						        "LoanTypes": LoanTypes,
						        "LockAudit": LoanAudit,
						        "Notes": Notes,
						        "RepeatOnField": RepeatOnField,
						        "Severity": Severity,
						        "SubCategory": SubCategory
							}, 
							function (msg) { 
			//console.log(data1[0]);
          //var jsonString = data1[0];
          var jsonPretty = JSON.stringify(msg, null, 2);
          console.log(jsonPretty);
          //console.log(xhr);

          if(msg.result.ok){
          	alert("an audit is created")
          }
          else{
          	alert("error")
          }

          //$('#results').text(jsonPretty);
		displayAudits();

          console.log(msg);
      }, error); 

		return false;
		}

		// Delete by id
		function deleteAuditByID(_id){

		//var _id = $('#auditForm input[name=_id]').val();

		console.log(_id)

		if(!_id){
			alert("error")
			return;
		}

		audit.delete(	
						{ 
							"_id": _id

						}, 
							function(msg){
								console.log(msg)
								if(msg.result && msg.result.ok){
							displayAudits();
							alert("delete succeeded");
						}
						else{
							alert("delete failed");
						}
							}, error);
		return false;
		}

		// set =================================================================
		// Replace the a single document
		function replaceAudit(){
		var _id = $('#replaceAuditForm input[name=_id]').val();

		//var websheet_model_id = $('#replaceAuditForm input[name=websheet_model_id]').val();
		var Description = $('#replaceAuditForm input[name=Description]').val();
		var AuditLogic = $('#replaceAuditForm input[name=AuditLogic]').val();
		var LoanTypes = $('#replaceAuditForm input[name=LoanTypes]').val();
		var ApplicableLogic = $('#replaceAuditForm input[name=ApplicableLogic]').val();
		var Category = $('#replaceAuditForm div[id=Category] .btn:first-child').val();
		var DetailsURL = $('#replaceAuditForm input[name=DetailsURL]').val();
		var LockAudit = $('#replaceAuditForm input[id=LockAudit]').is(":checked")?"true":"false";
		//var LockAudit = $('#replaceAuditForm input[name=LockAudit]').val();
		var MessageCmd = $('#replaceAuditForm input[name=MessageCmd]').val();
		var States = $('#replaceAuditForm input[name=States]').val();
		var HardCoded = $('#replaceAuditForm input[name=HardCoded]').val();
		var IncludeUponPossing = $('#replaceAuditForm input[name=IncludeUponPossing]').val();
	    var JiraIssue = $('#replaceAuditForm, input[name=JiraIssue]').val();
		var LoanStages = $('#replaceAuditForm input[name=LoanStages]').val();
		var LoanTypes = $('#replaceAuditForm input[name=LoanTypes]').val();
		var LockAudit = $('#replaceAuditForm input[name=LockAudit]').val();
		var Notes = $('#replaceAuditForm input[name=Notes]').val();
		var HardCoded = $('#replaceAuditForm input[name=HardCoded]').val();
		var RepeatOnField = $('#replaceAuditForm input[name=RepeatOnField]').val();
		var Severity = $('#replaceAuditForm input[name=Severity]').val();
		var SubCategory = $('#replaceAuditForm input[name=SubCategory]').val();

		audit.set(_id, 
					{
						//"websheet_model_id": websheet_model_id,
						        "Description": Description,
						        "AuditLogic": AuditLogic,
						        "LoanTypes": LoanTypes,
						        "ApplicableLogic": ApplicableLogic,
						        "Category": Category,
						        "DetailsURL": DetailsURL,
						        "LockAudit": LockAudit,
						          "MessageCmd": MessageCmd,
						          "States": States,
						          "HardCoded": HardCoded,
						        "IncludeUponPossing": IncludeUponPossing,
						        "JiraIssue": JiraIssue,
						        "LoanStages": LoanStages,
						        "LoanTypes": LoanTypes,
						        "LockAudit": LoanAudit,
						        "Notes": Notes,
						        "RepeatOnField": RepeatOnField,
						        "Severity": Severity,
						        "SubCategory": SubCategory
					}, 
					success, error);
		return false;
		}

		function displayUpdateAuditForm(_id){
		audit.read(
							{
								_id:_id,
							}, 
							loadUpdateAudit, error);
		}

		// update ==============================================================
		// modify the specific fileds
		function updateAudit(){


		var _id = $('#auditForm input[name=_id]').val();

		if(!_id){
			console.log("please create/select audit first!")
			alert("please select audit by clicking edit button for updating!")
			return;
		}

		console.log(_id)

		//var websheet_model_id = $('#auditForm input[name=websheet_model_id]').val();
		var Description = $('#auditForm input[name=Description]').val();
		var AuditLogic = $('#auditForm input[name=AuditLogic]').val();
		var LoanTypes = $('#auditForm div[id=Category] .btn:first-child').val();
		var ApplicableLogic = $('#auditForm input[name=ApplicableLogic]').val();
		var Category = $('#auditForm div[id=Category] .btn:first-child').val();
		var DetailsURL = $('#auditForm input[name=DetailsURL]').val();
		// var LockAudit = $('#auditForm input[name=LockAudit]').val();
		var LockAudit = $('#auditForm input[id=LockAudit]').is(":checked")?"true":"false";
		var MessageCmd = $('#auditForm input[name=MessageCmd]').val();
		var States = $('#auditForm input[name=States]').val();
		var HardCoded = $('#auditForm input[name=HardCoded]').val();
		var IncludeUponPossing = $('#auditForm input[name=IncludeUponPossing]').val();
	    var JiraIssue = $('#auditForm, input[name=JiraIssue]').val();
		var LoanStages = $('#auditForm input[name=LoanStages]').val();
		var LoanTypes = $('#auditForm input[name=LoanTypes]').val();
		var LockAudit = $('#auditForm input[name=LockAudit]').val();
		var Notes = $('#auditForm input[name=Notes]').val();
		var HardCoded = $('#auditForm input[name=HardCoded]').val();
		var RepeatOnField = $('#auditForm input[name=RepeatOnField]').val();
		var Severity = $('#auditForm input[name=Severity]').val();
		var SubCategory = $('#auditForm input[name=SubCategory]').val();


		audit.update(_id, 
					{
						//"websheet_model_id": websheet_model_id,
						        "Description": Description,
						        "AuditLogic": AuditLogic,
						        "LoanTypes": LoanTypes,
						        "ApplicableLogic": ApplicableLogic,
						        "Category": Category,
						        "DetailsURL": DetailsURL,
						        "LockAudit": LockAudit,
						          "MessageCmd": MessageCmd,
 							       "States": States,
 							       "HardCoded": HardCoded,
						        "IncludeUponPossing": IncludeUponPossing,
						        "JiraIssue": JiraIssue,
						        "LoanStages": LoanStages,
						        "LoanTypes": LoanTypes,
						        "LockAudit": LoanAudit,
						        "Notes": Notes,
						        "RepeatOnField": RepeatOnField,
						        "Severity": Severity,
						        "SubCategory": SubCategory
					}, 
					function (msg){
						if(msg.result && msg.result.ok){
							displayAudits();
							alert("update succeeded");
						}
						else{
							alert("update failed");
						}
					}, error);
		return false;
		}

		function loadUpdateAudit(msg){
	console.log(msg[0])
	var audit = msg[0];
	if(!audit){
		alert("error");
		return false;
	}

        $('#auditForm #_id').attr("value", audit._id);
		$('#auditForm #_id').attr("placeholder", audit._id);
		$('#auditForm #Description').attr("value", audit.Description);
		$('#auditForm #Description').attr("placeholder", audit.Description);
		$('#auditForm #AuditLogic').attr("value", audit.AuditLogic);
		$('#auditForm #AuditLogic').attr("placeholder", audit.AuditLogic);
		$('#auditForm #LoanTypes').attr("value", audit.LoanTypes);
		$('#auditForm #LoanTypes').attr("placeholder", audit.LoanTypes);
		$('#auditForm #ApplicableLogic').attr("value", audit.ApplicableLogic);
		$('#auditForm #ApplicableLogic').attr("placeholder", audit.ApplicableLogic);
		$('#auditForm #Catetory').attr("value", audit.Category);
		$('#auditForm #Category #dropdownMenuButton').html(audit.Category);
		$('#auditForm #DetailsURL').attr("value", audit.DetailsURL);
		$('#auditForm #DetailsURL').attr("placeholder", audit.DetailsURL);
		$('#auditForm #LockAudit').attr("value", audit.LockAudit);
		audit.LockAudit?$('#auditForm #LockAudit').attr("checked"):$('#auditForm #LockAudit').removeAttr("checked");
		$('#auditForm #MessageCmd').attr("value", audit.MessageCmd);
		$('#auditForm #MessageCmd').attr("placeholder", audit.MessageCmd);
		$('#auditForm #States').attr("value", audit.States);
		$('#auditForm #States').attr("placeholder", audit.States);
		$('#auditForm #ApplicableLogic').attr("value", audit.ApplicableLogic);
		$('#auditForm #ApplicableLogic').attr("placeholder", audit.ApplicableLogic);
		$('#auditForm #Catetory').attr("value", audit.Category);
		$('#auditForm #Category #dropdownMenuButton').html(audit.Category);
		$('#auditForm #DetailsURL').attr("value", audit.DetailsURL);
		$('#auditForm #DetailsURL').attr("placeholder", audit.DetailsURL);
		$('#auditForm #LockAudit').attr("value", audit.LockAudit);
		audit.LockAudit?$('#auditForm #LockAudit').attr("checked"):$('#auditForm #LockAudit').removeAttr("checked");
		$('#auditForm #MessageCmd').attr("value", audit.MessageCmd);
		$('#auditForm #MessageCmd').attr("placeholder", audit.MessageCmd);
		$('#auditForm #States').attr("value", audit.States);
		$('#auditForm #States').attr("placeholder", audit.States);
		$('#auditForm #HardCoded').attr("value", audit.Category);
		$('#auditForm #HardCoded #dropdownMenuButton').html(audit.Category);
		$('#auditForm #IncludeUponPossing').attr("value", audit.DetailsURL);
		$('#auditForm #IncludeUponPossing').attr("placeholder", audit.DetailsURL);
		$('#auditForm #JiraIssue').attr("value", audit.LockAudit);
		audit.JiraIssue?$('#auditForm #LockAudit').attr("checked"):$('#auditForm #LockAudit').removeAttr("checked");
		$('#auditForm #LoanStages').attr("value", audit.LoanStages);
		$('#auditForm #LoanStages').attr("placeholder", audit.LoanStages);
		$('#auditForm #Notes').attr("value", audit.Notes);
		$('#auditForm #Notes').attr("placeholder", audit.Notes);
		$('#auditForm #LoanStages').attr("value", audit.RepeatOnField);
		$('#auditForm #LoanStages').attr("placeholder", audit.RepeatOnField);
		$('#auditForm #Severity').attr("value", audit.Severity);
		$('#auditForm #Severity').attr("placeholder", audit.Severity);
		$('#auditForm #SubCategory').attr("value", audit.SubCategory);
		$('#auditForm #SubCategory').attr("placeholder", audit.SubCategory);
			
    $(".dropdown-menu a").click(function(){

      $(this).closest(".dropdown").find(".btn:first-child").text($(this).text());
       $(this).closest(".dropdown").find(".btn:first-child").val($(this).text());

   });

}