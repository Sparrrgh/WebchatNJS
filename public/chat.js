$(document).ready(function(){
    //AJAX request to subscribe to the longpollig and get a listener
    function subscribe() {
        function longPollMessage(){
            var currentRoom = $("#currentRoom")[0].textContent;
            $.ajax({
                method: 'GET',
                url: '/chat',
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
                    longPollMessage()
                },
                error: function(xhr, ajaxOptions, thrownError){console.log("Longpolling message error: " + thrownError)},
                timeout: 60000
            });
        }
        function longPollRoom(){
            $.ajax({
                method: 'GET',
                url: '/rooms',
                dataType: 'json',
                success: function(data){
                    //Purify the input data to prevent XSS
                    //When data is received it's added to the roomlist
                    $("#roomList").append('<li><input type="button" class="roomChanger" value="'+DOMPurify.sanitize(data.room)+'"/></li>');
                },
                complete: function(){
                    //After adding to the chatbox it starts to listen again for new data
                    longPollRoom()
                },
                error: function(xhr, ajaxOptions, thrownError){console.log("Longpolling room error: " + thrownError)},
                timeout: 60000
            });
        }
        longPollRoom();
        longPollMessage();
    }

    function sendMessage(){
        //Save messagebox element to reuse later
        var messagebox = $("#messagebox")[0];
        var currentRoom = ($("#currentRoom")[0]).textContent;
        var timestamp=JSON.stringify(new Date());
        var pars_time=JSON.parse(timestamp);
        var time=new Date(pars_time);
        //I create a JSON object and then make it in a string, naming could be better
        var messageObj = {value: messagebox.value, room: currentRoom,time:time};
        var messageObjJson = JSON.stringify(messageObj);
        //Setting up and sending the XHRequest
        $.ajax({
            method: 'POST',
            url: '/chat',
            dataType: 'json',
            contentType: 'application/json',
            data: messageObjJson
        });
        console.log(messageObjJson + " sent");
        //Clear messagebox
        messagebox.value = "";
    }

    //Checks for enters to send the message
    $(document).on('keypress',function(e) {
        if(e.which == 13) {
            sendMessage();
        }
    });

    //Opens the dialog
    $("#createRoomDialog").click(function(event) {
        // $("#dialog").display = "inline";
        $("#dialog").dialog("open");
    });

    //Sends POST request to create new room
    $("#createRoom").click(function(event) {
        var newRoom = ($("#createRoomName")[0]).value;
        //I create a JSON object and then make it in a string, naming could be better
        var roomObj = {room: newRoom};
        var roomObjJson = JSON.stringify(roomObj);
        $("#createRoomName")[0].value = "";
        $.ajax({
            method: 'POST',
            url: '/rooms',
            dataType: 'json',
            contentType: 'application/json',
            data: roomObjJson
        });
    });
    
    //Change room buttons
    $("#roomList").on('click','input',function(event) {
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
                url: '/chat',
                dataType: 'json',
                data: {
                    nu:1,
                    room: currentRoom
                },
                success: function(data){
                    if(data.length > 0){
                        //When data is received it's added to the chatbox
                        data.forEach(element => {
                            //Purify each and every element to prevent XSS, not exactly the fastest approach...
                                $("#chatbox").append("<li>"+DOMPurify.sanitize(element.value)+"</li>");
                        });
                    }
                    else{
                        console.log("No messages in the current room");
                    }
                }
            });
        }
        
    });

    //This executes whenever the document is loaded
    //GET messages from current room
    //GET rooms
    $.ajax({
        method: 'GET',
        url: '/chat',
        dataType: 'json',
        data: {
            nu:1,
            room: $("#currentRoom")[0].textContent
          },
        success: function(data){
            if(data.length > 0){
                //When data is received it's added to the chatbox
                data.forEach(element => {
                    //Purify each and every element to prevent XSS, not exactly the fastest approach...
                        $("#chatbox").append("<li>"+DOMPurify.sanitize(element.value)+"</li>");
                });
            }
            else{
                console.log("No messages in the current room");
            }
        }
    });

    $.ajax({
        method: 'GET',
        url: '/rooms',
        dataType: 'json',
        data: {
            nu:1
          },
        success: function(data){
            if(data.length > 0){
                //When data is received it's added to the chatbox
                data.forEach(element => {
                    //Purify each and every element to prevent XSS, not exactly the fastest approach...
                    $("#roomList").append('<li><input type="button" class="roomChanger" value="'+DOMPurify.sanitize(element.room)+'"/></li>');
                });
            }
            else{
                console.log("No new rooms");
            }
        }
    });
    //When the page is loaded the client subscribes to receive realtime data
    subscribe();
    //Creates the jQuery dialog object
    $("#dialog").dialog({
        autoOpen: false,
        show: {
          effect: "puff",
          duration: 200
        },
        hide: {
          effect: "puff",
          duration: 200
        }
      });
});