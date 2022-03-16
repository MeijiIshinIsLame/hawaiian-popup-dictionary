var popupVisible = false;
const RIGHTARROW = 39;
const LEFTARROW = 37;
const SHIFT = 16;

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

			//maxlength is for pagination. If defs length more than 3 then we set the max length to 3 and incriment as we flip through pages.
            var maxLength;
            if (definitions.length < maxLength) {
                maxLength = definitions.length;
            }
            else {
                maxLength = 3;
            }

            for (var i = 0; i < maxLength; i++) {
                popupDictionaryWindow.innerHTML += "<hr><li style='padding: 10px;'>" + definitions[i] + "</li>"
            }
            //place node at newRange instead of range. This is coordinates of popup dict.
			newRange.insertNode(popupDictionaryWindow);

			//if def length > 3 then add pagination functions
            if (definitions.length >= 3) {
                    document.addEventListener('keydown', nextPage);
                    document.addEventListener('keydown', prevPage);
                    popupDictionaryWindow.innerHTML += "<hr><p style='padding: 10px;'>Next Page--></p>"

					var prevPageExists = false;
					var lastMaxLength;
					var noNextPage;
					
                    function nextPage(e) {
                        if(e.keyCode === RIGHTARROW || e.charCode === RIGHTARROW) {
                            lastMaxLength = maxLength;
							//3 more pages
                            if (definitions.length - maxLength >= 3) {
                                maxLength += 3;
                            }
							//only goes up to length. This is for when the rest of the entries are less than 3.
                            else {
                                maxLength = definitions.length;
								noNextPage = true;
                            }
							//reset the html to just the word text, then add defs.
							popupDictionaryWindow.innerHTML = "<p style='text-align: center;'><b style='font-size: 18px;'>" + text + "</b></p>";
                            for (var i = lastMaxLength; i < maxLength; i++) {
								if (i < 0) break;
                                popupDictionaryWindow.innerHTML += "<hr><li style='padding: 10px;'>" + definitions[i] + "</li>"
                            }
							//since we went up one page, we set the prevpageexissts to true so we can go back
							prevPageExists = true;
							if (noNextPage) {
								popupDictionaryWindow.innerHTML += "<hr><p style='padding: 10px;'><-- Prev Page</p;"
							}
							else {
								popupDictionaryWindow.innerHTML += "<hr><p style='padding: 10px;'><-- Prev Page | Next Page--></p;"
							}
                        }
                    }
                    function prevPage(e) {
                        if(e.keyCode === LEFTARROW || e.charCode === LEFTARROW) {
							console.log(lastMaxLength);
                            lastMaxLength = maxLength;
							console.log(lastMaxLength);
							//if there is prevpage, we actually need to go back 6 because maxlength will decrement as well
                            if (prevPageExists) {
								//need to add exception for when max is less than 3
                                lastMaxLength -= 6;
								maxLength -= 3;
                            }
                            else {
								lastMaxLength -= 0;
                                maxLength = 3;
								prevPageExists = false;
                            }
							popupDictionaryWindow.innerHTML = "<p style='text-align: center;'><b style='font-size: 18px;'>" + text + "</b></p>";
                            for (var i = lastMaxLength; i < maxLength; i++) {
								if (i < 0) break;
                                popupDictionaryWindow.innerHTML += "<hr><li style='padding: 10px;'>" + definitions[i] + "</li>";
                            }
							
							//if prevpage exists, be able to go back, else just do more pages
							if (prevPageExists) {
								popupDictionaryWindow.innerHTML += "<hr><p style='padding: 10px;'><-- Prev Page | Next Page--></p>"
							}
							else {
								popupDictionaryWindow.innerHTML += "<hr><p style='padding: 10px;'>Next Page--></p>"
							}
							console.log("after")
							console.log(maxLength);
							console.log(lastMaxLength);
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
    if(e.keyCode === SHIFT || e.charCode === SHIFT){
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