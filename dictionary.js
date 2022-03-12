var popupVisible = false;

//gets JSON dict as promise
async function fetchJSONDict() {
    let response = await fetch(chrome.runtime.getURL('./dictionary.json'));
    return response;
}

//searches for word and returns dictionary entries for word
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
    if (window.getSelection) {
        //this is the highlighted text
        let selection = window.getSelection();
        var text = selection.toString();
        var range = selection.getRangeAt(0);

        //this is the solution to the highlight problem
        var newRange = document.createRange();
        newRange.setStart(selection.focusNode, selection.startOffset);

		var popupDictionaryWindow = document.createElement('span');
        popupDictionaryWindow.id = 'hawaiian-popup-dictionary'
		popupDictionaryWindow.style = 'margin-top: 35px; width: 360px;font-size: 14px;font-family: Arial, Helvetica, sans-serif; background-color: #555;color: #fff;border-radius: 6px;padding: 8px 0;position: absolute;z-index: 1;';

        //show word and defenitions
        searchWord(text).then(defenitions => {
			popupDictionaryWindow.innerHTML = "<p style='text-align: center;'><b style='font-size: 18px;'>" + text + "</b></p>";
            for (var i = 0; i < defenitions.length; i++) {
                popupDictionaryWindow.innerHTML += "<hr><li style='padding: 10px;'>" + defenitions[i] + "</li>"

                //just an asthetic thing for now
                if (i == 3) {break;}
            }
            popupDictionaryWindow.innerHTML += "</ul>"
            //place node at newRange instead of range
			newRange.insertNode(popupDictionaryWindow);
		});
        popupVisible = true;
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