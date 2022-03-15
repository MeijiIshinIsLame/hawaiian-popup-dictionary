var popupVisible = false;

//gets JSON dict as promise
async function fetchJSONDict() {
    let response = await fetch(chrome.runtime.getURL('./dictionary2.json'));
    return response;
}

//searches for word and returns dictionary entries for word
async function searchWord(word) {
    definitions = [];
    word = word.toLowerCase();

    let response = await fetchJSONDict();
    let data = await response.text();
    var dictInJSON = JSON.parse(data);

    for (var i = 0; i < dictInJSON["data"].length; i++){
         if (dictInJSON["data"][i]["word"].toLowerCase() == word){
            for (var j = 0; j < dictInJSON["data"][i]["definitions"].length; j++)
            definitions.push(dictInJSON["data"][i]["definitions"][j]["dtxt"]);
        }
    }
    return definitions
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

        //show word and definitions
        searchWord(text).then(definitions => {
			popupDictionaryWindow.innerHTML = "<p style='text-align: center;'><b style='font-size: 18px;'>" + text + "</b></p>";

            var maxLength;
            if (definitions.length < maxLength) {
                maxLength = definitions.length
            }
            else {
                maxLength = 3;
            }

            for (var i = 0; i < maxLength; i++) {
                popupDictionaryWindow.innerHTML += "<hr><li style='padding: 10px;'>" + definitions[i] + "</li>"
            }
            //place node at newRange instead of range
			newRange.insertNode(popupDictionaryWindow);
                
            if (definitions.length >= 3) {
                    document.addEventListener('keydown', nextPage);
                    document.addEventListener('keydown', prevPage);
                    popupDictionaryWindow.innerHTML += "<hr><p style='padding: 10px;'>More definitions --></p>"
                    console.log("nextpage");
                    function nextPage(e) {
                        console.log(definitions.length)
                        if(e.keyCode === 39 || e.charCode === 39) {
                            var lastMaxLength = maxLength;
                            if (definitions.length - maxLength <= 3) {
                                maxLength += 3;
                            }
                            else {
                                maxLength = definitions.length;
                            }
                            console.log(`maxlength ${maxLength} | i ${i}`);
                            for (var i = lastMaxLength; i < maxLength; i++) {
                                //wipe defs then update page
                                popupDictionaryWindow.innerHTML = ""
                                popupDictionaryWindow.innerHTML += "<hr><li style='padding: 10px;'>" + definitions[i] + "</li>"
                            }
                        }
                    }
                    function prevPage(e) {
                        if (e.keycode === 37 || e.charCode === 37) {
                            console.log("left pressed");
                            var lastMaxLength = maxLength;
                            if (definitions.length - maxLength >= 3) {
                                maxLength -= 3;
                            }
                            else{
                                maxLength = definitions.length;
                            }
                            console.log(`maxlength ${maxLength} | i ${i}`);
                            for (var i = lastMaxLength; i < maxLength; i++) {
                                //wipe defs then update page
                                popupDictionaryWindow.innerHTML = ""
                                popupDictionaryWindow.innerHTML += "<hr><li style='padding: 10px;'>" + definitions[i] + "</li>"
                            }
                        }
                    }
                }
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