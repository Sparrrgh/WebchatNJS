//AJAX request to subscribe to the longpollig and get a listener
function subscribe(callback) {
    function longPoll(){
        $.ajax({
            method: 'GET',
            url: '/room',
            dataType: 'json',
            success: function(data){
                //Purify the input data to prevent XSS
                data = DOMPurify.sanitize(data);
                //When data is received it's added to the chatbox
                $("#chatbox").append("<li>"+data+"</li>");
            },
            complete: function(){
                //After adding to the chatbox it starts to listen again for new data
                longPoll()
            },
            error: function(){console.log("ERROR!")},
            timeout: 60000
        })
    }
    longPoll()
}

function sendMessage(){
    //Save messagebox element to reuse later
    var messagebox = $("#messagebox")[0];
    //I create a JSON object and then make it in a string, naming could be better
    var message = messagebox.value;
    var messageObj = {message: message};
    var messageObjJson = JSON.stringify(messageObj);
    //Seting up and sending the XHRequest
    var XHR = new XMLHttpRequest();
    var url = 'room';
    XHR.open('POST', url, true);
    XHR.setRequestHeader('Content-type', 'application/json');
    XHR.setRequestHeader('X-Requested-With',' XMLHttpRequest');
    XHR.send(messageObjJson);
    console.log(messageObjJson + " sent");
    //Clear messagebox
    messagebox.value = "";
}

$(document).ready(function(){
    //When the page is loaded the client subscribes to receive realtime data
    subscribe();
    //Checks for enters to send the message
    $(document).on('keypress',function(e) {
        if(e.which == 13) {
            sendMessage();
        }
    });
    }
);