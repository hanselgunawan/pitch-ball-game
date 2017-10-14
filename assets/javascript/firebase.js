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

var google_provider = new firebase.auth.GoogleAuthProvider();
var facebook_provider = new firebase.auth.FacebookAuthProvider();

google_provider.addScope('profile');
google_provider.addScope('email');

//FIREBASE ALIASES
var db = firebase.database();
var users = db.ref('users');
var challenge = db.ref('challenge');
var lb = db.ref('leaderboard');

//OBJECTS
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

function Player(email, name){
	this.name = name;
	this.highscore = 0;
	this.email = email;
	this.challenge_list = "";
	this.numChallenges= 0;
	this.currentGame= "";
	this.location= {city: "", country: "", area:"", zip:""};
	this.score_history = 0;
}

function Challenge(user1, user2, user1name, user2name){

	//player data
	this.user1 = user1;
	this.user1name = user1name;
	this.user1score = "";
	this.user1games = "";
	
	//opponent data
	this.user2 = user2;
	this.user2name = user2name;
	this.user2score = "";
	this.user2games = "";

	//rounds
	this.rounds = {1: "", 2: "", 3: "", 4: "", 5: ""};
	
	//boolean var to check if the challenge is accepted by opponent
	this.accepted = false;
	this.ended = false;
	this.whoseTurn = "";
}

var currentMode;

function Game(user, name, city, score, timestamp)
{
	this.user = user;
	this.name = name;
	this.city = city;
	this.score = score;
	this.timestamp = timestamp;
}

