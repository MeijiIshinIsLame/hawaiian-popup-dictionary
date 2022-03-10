async function fetchJSONDict() {
    let response = await fetch(chrome.runtime.getURL('./testfile.json'));
    return response;
}

async function searchWord(word) {
	let response = await fetchJSONDict();
	let data = await response.text();
	var dictInJSON = JSON.parse(data);
	for (var i = 0; i < dictInJSON["data"].length; i++){
 		 if (dictInJSON["data"][i]["word"] == word){
 		 	for (var j = 0; j < dictInJSON["data"][i]["definitions"].length; j++)
 		 	console.log(dictInJSON["data"][i]["definitions"][j]["dtxt"]);
  }
}
console.log("---------------------")
}

function getSelectionText() {
    var text = "";
    if (window.getSelection) {
        text = window.getSelection().toString();
    } else if (document.selection && document.selection.type != "Control") {
        text = document.selection.createRange().text;
    }
    return text;
}

function shiftDowned() {
        console.log(getSelectionText());
        searchWord(getSelectionText());
}

document.addEventListener('keydown', shiftDowned);