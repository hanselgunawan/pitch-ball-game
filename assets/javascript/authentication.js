/**
 * Created by hansel.tritama on 10/9/17.
 */


const config = {
    apiKey: "AIzaSyAiGigEkp1Z1KfJfC7BYDofge3mEg7yx3Y",
    authDomain: "pitch-ball.firebaseapp.com",
    databaseURL: "https://pitch-ball.firebaseio.com",
    projectId: "pitch-ball",
    storageBucket: "pitch-ball.appspot.com",
    messagingSenderId: "1005232542413"
};
firebase.initializeApp(config);

var google_provider = new firebase.auth.GoogleAuthProvider();
var facebook_provider = new firebase.auth.FacebookAuthProvider();

google_provider.addScope('profile');
google_provider.addScope('email');

//GOOGLE LOGIN
$(".btn-google").on("click", function () {
    firebase.auth().signInWithPopup(google_provider).then(function(result) {
        console.log(result);
        window.user = result.user;
        let userId = result.user.uid;//<-- Saved by UID
        let database = firebase.database();
        let ref = database.ref('/players/' + userId);// <-- change our Table name here!!!
        ref.set({
            name: result.user.displayName,
            email: result.user.email
        });
        $(".playerName").html(result.user.displayName);//<-- Change username
        $(".login-page").hide();
        $(".home-page").show();
    }).catch(function (error) {
        console.log(error);
    });
});


var player = {
    name : "",
    highscore : 0,
    email: "",
    challenge_list: "",
    numChallenges: 0,
    currentGame: "",
    location: {city: "", country: "", area:"", zip:""},
    score_history: 0
}


//SIGN UP BUTTON
$("#signUpBtn").on("click", function (event) {
    if($("#signUpName").val() !== "" && $("#signUpUserEmail").val() !== "" && $("#signUpUserPassword").val() !== "" && $("#signUpConfirmPassword").val() !== "")
    {
        if($("#signUpUserPassword").val().length < 8 || $("#signUpConfirmPassword").val().length < 8)
        {
            event.preventDefault();
            alert("Password must be 8 characters or more.");
        }
        else
        {
            if($("#signUpUserPassword").val() === $("#signUpConfirmPassword").val())
            {
                event.preventDefault();
                const txtName = $("#signUpName").val();
                const txtEmail = $("#signUpUserEmail").val();
                const txtPassword = $("#signUpUserPassword").val();
                const auth = firebase.auth();
                const promise = auth.createUserWithEmailAndPassword(txtEmail, txtPassword);
                $(".row-password-not-matched").hide();
                alert("You are signup!");

                auth.signInWithEmailAndPassword(txtEmail, txtPassword);
                let userId = firebase.auth().currentUser.uid;//<-- Saved by UID
                let database = firebase.database();
                let ref = database.ref('users/' + txtEmail);// <-- change our Table name here!!!
                ref.set({ 
                    name : txtName,
                    highscore : 0,
                    email: txtEmail,
                    challenge_list: "",
                    numChallenges: 0,
                    currentGame: "",
                    location: {city: "", country: "", area:"", zip:""},
                    score_history: 0
                });
                
                $(".signup-page").hide();
                $(".home-page").show();
            }
            else
            {
                event.preventDefault();
                $(".row-password-not-matched").show();
            }
        }


    }
});


//LOGIN BUTTON
$("#loginBtn").on("click", function (event) {
    if($("#userEmail").val() !== "" && $("#userPassword").val() !== "")
    {
        event.preventDefault();
        const txtEmail = $("#userEmail").val();
        const txtPassword = $("#userPassword").val();
        firebase.auth().signInWithEmailAndPassword(txtEmail, txtPassword).then(function () {
            $(".row-incorrect-credentials-login").hide();
            $(".login-page").hide();
            $(".home-page").show();

            let database = firebase.database();
            let userId = firebase.auth().currentUser.uid;
            let ref = database.ref('/players/' + userId);
            ref.on("value", function (snapshot) {
                $(".playerName").html(snapshot.val().name);//<-- Change username
                console.log(snapshot.val());
            });

        }).catch(function(error) {
            $(".row-incorrect-credentials-login").show();
        });
    }
});


//SIGN OUT
$("#signOutBtn").on("click", function () {
    firebase.auth().signOut().then(function() {
        alert("Thank you for playing! See you soon!");
        $(".row-incorrect-credentials-login").hide();
        $(".home-page").hide();
        $(".login-page").show();
        $("#userEmail").val('');
        $("#userPassword").val('');
    }).catch(function(error) {
        console.log(error);
    });
});