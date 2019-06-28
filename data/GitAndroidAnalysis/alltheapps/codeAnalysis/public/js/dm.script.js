
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
function readAudit() {
	audit.read({}, success, error)
	return false;
}

function displayAudits() {
	audit.read({}, function (audits) {
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
		for (var i in audits) {
			var audit = audits[i];
			tableStr += "<tr>";
			tableStr += "<td scope=\"col\" style=\"text-align:center;\">";
			tableStr += Number(i) + 1;
			tableStr += "</td>";
			tableStr += "<td scope=\"col\" style=\"text-align:center;\">";
			tableStr += audits[i].Description;
			tableStr += "</td>";
			tableStr += "<td scope=\"col\" style=\"text-align:center;\">";
			tableStr += '<button class="btn btn-light" onclick="displayUpdateAuditForm(\'' + audits[i]._id + '\');">';
			tableStr += "Edit";
			tableStr += "</button>";
			tableStr += "</td>";
			tableStr += "<td scope=\"col\" style=\"text-align:center;\">";
			tableStr += '<button class="btn btn-light" onclick="deleteAuditByID(\'' + audits[i]._id + '\');">';
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
function createAudit() {

	// var websheet_model_id = $('#auditForm input[name=websheet_model_id]').val();
	var Description = $('#auditForm input[name=Description]').val();
	var AuditLogic = $('#auditForm input[name=AuditLogic]').val();
	var LoanTypes = $('#auditForm input[name=LoanTypes]').val();
	var ApplicableLogic = $('#auditForm input[name=ApplicableLogic]').val();
	var Category = $('#auditForm div[id=Category] .btn:first-child').val();
	var DetailsURL = $('#auditForm input[name=DetailsURL]').val();
	var LockAudit = $('#auditForm input[id=LockAudit]').is(":checked") ? "true" : "false";
	// var LockAudit = $('#auditForm input[name=LockAudit]').val();
	var MessageCmd = $('#auditForm input[name=MessageCmd]').val();
	var States = $('#auditForm input[name=States]').val();

			var HardCoded = $('#auditForm input[name=HardCoded]').val();
			var IncludeUponPossing = $('#auditForm input[name=IncludeUponPossing]').val();
			var JiraIssue = $('#auditForm input[name=JiraIssue]').val();
			var LoanStages = $('#auditForm input[name=LoanStages]').val();
			var LoanTypes = $('#auditForm input[name=LoanTypes]').val();
			var Notes = $('#auditForm input[name=Notes]').val();
			var RepeatOnField = $('#auditForm input[name=RepeatOnField]').val();
			var Severity = $('#auditForm input[name=Severity]').val();
			var SubCategory = $('#auditForm input[name=SubCategory]').val();


			"User": User,
			"NoteComment": NoteComment,
			"InceptionDate": InceptionDate,
			"LastValidationDate": LastValidationDate,
			"ValidationMonths": ValidationMonths,
			"FirstValidationBy": FirstValidationBy,
			"SecondValidationBy": SecondValidationBy,
			"OwnedByGroup": OwnedByGroup,

var User = $('#auditForm input[name=User]').val();
var NoteComment = $('#auditForm input[name=NoteComment]').val();
var InceptionDate = $('#auditForm input[name=InceptionDate]').val();
var LastValidationDate = $('#auditForm input[name=LastValidationDate]').val();
var ValidationMonths = $('#auditForm input[name=ValidationMonths]').val();
var FirstValidationBy = $('#auditForm input[name=FirstValidationBy]').val();
var SecondValidationBy = $('#auditForm input[name=SecondValidationBy]').val();
var OwnedByGroup = $('#auditForm input[name=OwnedByGroup]').val();






			// //second screen
			// "ApplicableScript": ApplicableScript,
			// "AuditScript": AuditScript,
			// "ReturnPos":ReturnPos,
			// "MISMOPath": MISMOPath,
			// "WebsheetPath": WebsheetPath,
			// "FieldName": FieldName,
			// "DataType": DataType,
			// "DataFormat": DataFormat,
			// "RequiredField": RequiredField,
			// "MessageText": MessageText,
			// "ListSource": ListSource

var User = $('#auditForm input[name=User]').val();
var User = $('#auditForm input[name=User]').val();
var User = $('#auditForm input[name=User]').val();
var User = $('#auditForm input[name=User]').val();
var User = $('#auditForm input[name=User]').val();
var User = $('#auditForm input[name=User]').val();
var User = $('#auditForm input[name=User]').val();
var User = $('#auditForm input[name=User]').val();
var User = $('#auditForm input[name=User]').val();
var User = $('#auditForm input[name=User]').val();
var User = $('#auditForm input[name=User]').val();
var User = $('#auditForm input[name=User]').val();


	audit.create(
		{
			"Description": Description,
			"AuditLogic": AuditLogic,
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
			"Notes": Notes,
			"RepeatOnField": RepeatOnField,
			"Severity": Severity,
			"SubCategory": SubCategory,
			//second screen
			"Date": Date,
			"Time": Time,
			"User": User,
			"NoteComment": NoteComment,
			"InceptionDate": InceptionDate,
			"LastValidationDate": LastValidationDate,
			"ValidationMonths": ValidationMonths,
			"FirstValidationBy": FirstValidationBy,
			"SecondValidationBy": SecondValidationBy,
			"OwnedByGroup": OwnedByGroup,
			//second screen
			"ApplicableScript": ApplicableScript,
			"AuditScript": AuditScript,
			"ReturnPos":ReturnPos,
			"MISMOPath": MISMOPath,
			"WebsheetPath": WebsheetPath,
			"FieldName": FieldName,
			"DataType": DataType,
			"DataFormat": DataFormat,
			"RequiredField": RequiredField,
			"MessageText": MessageText,
			"ListSource": ListSource
		},
		function (msg) {
			//console.log(data1[0]);
			//var jsonString = data1[0];
			var jsonPretty = JSON.stringify(msg, null, 2);
			console.log(jsonPretty);
			//console.log(xhr);

			if (msg.result.ok) {
				alert("an audit is created")
			}
			else {
				alert("error")
			}

			//$('#results').text(jsonPretty);
			displayAudits();

			console.log(msg);
		}, error);

	return false;
}

// Delete by id
function deleteAuditByID(_id) {

	//var _id = $('#auditForm input[name=_id]').val();

	console.log(_id)

	if (!_id) {
		alert("error")
		return;
	}

	audit.delete(
		{
			"_id": _id

		},
		function (msg) {
			console.log(msg)
			if (msg.result && msg.result.ok) {
				displayAudits();
				alert("delete succeeded");
			}
			else {
				alert("delete failed");
			}
		}, error);
	return false;
}

// set =================================================================
// Replace the a single document
function replaceAudit() {
	var _id = $('#replaceAuditForm input[name=_id]').val();

	//var websheet_model_id = $('#replaceAuditForm input[name=websheet_model_id]').val();
	var Description = $('#replaceAuditForm input[name=Description]').val();
	var AuditLogic = $('#replaceAuditForm input[name=AuditLogic]').val();
	var LoanTypes = $('#replaceAuditForm div[id=LoanTypes] .btn:first-child').val();
	var ApplicableLogic = $('#replaceAuditForm input[name=ApplicableLogic]').val();
	var Category = $('#replaceAuditForm div[id=Category] .btn:first-child').val();
	var DetailsURL = $('#replaceAuditForm input[name=DetailsURL]').val();
	var LockAudit = $('#replaceAuditForm input[id=LockAudit]').is(":checked") ? "true" : "false";
	//var LockAudit = $('#replaceAuditForm input[name=LockAudit]').val();
	var MessageCmd = $('#replaceAuditForm input[name=MessageCmd]').val();
	var States = $('#replaceAuditForm div[id=States] .btn:first-child').val();
	var HardCoded = $('#replaceAuditForm input[name=HardCoded]').val();
	var IncludeUponPossing = $('#replaceAuditForm input[name=IncludeUponPossing]').val();
	var JiraIssue = $('#replaceAuditForm, input[name=JiraIssue]').val();
	var LoanStages = $('#replaceAuditForm div[id=LoanStages] .btn:first-child').val();
	var LoanTypes = $('#replaceAuditForm input[name=LoanTypes]').val();
	var LockAudit = $('#replaceAuditForm input[name=LockAudit]').val();
	var Notes = $('#replaceAuditForm input[name=Notes]').val();
	var HardCoded = $('#replaceAuditForm input[name=HardCoded]').val();
	var RepeatOnField = $('#replaceAuditForm input[name=RepeatOnField]').val();
	var Severity = $('#replaceAuditForm div[id=Severity] .btn:first-child').val();
	var SubCategory = $('#replaceAuditForm div[id=SubCategory] .btn:first-child').val();


	var Date = $('#replaceAuditForm div[id=Date] .btn:first-child').val();
	var Time = $('#replaceAuditForm input[name=Time]').val();
	var User = $('#replaceAuditForm input[name=User]').val();
	var NoteComment = $('#replaceAuditForm div[id=NoteComment] .btn:first-child').val();
	var InceptionDate = $('#replaceAuditForm input[name=InceptionDate]').val();
	var LastValidationDate = $('#replaceAuditForm input[name=LastValidationDate]').val();
	var ValidationMonths = $('#replaceAuditForm div[id=ValidationMonths] .btn:first-child').val();
	var FirstValidationBy = $('#replaceAuditForm input[name=FirstValidationBy]').val();
	var SecondValidationBy = $('#replaceAuditForm input[name=SecondValidationBy]').val();
	var OwnedByGroup = $('#replaceAuditForm div[id=OwnedByGroup] .btn:first-child').val();
	var ApplicableScript = $('#replaceAuditForm input[name=ApplicableScript]').val();
	var AuditScript = $('#replaceAuditForm input[name=AuditScript]').val();
	var ReturnPos = $('#replaceAuditForm div[id=ReturnPos] .btn:first-child').val();
	var MISMOPath = $('#replaceAuditForm input[name=MISMOPath]').val();
	var WebsheetPath = $('#replaceAuditForm input[name=WebsheetPath]').val();
	var FieldName = $('#replaceAuditForm div[id=FieldName] .btn:first-child').val();
	var DataType = $('#replaceAuditForm input[name=DataType]').val();
	var DataFormat = $('#replaceAuditForm input[name=DataFormat]').val();
	var RequiredField = $('#replaceAuditForm div[id=RequiredField] .btn:first-child').val();
	var MessageText = $('#replaceAuditForm input[name=MessageText]').val();
	var ListSource = $('#replaceAuditForm input[name=ListSource]').val();

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
			"SubCategory": SubCategory,
	//second screen
			"Date": Date,
			"Time": Time,
			"User": User,
			"NoteComment": NoteComment,
			"InceptionDate": InceptionDate,
			"LastValidationDate": LastValidationDate,
			"ValidationMonths": ValidationMonths,
			"FirstValidationBy": FirstValidationBy,
			"SecondValidationBy": SecondValidationBy,
			"OwnedByGroup": OwnedByGroup,
			//second screen
			"ApplicableScript": ApplicableScript,
			"AuditScript": AuditScript,
			"ReturnPos":ReturnPos,
			"MISMOPath": MISMOPath,
			"WebsheetPath": WebsheetPath,
			"FieldName": FieldName,
			"DataType": DataType,
			"DataFormat": DataFormat,
			"RequiredField": RequiredField,
			"MessageText": MessageText,
			"ListSource": ListSource
		},
		success, error);
	return false;
}

function displayUpdateAuditForm(_id) {
	audit.read(
		{
			_id: _id,
		},
		loadUpdateAudit, error);
}

// update ==============================================================
// modify the specific fileds
function updateAudit() {


	var _id = $('#auditForm input[name=_id]').val();

	if (!_id) {
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
	var LockAudit = $('#auditForm input[id=LockAudit]').is(":checked") ? "true" : "false";
	var MessageCmd = $('#auditForm input[name=MessageCmd]').val();
	var States = $('#auditForm div[id=States] .btn:first-child').val();
	var HardCoded = $('#auditForm input[name=HardCoded]').val();
	var IncludeUponPossing = $('#auditForm input[name=IncludeUponPossing]').val();
	var JiraIssue = $('#auditForm, input[name=JiraIssue]').val();
	var LoanStages = $('#auditForm div[id=LoanStages] .btn:first-child').val();
	var LoanTypes = $('#auditForm input[name=LoanTypes]').val();
	var LockAudit = $('#auditForm input[name=LockAudit]').val();
	var Notes = $('#auditForm input[name=Notes]').val();
	var RepeatOnField = $('#auditForm input[name=RepeatOnField]').val();
	var Severity = $('#auditForm div[id=Severity] .btn:first-child').val();
	var SubCategory = $('#auditForm div[id=SubCategory] .btn:first-child').val();

	var Date = $('#auditForm div[id=Date] .btn:first-child').val();
	var Time = $('#auditForm div[id=Time] .btn:first-child').val();
	var User = $('#auditForm div[id=User] .btn:first-child').val();
	var NoteComment = $('#auditForm div[id=NoteComment] .btn:first-child').val();
	var InceptionDate = $('#auditForm div[id=InceptionDate] .btn:first-child').val();
	var LastValidationDate = $('#auditForm div[id=LastValidationDate] .btn:first-child').val();
	var ValidationMonths = $('#auditForm div[id=ValidationMonths] .btn:first-child').val();
	var FirstValidationBy = $('#auditForm div[id=FirstValidationBy] .btn:first-child').val();
	var SecondValidationBy = $('#auditForm div[id=SecondValidationBy] .btn:first-child').val();
	var OwnedByGroup = $('#auditForm div[id=OwnedByGroup] .btn:first-child').val();
	var ApplicableScript = $('#auditForm div[id=ApplicableScript] .btn:first-child').val();
	var AuditScript = $('#auditForm div[id=AuditScript] .btn:first-child').val();
			var ReturnPos = $('#auditForm div[id=ReturnPos] .btn:first-child').val();
			var MISMOPath = $('#auditForm div[id=MISMOPath] .btn:first-child').val();
			var WebsheetPath = $('#auditForm div[id=WebsheetPath] .btn:first-child').val();
			var FieldName = $('#auditForm div[id=FieldName] .btn:first-child').val();
			var DataType = $('#auditForm div[id=DataType] .btn:first-child').val();
			var DataFormat = $('#auditForm div[id=DataFormat] .btn:first-child').val();
			var RequiredField = $('#auditForm div[id=RequiredField] .btn:first-child').val();
			var MessageText = $('#auditForm div[id=MessageText] .btn:first-child').val();
			var ListSource = $('#auditForm div[id=ListSource] .btn:first-child').val();


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
			"SubCategory": SubCategory,
			//second screen
			"Date": Date,
			"Time": Time,
			"User": User,
			"NoteComment": NoteComment,
			"InceptionDate": InceptionDate,
			"LastValidationDate": LastValidationDate,
			"ValidationMonths": ValidationMonths,
			"FirstValidationBy": FirstValidationBy,
			"SecondValidationBy": SecondValidationBy,
			"OwnedByGroup": OwnedByGroup,
			//second screen
			"ApplicableScript": ApplicableScript,
			"AuditScript": AuditScript,
			"ReturnPos":ReturnPos,
			"MISMOPath": MISMOPath,
			"WebsheetPath": WebsheetPath,
			"FieldName": FieldName,
			"DataType": DataType,
			"DataFormat": DataFormat,
			"RequiredField": RequiredField,
			"MessageText": MessageText,
			"ListSource": ListSource


		},
		function (msg) {
			if (msg.result && msg.result.ok) {
				displayAudits();
				alert("update succeeded");
			}
			else {
				alert("update failed");
			}
		}, error);
	return false;
}

function loadUpdateAudit(msg) {
	console.log(msg[0])
	var audit = msg[0];
	if (!audit) {
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
	audit.LockAudit ? $('#auditForm #LockAudit').attr("checked") : $('#auditForm #LockAudit').removeAttr("checked");
	$('#auditForm #MessageCmd').attr("value", audit.MessageCmd);
	$('#auditForm #MessageCmd').attr("placeholder", audit.MessageCmd);
	$('#auditForm #States').attr("value", audit.States);
	$('#auditForm #States #dropdownMenuButton').html(audit.States);
	$('#auditForm #HardCoded').attr("value", audit.HardCoded);
    audit.HardCoded ? $('#auditForm #HardCoded').attr("checked") : $('#auditForm #HardCoded').removeAttr("checked");
	$('#auditForm #IncludeUponPossing').attr("value", audit.IncludeUponPossing);
	audit.IncludeUponPossing ? $('#auditForm #IncludeUponPossing').attr("checked") : $('#auditForm #IncludeUponPossing').removeAttr("checked");
	$('#auditForm #JiraIssue').attr("value", audit.JiraIssue);
    $('#auditForm #JiraIssue').attr("placeholder", audit.JiraIssue);
	$('#auditForm #LoanStages').attr("value", audit.LoanStages);
	$('#auditForm #LoanStages #dropdownMenuButton').html(audit.LoanStages);
	$('#auditForm #Notes').attr("value", audit.Notes);
	$('#auditForm #Notes').attr("placeholder", audit.Notes);
	$('#auditForm #RepeatOnField').attr("value", audit.RepeatOnField);
	$('#auditForm #RepeatOnField').attr("placeholder", audit.RepeatOnField);
	$('#auditForm #Severity').attr("value", audit.Severity);
	$('#auditForm #Severity #dropdownMenuButton').html(audit.Severity);
	$('#auditForm #SubCategory').attr("value", audit.SubCategory);
	$('#auditForm #SubCategory #dropdownMenuButton').html(audit.SubCategory);

	$('#auditForm #Date').attr("value", audit.Date);
	$('#auditForm #Date #dropdownMenuButton').html(audit.Date);
	$('#auditForm #Time').attr("value", audit.Time);
	$('#auditForm #Time #dropdownMenuButton').html(audit.Time);
	$('#auditForm #User').attr("value", audit.User);
	$('#auditForm #User #dropdownMenuButton').html(audit.User);
	$('#auditForm #NoteComment').attr("value", audit.NoteComment);
	$('#auditForm #NoteComment #dropdownMenuButton').html(audit.NoteComment);
	$('#auditForm #InceptionDate').attr("value", audit.InceptionDate);
	$('#auditForm #InceptionDate #dropdownMenuButton').html(audit.InceptionDate);
	$('#auditForm #LastValidationDate').attr("value", audit.LastValidationDate);
	$('#auditForm #LastValidationDate #dropdownMenuButton').html(audit.LastValidationDate);
	$('#auditForm #FirstValidationBy').attr("value", audit.FirstValidationBy);
	$('#auditForm #FirstValidationBy #dropdownMenuButton').html(audit.FirstValidationBy);
	$('#auditForm #SecondValidationBy').attr("value", audit.SecondValidationBy);
	$('#auditForm #SecondValidationBy #dropdownMenuButton').html(audit.SecondValidationBy);
	$('#auditForm #OwnedByGroup').attr("value", audit.OwnedByGroup);
	$('#auditForm #OwnedByGroup #dropdownMenuButton').html(audit.OwnedByGroup);
	
	$('#auditForm #ApplicableScript').attr("value", audit.ApplicableScript);
	$('#auditForm #ApplicableScript #dropdownMenuButton').html(audit.ApplicableScript);
	$('#auditForm #AuditScript').attr("value", audit.AuditScript);
	$('#auditForm #AuditScript #dropdownMenuButton').html(audit.AuditScript);
	$('#auditForm #ReturnPos').attr("value", audit.ReturnPos);
	$('#auditForm #ReturnPos #dropdownMenuButton').html(audit.ReturnPos);
	$('#auditForm #MISMOPath').attr("value", audit.MISMOPath);
	$('#auditForm #MISMOPath #dropdownMenuButton').html(audit.MISMOPath);
	$('#auditForm #WebsheetPath').attr("value", audit.WebsheetPath);
	$('#auditForm #WebsheetPath #dropdownMenuButton').html(audit.WebsheetPath);
	$('#auditForm #FieldName').attr("value", audit.FieldName);
	$('#auditForm #FieldName #dropdownMenuButton').html(audit.FieldName);

	$('#auditForm #DataType').attr("value", audit.DataType);
	$('#auditForm #DataType #dropdownMenuButton').html(audit.DataType);
	$('#auditForm #DataFormat').attr("value", audit.DataFormat);
	$('#auditForm #DataFormat #dropdownMenuButton').html(audit.DataFormat);
	$('#auditForm #RequiredField').attr("value", audit.RequiredField);
	$('#auditForm #RequiredField #dropdownMenuButton').html(audit.RequiredField);
	$('#auditForm #MessageText').attr("value", audit.MessageText);
	$('#auditForm #MessageText #dropdownMenuButton').html(audit.MessageText);
	$('#auditForm #ListSource').attr("value", audit.ListSource);
	$('#auditForm #ListSource #dropdownMenuButton').html(audit.ListSource);

	$(".dropdown-menu a").click(function () {

		$(this).closest(".dropdown").find(".btn:first-child").text($(this).text());
		$(this).closest(".dropdown").find(".btn:first-child").val($(this).text());

	});

}