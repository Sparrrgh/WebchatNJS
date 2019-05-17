$( function() {
    $( "#tabs" ).tabs();
  })
var dateToday = new Date();
var yyyy = dateToday.getFullYear();
function sendsign(){
    //check not null value
    if (credentialsSign.nameSign.value == ""){
        alert("Error: insert your name!");
        return false
      }
    if (credentialsSign.surSign.value == ""){
    alert("Error: insert your surname!");
    return false
    }
    if (credentialsSign.emailSign.value == ""){
    alert("Error: insert your email!");
    return false
    }
    if (credentialsSign.dateSign.value == ""){
    alert("Error: insert your date of birth!");
    return false
    }
  
    if (credentialsSign.userSign.value == ""){
    alert("Error: insert your username!");
    return false
    }
    if (credentialsSign.passwdSign.value == ""){
    alert("Error: insert your password!");
    return false
    }
    if (credentialsSign.repeteSign.value == ""){
        alert("Error: repete your password!");
        return false
    }
    // check identical password
    if (credentialsSign.passwdSign.value != credentialsSign.repeteSign.value) {
        alert("Error: passwords are not identical.Repete please!")
        return false
    }
      // check legal
      if ((yyyy-parseInt(credentialsSign.dateSign.value))<17) {
        alert("Error: you aren't legal!")
        return false
    }
  
     // check correct email 
    var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    if (!reg.test(credentialsSign.emailSign.value)) {
        alert("Error: your email isn't correct.Repete please!")
        return false;
    } 
    return true;
}
function sendlogin(){
    //check not null value
    if (credentialsLogin.userLogin.value == ""){
    alert("Error: insert your username!");
    return false
    }
    if (credentialsLogin.passwdLogin.value == ""){
    alert("Error: insert your password!");
    return false
    } 
    return true;
}