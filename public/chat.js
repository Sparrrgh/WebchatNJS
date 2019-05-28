$(document).ready(function(){
    //AJAX request to subscribe to the longpollig and get a listener
    var longPollMsg;
    var longPollUsr;
    function subscribe() {
        function longPollMessage(){
            var currentRoom = $("#currentRoom")[0].textContent;
            //I save the ajax request to reset it later on
            longPollMsg = $.ajax({
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
                    var chatbox = $("#chatbox");
                    chatbox.append("<li>" + "["+ data.time +"] "+ "<span>" + data.username   +":</span> " + data.value + "</li>");
                    //Scroll the div to the bottom
                    chatbox.animate({ scrollTop: chatbox.prop('scrollHeight') }, 50);
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
                    $("#roomList").append('<li><input type="button" class="roomChanger" value="' + data.name + '"/></li>');
                },
                complete: function(){
                    //After adding to the chatbox it starts to listen again for new data
                    longPollRoom()
                },
                error: function(xhr, ajaxOptions, thrownError){console.log("Longpolling room error: " + thrownError)},
                timeout: 60000
            });
        }
        function longPollUsers(){
            var currentRoom = $("#currentRoom")[0].textContent;
            longPollUsr = $.ajax({
                method: 'GET',
                url: '/users',
                dataType: 'json',
                data: {
                    room : currentRoom,
                },
                success: function(data){
                    var userList = $("#userList");
                    userList.empty();
                    data.forEach(user => {
                        userList.append("<li>"+ user.username +" </li>");
                    });
                },
                complete: function(){
                    longPollUsers()
                },
                error: function(xhr, ajaxOptions, thrownError){console.log("Longpolling users error: " + thrownError)},
                timeout: 60000
            });
        }
        longPollUsers();
        longPollRoom();
        longPollMessage();
    }

    function sendMessage(){
        //Save messagebox element to reuse later
        var messagebox = $("#messagebox")[0];
        //Checks if the message is formed by only spaces through a regex
        if(!(!(messagebox.value).replace(/\s/g, '').length)){
            var currentRoom = ($("#currentRoom")[0]).textContent;
            //I create a JSON object and then make it in a string, naming could be better
            var messageObj = {value: messagebox.value, room: currentRoom};
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
    }

    //Checks for enters to send the message
    $(document).on('keypress',function(e) {
        if(e.which == 13) {
            sendMessage();
        }
    });

    //Checks if sendbutton is clicked
    $('#sendButton').on('click', function(e){
        sendMessage();
    });

    //Checks if sendbutton is clicked
    $('#logout').on('click', function(e){
        $.ajax({
            method: 'GET',
            url: '/logout',
            dataType: 'json',
            contentType: 'application/json',
            complete: function(data){
                window.location = ("/");
            }
        });

    });


    //Opens the dialog
    $("#createRoomDialog").click(function(event) {
        $("#dialog").dialog("open");
    });

    //Sends POST request to create new room
    $("#createRoom").click(function(event) {
        var newRoom = ($("#createRoomName")[0]).value;
        //Checks if the room name is formed by only spaces through a regex
        if(!(!newRoom.replace(/\s/g, '').length)){
            //I create a JSON object and then make it in a string, naming could be better
            var roomObj = {name: newRoom};
            var roomObjJson = JSON.stringify(roomObj);
            $("#createRoomName")[0].value = "";
            $.ajax({
                method: 'POST',
                url: '/rooms',
                dataType: 'json',
                contentType: 'application/json',
                data: roomObjJson
            });
            $("#dialog").dialog('close'); 
        }
        
    });
    
    //Change room buttons
    $("#roomList").on('click','input',function(event) {
        var oldRoom = $("#currentRoom")[0];
        //Check if the room has to change
        if (oldRoom.textContent != event.target.value){
            //Empty userlist
            $("#userList").empty();
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
                        var chatbox = $("#chatbox");
                        data.forEach(message => {
                            //Purify each and every element to prevent XSS, not exactly the fastest approach...
                            chatbox.append("<li>" + "["+ message.time +"] "+ "<span>" + message.username   +":</span> " + message.value+"</li>");
                        });
                        //Scroll the div to the bottom
                        chatbox.animate({ scrollTop: chatbox.prop('scrollHeight') }, 50);
                    }
                    else{
                        console.log("No messages in the current room");
                    }
                }
            });

            //Reset the ajax request to emit another one with the correct room set
            longPollUsr.abort();

            //Post to place our user in the current room
            var currentRoom = event.target.value;
            var currentRoomObj = { room : currentRoom};
            var currentRoomObJson = JSON.stringify(currentRoomObj);
            $.ajax({
                method: 'POST',
                url: '/users',
                dataType: 'json',
                contentType: 'application/json',
                data:currentRoomObJson
            });

            //Reset the ajax request to emit another one with the correct room set
            longPollMsg.abort();
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
                var chatbox = $("#chatbox")
                //When data is received it's added to the chatbox
                data.forEach(message => {
                    //Purify each and every element to prevent XSS, not exactly the fastest approach...
                    chatbox.append("<li>" + "["+ message.time +"] "+ "<span>" + message.username   +":</span> " + message.value+"</li>");
                });
                //Scroll the div to the bottom
                chatbox.animate({ scrollTop: chatbox.prop('scrollHeight') }, 50);
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
                data.forEach(room => {
                    //Purify each and every element to prevent XSS, not exactly the fastest approach...
                    $("#roomList").append('<li><input type="button" class="roomChanger" value="'+room.name+'"/></li>');
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