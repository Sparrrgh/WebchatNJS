//AJAX request to subscribe to the longpollig and get a listener
function subscribe() {
    function longPoll(){
        var currentRoom = $("#currentRoom")[0].textContent;
        $.ajax({
            method: 'GET',
            url: '/room',
            dataType: 'json',
            data: {
                room : currentRoom,
                nu : 0
            },
            success: function(data){
                //Purify the input data to prevent XSS
                //When data is received it's added to the chatbox
                $("#chatbox").append("<li>"+DOMPurify.sanitize(data.value)+"</li>");
            },
            complete: function(){
                //After adding to the chatbox it starts to listen again for new data
                longPoll()
            },
            error: function(){console.log("ERROR!")},
            timeout: 4000
        });
    }
    longPoll()
}

function sendMessage(){
    //Save messagebox element to reuse later
    var messagebox = $("#messagebox")[0];
    var currentRoom = ($("#currentRoom")[0]).textContent;
    //I create a JSON object and then make it in a string, naming could be better
    var messageObj = {value: messagebox.value, room: currentRoom};
    var messageObjJson = JSON.stringify(messageObj);
    //Setting up and sending the XHRequest
    $.ajax({
        method: 'POST',
        url: '/room',
        dataType: 'json',
        contentType: 'application/json',
        data: messageObjJson
    });
    console.log(messageObjJson + " sent");
    //Clear messagebox
    messagebox.value = "";
}

$(document).ready(function(){
    //Checks for enters to send the message
    $(document).on('keypress',function(e) {
        if(e.which == 13) {
            sendMessage();
        }
    });
    
    //Change room
    $(".roomChanger").click(function(event) {
        var oldRoom = $("#currentRoom")[0];
        //Check if the room has to change
        if (oldRoom.textContent != event.target.value){
            //Empty chatbox
            $("#chatbox").empty();
            //Save room in title (from button calling the event)
            var currentRoom = event.target.value;
            oldRoom.textContent = currentRoom;
            //Request the messages from the new room
            $.ajax({
                method: 'GET',
                url: '/room',
                dataType: 'json',
                data: {
                    nu:1,
                    room: currentRoom
                },
                success: function(data){
                    //When data is received it's added to the chatbox
                    data.forEach(element => {
                    //Purify each and every element to prevent XSS, not exactly the fastest approach...
                        $("#chatbox").append("<li>"+DOMPurify.sanitize(element.value)+"</li>");
                    });
                }
            });
        }
        
    });
    //Get elements from current room
    $.ajax({
        method: 'GET',
        url: '/room',
        dataType: 'json',
        data: {
            nu:1,
            room: $("#currentRoom")[0].textContent
          },
        success: function(data){
            //When data is received it's added to the chatbox
            data.forEach(element => {
            //Purify each and every element to prevent XSS, not exactly the fastest approach...
                $("#chatbox").append("<li>"+DOMPurify.sanitize(element.value)+"</li>");
            });
        }
    });
    //When the page is loaded the client subscribes to receive realtime data
    subscribe();
});