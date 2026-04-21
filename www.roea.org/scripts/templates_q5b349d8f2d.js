

function goto_URL(object) {
    window.location.href = object.options[object.selectedIndex].value;
}

function print_preview(page)
{
 print_preview_window(page);
}


function print_preview_window(address)
{
var w = 0, h = 0;

if (document.all) {
   /* the following is only available after onLoad */
   w = document.body.clientWidth;
   h = document.body.clientHeight;
}
else if (document.layers) {
   w = window.innerWidth;
   h = window.innerHeight;
}

var popW = 800, popH = 550;

var leftPos = (w-popW)/2, topPos = (h-popH)/2;

  _preview_window = window.open(address,'_preview_window','width='+popW+',height='+popH+',top='+topPos+',left='+leftPos+',toolbar=yes,menubar=yes,scrollbars=yes,resizable=yes,location=yes');
}

// IMAGE ROLLOVER
function imgOn(imgName) { if (document.images) { document[imgName].src = eval(imgName + "_on.src"); } }
function imgOff(imgName) { if (document.images) { document[imgName].src = eval(imgName + "_off.src"); } }

