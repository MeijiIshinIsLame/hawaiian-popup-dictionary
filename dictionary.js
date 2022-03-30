var popupVisible = false;
const RIGHTARROW = 39;
const LEFTARROW = 37;
const SHIFT = 16;
var popupDictionaryWindow;
var text;

//gets JSON dict as promise
async function fetchJSONDict() {
    let response = await fetch(chrome.runtime.getURL('./dictionaryDefinitions.json'));
    return response;
}

//searches for word and returns dictionary entries for word
async function searchWord(word) {
    definitions = [];
	
	//trim removes tailing whitespace
    word = word.toLowerCase().trim();

    let response = await fetchJSONDict();
    let data = await response.text();
    var dictInJSON = JSON.parse(data);

    for (var i = 0; i < dictInJSON["data"].length; i++){
         if (dictInJSON["data"][i]["word"].toLowerCase() == word){
            for (var j = 0; j < dictInJSON["data"][i]["definitions"].length; j++) {
				if (dictInJSON["data"][i]["definitions"][j]["ps"] != undefined){
					dictString = "<b>[" + dictInJSON["data"][i]["definitions"][j]["ps"] + "]</b> " + dictInJSON["data"][i]["definitions"][j]["dtxt"];
				}
				else {
					dictString = dictInJSON["data"][i]["definitions"][j]["dtxt"];
				}
				definitions.push(dictString);
			}
        }
    }
    return definitions
}


//sooooo this is a big ugly function because chrome extensions force me to read files as a promise T_T
function insertPopupDict() {
    if (window.getSelection) {
        //this is the highlighted text
        let selection = window.getSelection();
        text = selection.toString();
        var range = selection.getRangeAt(0);

        //this is the solution to the highlight problem
        var newRange = document.createRange();
		try {
			newRange.setStart(selection.focusNode, selection.focusOffset - 1);
		} catch {
			newRange.setStart(selection.focusNode, selection.startOffset);
		}
	

		popupDictionaryWindow = document.createElement('span');
        popupDictionaryWindow.id = 'hawaiian-popup-dictionary'
		popupDictionaryWindow.style = 'margin-top: 35px; width: 360px;font-size: 14px;font-family: Arial, Helvetica, sans-serif; background-color: #555;color: #fff;border-radius: 6px;padding: 8px 0;position: absolute;z-index: 1;';
		
		
        //show word and definitions
        searchWord(text).then(definitions => {
			popupDictionaryWindow.innerHTML = "<p style='text-align: center;'><b style='font-size: 18px;font-family: Arial, Helvetica, sans-serif;'>" + text + "</b></p>";

			//maxlength is for pagination. If defs length more than 3 then we set the max length to 3 and incriment as we flip through pages.
            var currentPage = 1;
			var defsPerPage = 3;
			var maxPages = Math.ceil(definitions.length / defsPerPage);
			
			
			//initial dict entry population
			if (definitions.length > 0) {
				for (var i = 0; i < defsPerPage; i++) {
					if (definitions[i] == undefined) break;
					popupDictionaryWindow.innerHTML += "<hr><li style='padding: 10px;font-family: Arial, Helvetica, sans-serif;'>" + definitions[i] + "</li>";
				}
			}
			else {
				popupDictionaryWindow.innerHTML += "<hr><li style='padding: 10px;font-family: Arial, Helvetica, sans-serif;'>No definitions found.</li>";
			}
            //place node at newRange instead of range. This is coordinates of popup dict.
			newRange.insertNode(popupDictionaryWindow);
			
			popupVisible = true;
		
		
			// if clicked off window, delete it
			function clickOffWindow(e){
				if (popupVisible) {
					if (!popupDictionaryWindow.innerText.includes(e.target.innerText)){
						removeDictWindow();
					}
				}
			}
			document.addEventListener('click', clickOffWindow);

			//if def length > 3 then add pagination functions
            if (definitions.length > 3) {
                    document.addEventListener('keydown', nextPage);
                    document.addEventListener('keydown', prevPage);
                    popupDictionaryWindow.innerHTML += "<hr><p style='padding: 10px;font-family: Arial, Helvetica, sans-serif;'>Next Page--></p>";
					
                    function nextPage(e) {
                        if(e.keyCode === RIGHTARROW || e.charCode === RIGHTARROW) {
                            
							currentPage++;
							
							//validation
							if (currentPage > maxPages) currentPage = maxPages;

							popupDictionaryWindow.innerHTML = "<p style='text-align: center;;'><b style='font-size: 18px;font-family: Arial, Helvetica, sans-serif;'>" + text + "</b></p>";
                            for (var i = (currentPage-1) * defsPerPage; i < (currentPage * defsPerPage); i++) {
								//if we get an undefined don't list anymore
								if (definitions[i] == undefined) break;
                                popupDictionaryWindow.innerHTML += "<hr><li style='padding: 10px;font-family: Arial, Helvetica, sans-serif;'>" + definitions[i] + "</li>"
                            }
							//page buttons depending on if theres more defs or not
							if (currentPage > 1 && currentPage < maxPages) {
								popupDictionaryWindow.innerHTML += "<hr><p style='padding: 10px;font-family: Arial, Helvetica, sans-serif;'><-- Prev Page | Next Page--></p;"
							}
							else  if (currentPage > 1){
								popupDictionaryWindow.innerHTML += "<hr><p style='padding: 10px;font-family: Arial, Helvetica, sans-serif;'><-- Prev Page</p;"
							}
                        }
                    }
                    function prevPage(e) {
                        if(e.keyCode === LEFTARROW || e.charCode === LEFTARROW) {
							currentPage--;
							
							//validation
							if (currentPage > maxPages) currentPage = maxPages;
							if (currentPage < 1) currentPage = 1;

							popupDictionaryWindow.innerHTML = "<p style='text-align: center;'><b style='font-size: 18px;font-family: Arial, Helvetica, sans-serif;'>" + text + "</b></p>";
                            for (var i = (currentPage-1) * defsPerPage; i < (currentPage * defsPerPage); i++) {
								//if we get an undefined don't list anymore
								if (definitions[i] == undefined) break;
                                popupDictionaryWindow.innerHTML += "<hr><li style='padding: 10px;font-family: Arial, Helvetica, sans-serif;'>" + definitions[i] + "</li>"
                            }
							//page buttons depending on if theres more defs or not
							if (currentPage > 1 && currentPage < maxPages) {
								popupDictionaryWindow.innerHTML += "<hr><p style='padding: 10px;font-family: Arial, Helvetica, sans-serif;'><-- Prev Page | Next Page--></p;";
							}
							else  if (currentPage > 1){
								popupDictionaryWindow.innerHTML += "<hr><p style='padding: 10px;font-family: Arial, Helvetica, sans-serif;'><-- Prev Page</p;";
							}
							else if (currentPage == 1 && maxPages > 1) {
								popupDictionaryWindow.innerHTML += "<hr><p style='padding: 10px;font-family: Arial, Helvetica, sans-serif;'>Next Page--></p>";
							}
                        }
                    }
                }
		});
    }
}

function shiftDowned(e) {
    if(e.keyCode === SHIFT || e.charCode === SHIFT){
        if (popupVisible) {
			removeDictWindow();
        }
        else {
            insertPopupDict();
        }
    }
}

function removeDictWindow(){
	var popupwindow = document.getElementById("hawaiian-popup-dictionary");
    popupwindow.remove();
	popupVisible = false;
}

document.addEventListener('keydown', shiftDowned);