//FUNCTIONS used in the GAME
var methods = {
	newUser: function(txtName, txtEmail){
		//update user information
		player.name = txtName;
		player.email = txtEmail;
		//get location of user
		player = new Player(txtEmail, txtName);
		users.child(txtEmail).set(player);
		//methods.updatePlayerProfile();
		methods.getCoords();

	},
	//Listen for value changes on Player information
	getPlayerInfo: function(email){
		users.child(email).on('value').then(res => {
			player = res.val();
		})
	},
	loginSuccess: function(){
		//get user information from firebase user database
		users.child(player.email).once('value').then(function(res){
			player = res.val();
		});

		methods.getCoords();
	},
	//call this function whenever you want to update player location
	getCoords: function(){
		if (navigator.geolocation) {
	       navigator.geolocation.getCurrentPosition(methods.getLocation);
	    } else { 
	        console.log("Geolocation is not supported by this browser.");
	    } 
	},
	getLocation: function(pos){
		//http://maps.googleapis.com/maps/api/geocode/json?latlng=40.714224,-73.961452&sensor=false
		var lat = pos.coords.latitude;
		var long = pos.coords.longitude;
		//console.log(lat, long);
		var map_url = "https://maps.googleapis.com/maps/api/geocode/json?latlng="+lat+","+long+"&sensor=false";
		$.ajax({
			url: map_url,
			method: "GET"
		}).done(function(res){
			var j = res.results[0].address_components;
			console.log(j);
			var city, area, country, zip;
			for (var i in j)
			{
				for (var k in j[i].types)
				{
					if (j[i].types[k].indexOf("locality") >= 0)
						city = j[i].long_name;
					else if (j[i].types[k].indexOf("administrative_area_level_1") >= 0)
						area = j[i].short_name;
					else if (j[i].types[k].indexOf("country") >= 0)
						country = j[i].long_name;
				}
			}
			console.log(city, area, country);
			player.location.city = city;
			player.location.area = area;
			player.location.country = country;
			methods.updatePlayerProfile();
		})
	},
	updatePlayerProfile: function(){
		users.child(player.email).set(player);
	},
	recordHighScore: function(score){
		//update user's highscore
		if (player.highscore < score){
			player.highscore = score;
			methods.updatePlayerProfile();
		}
	},
	newChallenge: function(user2){
		//get player 2 name
		users.child(user2+"/name").once('value').then(res =>{
			//make new challenge object
			let _challenge = new Challenge(player.email, user2, player.name, res.val());
			//push challenge object to firebase, and get key
			var challengeid = challenge.push(_challenge).key;
			//push challenges to both users
			users.child(player.email).child("challenge_list/"+challengeid).set(0);
			users.child(user2).child("challenge_list/"+challengeid).set(0);
		})	
	},
	acceptChallenge: function(challengeid){
		//change accepted to true
		challenge.child(challengeid).update({accepted: true})
		challenge.child(challengeid).on("value").then(res =>{
			currentChallenge = res.val();
		})
	},
	rejectChallenge: function(challengeid){
		//delete challenge from user database and challenge database
		challenge.child(challengeid).once("value").then(function(res){
			let userone, usertwo;
			userone = res.val().user1;
			usertwo = res.val().user2;

			users.child(userone).child("challenges").child(challengeid).set({});
			users.child(usertwo).child("challenges").child(challengeid).set({});
			challenge.child(challengeid).set({});
		})
	},
	updateChallenges: function(challengeid){

	},
	endChallenge: function(challengeid){
		challenge.child(challengeid).update({ended: true});
		//turn off listener
		challenge.child(currentChallenge.id).off();
	},
	//return scores
	showChallengeResult: function(challengeid){
		var win = 0;
		var lose = 0;
		var playerscores = [], enemyscores = [];
		challenge.child(challengeid).once("value").then(res =>{
			//get scores
			var user2email = res.val().user2;
			var r = res.val().rounds;
			//check each round
			for (let i = 1; i <= 5; i++)
			{
				//check if both players have played in each round
				if (r[i][player.email] != null && r[i][user2email] != null){
					//if player score is higher than enemy's, increment win, else, increment lose
					r[i][player.email][score] >= r[i][user2email][score] ? win++ : lose++;
					
					//get scores
					playerscores.push(r[i][player.email][score]);
					enemyscores.push(r[i][user2email][score]);
				}

				else //if both players haven't played, stop the checking
					break;
			}

			//update scores according to the player
			if (res.val().user1 == player.email)
			{
				challenge.child(challengeid).update({user1score: win});
				challenge.child(challengeid).update({user2score: lose});
			}
			else
			{
				challenge.child(challengeid).update({user1score: lose});
				challenge.child(challengeid).update({user2score: win});
			}
			//return values in case needed.
			return {"win":win, "lose":lose, "playerscores": playerscores, "enemyscores": enemyscores};

		})
	},
	//mode is either "challenge" or "arcade", 
	completeOneGame: function(mode, score, challengeid){
		
		//if score is empty, return
		if (score == null)
			return
		//record high score
		methods.recordHighScore(score);
		if (mode == "challenge" && challengeid != null)
		{
			//make new game
			var new_game = new Game(player.email, player.name, player.location.city, score, moment().format("YYYY-MM-DD HH:mm:ss"));
			//record to challenge
			challenge.child(challengeid).child("user1games").push(new_game);
			//check if opponent completed game
			//this is done by checking if the amount of games you played is the same with your opponent
			challenge.child(challengeid).child("rounds").once("value").then(function(res){
				var obj = res.val();
				for (let i = 1; i <= 5; i++)
				{
					//if the round is empty
					if (obj[i] == "" || (obj[i] != "" && obj[i][player.email] == null))
					{
						challenge.child(challengeid).child("rounds/"+i+"/"+player.email).set(new_game);
						//change whoseTurn;
						challenge.child(challengeid).update({whoseTurn: whoseTurn == user1 ? user2 : user1})
						break;
						
					}
				}
			})

			//update leaderboard in your city and in the world
			methods.updateLeaderboard("city", new_game);
			methods.updateLeaderboard("world", new_game);	
		}
		else if (mode == "arcade")
		{
			//new game
			var new_game = new Game(player.email, player.name, player.location.city, score, moment().format("YYYY-MM-DD HH:mm:ss"));
			
			//update leaderboard in your city and in the world
			methods.updateLeaderboard("city", new_game);
			methods.updateLeaderboard("world", new_game);	
		}

	},
	
	randomString: function(length){
		var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
 		var result = '';
   		for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    		return result;
	},
	searchLeaderboard: function(location){
		lb.child(location).once("value").then(res =>{
			//display results here
		})
	},
	//create random leaderboard for testing (returns object)
	createRandomLeaderboard: function(){
		var _lb = new methods.newLeaderboard();
		//console.log(_lb);
		var random = Math.floor(Math.random()*100);
		for (let i = 20; i >= 1; i--)
		{
			_lb[i]['user'] = methods.randomString(Math.floor(Math.random()*10)+4);
			_lb[i]['score'] = random;
			random += Math.floor(Math.random()*100);
			var rd = Math.floor(Math.random()*10000) * -1;
			var rs = Math.floor(Math.random()*99999999);
			var random_date = moment().add(rs, 'seconds').add(rd, 'days').format("YYYY-MM-DD HH:mm:ss")
			_lb[i]['timestamp'] = random_date;
		}
		return _lb;
	},
	createRandomLeaderboard2: function(n){
		var _lb = new methods.newLeaderboard();
		//console.log(_lb);
		var random = Math.floor(Math.random()*100);
		if (n == null) n = Math.floor(Math.random()*20);
		for (let i = 20-n; i >= 1; i--)
		{
			_lb[i]['user'] = methods.randomString(Math.floor(Math.random()*10)+4);
			_lb[i]['score'] = random;
			random += Math.floor(Math.random()*100);
			var rd = Math.floor(Math.random()*10000) * -1;
			var rs = Math.floor(Math.random()*99999999);
			var random_date = moment().add(rs, 'seconds').add(rd, 'days').format("YYYY-MM-DD HH:mm:ss")
			_lb[i]['timestamp'] = random_date;
		}
		return _lb;
	},
	testUpdateLB: function(lb, _game){
		let arr = []; //convert object to array for easier checking of values
		for (let i = 1; i <= 20; i++)
			arr.push(lb[i.toString()]);
		
		for (let i = 19; i >= 0; i--)
		{
			//if the last element is bigger than the score, break the loop
			if (i == 19 && arr[i].score > _game.score)
				break;
			//if the curr element is smaller, go up the list
			if (arr[i].score < _game.score && i != 0)
				continue;
			//if the score beats all other scores
			else if ( i == 0 && arr[i].score < _game.score)
			{
				arr.unshift(_game);
				break;
			}
			//if the list is empty, set entry to the first
			else if (i == 0 && arr[i].score == 0)
				arr[i] = _game; 
			//if the current score is bigger, insert the score to entry below
			else if (arr[i].score >= _game.score)
			{
				arr.splice(i+1, 0, _game)
				break;
			}			
		}

		//remove excess elements (ie entries >20)
		if (arr.length > 20)
		{
			var n = parseInt(arr.length)-20;
			for (let i = 0; i < n; i++)
				arr.pop();
		}

		//convert array to object
		var _lb = {};
		for (let i = 0; i <= 19; i++)
		{
			let n = i+1;
			_lb[n.toString()] = arr[i];
		}

		
		//console.log(_lb);
		return _lb;
	},
	updateLeaderboard: function(location, _game){
		//player.location.city = "Los Angeles";
		var loc;
		if (location == "city") loc = _game.city.trim();
		else loc = "world";
		
		//get leaderboard
		lb.child(loc).once('value').then(function(res){
			//If leaderboard of that city doesn't exist in database
			if(res.val() == null)
			{
				var g = _game;
				if (location == "city"){
					lb.child(_game.city).set(methods.newLeaderboard());
					methods.updateLeaderboard("city", g);
				} else if (location == "world")
				{
					lb.child("world").set(methods.newLeaderboard());
					methods.updateLeaderboard("world", g);
				}
				
			}
			
			if(res.val() != null) //if leaderboard exists, update it
			{ 
				let arr = []; //convert object to array for easier checking of values
				for (let i = 1; i <= 20; i++)
					arr.push(res.val()[i.toString()]);
				
				for (let i = 19; i >= 0; i--)
				{
					//if the last element is bigger than the score, break the loop
					if (i == 19 && arr[i].score > _game.score)
						break;
					//if the curr element is smaller, go up the list
					if (arr[i].score < _game.score && i != 0)
						continue;
					//if the score beats all other scores
					else if ( i == 0 && arr[i].score < _game.score)
					{
						arr.unshift(_game);
						break;
					}
					//if the list is empty, set entry to the first
					else if (i == 0 && arr[i].score == 0)
						arr[i] = _game; 
					//if the current score is bigger, insert the score to entry below
					else if (arr[i].score >= _game.score)
					{
						arr.splice(i+1, 0, _game)
						break;
					}	
				}

				//remove excess elements (ie entries >20)
				if (arr.length > 20)
				{
					var n = parseInt(arr.length)-20;
					for (let i = 0; i < n; i++)
						arr.pop();
				}

				//convert array to object
				var _lb = {};
				for (let i = 0; i <= 19; i++)
				{
					let n = i+1;
					_lb[n.toString()] = arr[i];
				}

				//update leaderboard to firebase
				lb.child(loc).set(_lb);
			}
		})
	},
	newLeaderboard: function(){
		//put 1 to 20 in leaderboard for both world and city
		var leaderboard = {};
		for (let i = 1; i <= 20; i++)
			leaderboard[i.toString()] = new Game("", "", "", 0, "");
		
		return leaderboard;
	},
}

