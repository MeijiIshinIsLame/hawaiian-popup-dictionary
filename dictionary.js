var popupVisible = false;

async function fetchJSONDict() {
    let response = await fetch(chrome.runtime.getURL('./dictionary.json'));
    return response;
}

async function searchWord(word) {
    defenitions = [];
    word = word.toLowerCase();

    let response = await fetchJSONDict();
    let data = await response.text();
    var dictInJSON = JSON.parse(data);
    for (var i = 0; i < dictInJSON["data"].length; i++){
         if (dictInJSON["data"][i]["word"].toLowerCase() == word){
            for (var j = 0; j < dictInJSON["data"][i]["definitions"].length; j++)
            defenitions.push(dictInJSON["data"][i]["definitions"][j]["dtxt"]);
  }
}
return defenitions
}

function insertPopupDict() {
    var selection = "";
    range = "";
    if (window.getSelection) {
        selection = window.getSelection();
        text = selection.toString();
        range = selection.getRangeAt(0);

		var popupDictionaryWindow = document.createElement('span');
        popupDictionaryWindow.id = 'hawaiian-popup-dictionary'
		popupDictionaryWindow.style = 'margin-top: 35px; width: 360px;background-color: #555;color: #fff;text-align: center;border-radius: 6px;padding: 8px 0;position: absolute;z-index: 1;';
		searchWord(text).then(defenitions => {
			popupDictionaryWindow.innerHTML = text + "<hr><br>";
            for (var i = 0; i < defenitions.length; i++) {
                popupDictionaryWindow.innerHTML += defenitions[i] + "<br><br>"
            }
			range.insertNode(popupDictionaryWindow);
		});
        popupVisible = true;
        document.getSelection().removeAllRanges();
    }
}

function getSelectionText() {
    var text = "";
    if (window.getSelection) {
        text = window.getSelection().toString();
    }
    return text;
}

function shiftDowned(e) {
    if(e.keyCode === 16 || e.charCode === 16){
        if (popupVisible) {
            var popupwindow = document.getElementById("hawaiian-popup-dictionary");
            popupwindow.remove();
            popupVisible = false;
        }
        else {
            insertPopupDict();
    }
}
}

document.addEventListener('keydown', shiftDowned);