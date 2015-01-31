var isSafari = navigator.appVersion.search('Safari') != -1 && navigator.appVersion.search('Chrome') == -1 && navigator.appVersion.search('CrMo') == -1 && navigator.appVersion.search('CriOS') == -1;
var isIe = (navigator.userAgent.toLowerCase().indexOf("msie") != -1 || navigator.userAgent.toLowerCase().indexOf("trident") != -1);

var ieClipboardDiv = $('#ie-clipboard-contenteditable');
var hiddenInput = $("#hidden-input");

var userInput = "";
var hiddenInputListener = function(text) {};

var focusHiddenArea = function() {
    // In order to ensure that the browser will fire clipboard events, we always need to have something selected
    hiddenInput.val(' ');
    hiddenInput.focus().select();
};

// Focuses an element to be ready for copy/paste (used exclusively for IE)
var focusIeClipboardDiv = function() {
    ieClipboardDiv.focus();
    var range = document.createRange();
    range.selectNodeContents((ieClipboardDiv.get(0)));
    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
};

// For IE, we can get/set Text or URL just as we normally would, but to get HTML, we need to let the browser perform the copy or paste
// in a contenteditable div.
var ieClipboardEvent = function(clipboardEvent) {
    var clipboardData = window.clipboardData;
    if (clipboardEvent == 'cut' || clipboardEvent == 'copy') {
        clipboardData.setData('Text', textToCopy);
        ieClipboardDiv.html(htmlToCopy);
        focusIeClipboardDiv();
        setTimeout(function() {
            focusHiddenArea();
            ieClipboardDiv.empty();
        }, 0);
    }
    if (clipboardEvent == 'paste') {
        var clipboardText = clipboardData.getData('Text');
        ieClipboardDiv.empty();
        setTimeout(function() {
            console.log('Clipboard Plain Text: ' + clipboardText);
            console.log('Clipboard HTML: ' + ieClipboardDiv.html());
            ieClipboardDiv.empty();
            focusHiddenArea();
        }, 0);
    }
};

// For every broswer except IE, we can easily get and set data on the clipboard
var standardClipboardEvent = function(clipboardEvent, event) {
    var clipboardData = event.clipboardData;
    if (clipboardEvent == 'cut' || clipboardEvent == 'copy') {
        var data, end, line, sel, _i, _len, _ref;
        butterfly.bell("copied");
        event.clipboardData.clearData();
        sel = getSelection().toString().replace(/\u00A0/g, ' ').replace(/\u2007/g, ' ');
        data = '';
        _ref = sel.split('\n');
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            line = _ref[_i];
            if (line.slice(-1) === '\u23CE') {
                end = '';
                line = line.slice(0, -1);
            } else {
                end = '\n';
            }
            data += line.replace(/\s*$/, '') + end;
        }
        event.clipboardData.setData('text/plain', data.slice(0, -1));
        return event.preventDefault();
    }
    if (clipboardEvent == 'paste') {
        var data;
        butterfly.bell("pasted");
        data = clipboardData.getData('text/plain');
        console.log('Clipboard Plain Text: ' + data);
        data = data.replace(/\r\n/g, '\n').replace(/\n/g, '\r');
        butterfly.send(data);
        return event.preventDefault();
    }
};

// For IE, the browser will only paste HTML if a contenteditable div is selected before paste. Luckily, the browser fires
// a before paste event which lets us switch the focuse to the appropraite element
if (isIe) {
    document.addEventListener('beforepaste', function() {
        if (hiddenInput.is(':focus')) {
            focusIeClipboardDiv();
        }
    }, true);
}

// We need the hidden input to constantly be selected in case there is a copy or paste event. It also receives and dispatches input events
hiddenInput.on('input', function(e) {
    var value = hiddenInput.val();
    userInput += value;
    hiddenInputListener(userInput);

    // There is a bug (sometimes) with Safari and the input area can't be updated during
    // the input event, so we update the input area after the event is done being processed
    if (isSafari) {
        hiddenInput.focus();
        setTimeout(focusHiddenArea, 0);
    } else {
        focusHiddenArea();
    }
});

// Set clipboard event listeners on the document.
['cut', 'copy', 'paste'].forEach(function(event) {
    document.addEventListener(event, function(e) {
        console.log(event);
        if (isIe) {
            ieClipboardEvent(event);
        } else {
            standardClipboardEvent(event, e);
            focusHiddenArea();
            e.preventDefault();
        }
    });
});

window.mobilecheck = function() {
  var check = false;
  (function(a,b){if(/(android|ipad|playbook|silk|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
}

// Keep the hidden text area selected
$(document).mouseup(focusHiddenArea);

$(document).ready(function() {
    var button = document.querySelector('.keyboard');
    var input = document.querySelector('#hidden-input');
    var focus = function(e) {
        e.stopPropagation();
        e.preventDefault();
        var clone = input.cloneNode(true);
        var parent = input.parentElement;
        parent.appendChild(clone);
        parent.replaceChild(clone, input);
        input = clone;
        window.setTimeout(function() {
            input.value = input.value || "";
            input.focus();
        }, 0);
    };
    button.addEventListener('mousedown', focus);
    button.addEventListener('touchstart', focus);

    if(!mobilecheck()){
        $('.keyboard').hide()
    }
});