//GOOGLE LOGIN
$(".btn-google").on("click", function () {
    firebase.auth().signInWithPopup(google_provider).then(function(result) {
        console.log(result);
        window.user = result.user;
        let userId = result.user.uid;//<-- Saved by UID
        var txtEmail = result.user.email;
        var txtEmail2 = txtEmail.replace(/\./g, ',');

        users.child(txtEmail2).once("value").then(res =>{
        	if (res.val() == null)
        		methods.newUser(result.user.displayName, txtEmail2);
        	else
        		player = res.val();
        })

        $(".playerName").html(result.user.displayName);//<-- Change username
        $(".login-page").hide();
        $(".home-page").show();
    }).catch(function (error) {
        console.log(error);
    });
});

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
                alert("You are signed up!");

                auth.signInWithEmailAndPassword(txtEmail, txtPassword);
                var txtEmail2 = txtEmail.replace('.', ',');
                methods.newUser(txtName, txtEmail2);

                $(".playerName").html(player.name);
                $("#signUpUserPassword").val('');
                $("#signUpConfirmPassword").val('');
                $("#signUpName").val('');
                $("#signUpUserEmail").val('');

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

            var txtEmail2 = txtEmail.replace('.', ',');
            users.child(txtEmail2).once("value").then(res => {
            	player = res.val();
            	console.log(player);
            	$(".playerName").html(player.name);
            })

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