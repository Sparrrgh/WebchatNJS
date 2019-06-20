$( function() {
    $( "#tabs" ).tabs();
  })

function sendlogin(){
    var loginObj = {username: credentialsLogin.userLogin.value, password: credentialsLogin.passwdLogin.value};
    var loginObjJson = JSON.stringify(loginObj);
    $.ajax({
        method: 'POST',
        url: '/login',
        dataType: 'json',
        contentType: 'application/json',
        data: loginObjJson,
        success: function(data){
            window.location = data.redirect
        },
        error: function(xhr, ajaxOptions, thrownError){alert(thrownError)}
    });
    //Clear input type
    credentialsLogin.userLogin.value = "";
    credentialsLogin.passwdLogin.value="";
}


function sendsign(){
    var signObj = {
        username: credentialsSign.userSign.value, 
        password: credentialsSign.passwdSign.value
    };
    var signObjJson = JSON.stringify(signObj);
    $.ajax({
        method: 'POST',
        url: '/users/create',
        dataType: 'json',
        contentType: 'application/json',
        data: signObjJson,
        success: function(data){
            alert('Registered');
            window.location = data.redirect
        },
        error: function(xhr, ajaxOptions, thrownError){alert(thrownError)}
    });
    //Clear input type
    credentialsSign.userSign.value = "";
    credentialsSign.passwdSign.value="";
}

$(document).on('keypress',function(e) {
    if(e.which == 13) {
        if ($(".av")[0].textContent==="LOGIN"){
            sendlogin();
            console.log("login sent");
        }
        else {
            sendsign();
            console.log("sign up sent");
        }
    }
});