     // Instance of FaceBook Provider Object
     var fprovider = new firebase.auth.FacebookAuthProvider();

     //sign in function for FaceBook
     function facebookSignIn() {
     	firebase.auth().signInWithRedirect(fprovider);
     console.log("testtest")
     }

     // Instance of Google Provider Object
    var provider = new firebase.auth.GoogleAuthProvider();

    // Sign in function for Google Accts



 function googleSignIn() {
    firebase.auth().signInWithRedirect(provider);
//     firebase.auth().getRedirectResult().then(function(result) {
//   if (result.credential) {
//     // This gives you a Google Access Token. You can use it to access the Google API.
//     var token = result.credential.accessToken;
//     // ...
//   }
//   // The signed-in user info.
//   var user = result.user;
// }).catch(function(error) {
//   // Handle Errors here.
//   var errorCode = error.code;
//   var errorMessage = error.message;
//   // The email of the user's account used.
//   var email = error.email;
//   // The firebase.auth.AuthCredential type that was used.
//   var credential = error.credential;
//   // ...
// });	
   }


(function() {

    // Initialize Firebase
    const config = {
        apiKey: "AIzaSyAiGigEkp1Z1KfJfC7BYDofge3mEg7yx3Y",
        authDomain: "pitch-ball.firebaseapp.com",
        databaseURL: "https://pitch-ball.firebaseio.com",
        projectId: "pitch-ball",
        storageBucket: "pitch-ball.appspot.com",
        messagingSenderId: "1005232542413"
    };
    firebase.initializeApp(config);


    // Get Elements
    const txtEmail = document.getElementById('txtEmail');
    const txtPassword = document.getElementById('txtPassword');
    const txtLogin = document.getElementById('btnLogin');
    const txtSignUp = document.getElementById('btnSignUp');
    const txtLogOut = document.getElementById('btnLogOut');

    // Add Login
    btnLogin.addEventListener('click', e => {
        // get email and pass
        const email = txtEmail.value;
        const pass = txtPassword.value;
        const auth = firebase.auth();
        // sign in
        const promise = auth.signInWithEmailAndPassword(email, pass);
        promise.catch(e => console.log(e.message));
        $("#txtPassword").val('');
		$("#txtEmail").val('');

    });


    // Add Signup
    btnSignUp.addEventListener('click', e => {

        // get email and pass
        const email = txtEmail.value;
        const pass = txtPassword.value;
        const auth = firebase.auth();
        // sign in
        const promise = auth.createUserWithEmailAndPassword(email, pass);
        $("#txtPassword").val('');
		$("#txtEmail").val('');
		//btnSignUp.addClass("hidden");

    });

    // Log Out
    btnLogOut.addEventListener('click', e => {
        firebase.auth().signOut();
    });

    // Realtime Listener

    firebase.auth().onAuthStateChanged(firebaseUser => {
        if (firebaseUser) {
            console.log(firebaseUser);
            btnLogOut.classList.remove('hide');

        } else {

            console.log('not logged in');
            btnLogOut.classList.add('hide')


        }
    });


}());

