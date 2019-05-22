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
        }
    });
    //Clear input type
    credentialsLogin.userLogin.value = "";
    credentialsLogin.passwdLogin.value="";
}

function sendsign(){
    var signObj = {username: credentialsSign.userSign.value, password: credentialsSign.passwdSign.value};
    var signObjJson = JSON.stringify(signObj);
    $.ajax({
        method: 'POST',
        url: '/register',
        dataType: 'json',
        contentType: 'application/json',
        data: signObjJson,
        success: function(data){
            window.location = data.redirect
        }
    });
    //Clear input type
    credentialsSign.userSign.value = "";
    credentialsSign.passwdSign.value="";
}