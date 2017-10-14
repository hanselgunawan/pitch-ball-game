//INIT FUNCTION FOR STARTUP
function init(){
    $(".login-page").show();
    $(".signup-page").hide();
    $(".home-page").hide();
    $(".challenge-page").hide();
    $(".friend-email-message").hide();
    $(".leaderboard-page").hide();
    $(".leaderboard-empty-message").hide();//if there's no leaderboard score in DB, SHOW this!
    $(".existing-empty-message").hide();//if no challenges, SHOW this!
    $(".existing-challenge-page").hide();
    $(".challenge-details-page").hide();
    $(".row-incorrect-credentials-login").hide();
    $(".game-page").hide();
    $(".row-email-exists").hide();
    $(".row-password-not-matched").hide();
}

$(document).ready(function(){
    init();


    // LOGIN MENU

        //BUTTON TO SIGN UP PAGE 
        $("#signUpLoginBtn").on("click", function () {
            $(".login-page").hide();
            $(".signup-page").show();
        });

    // MAIN MENU

        //ARCADE GAME BUTTON
        $("#playGameBtn").on("click", function (event) {
            $(".home-page").hide();
            $(".game-page").show();
            startGame();
            currentMode = "arcade";
        });

        //NEW CHALLENGE BUTTON
        $("#challengeBtn").on("click", function (event) {
            $(".home-page").hide();

            //SHOW CHALLENGE PAGE
            $(".challenge-page").show();
        });

        //LEADERBOARD BUTTON
        $("#leaderboardBtn").on("click", function (event) {
            $(".home-page").hide();
            $(".leaderboard-page").show();
            $(".table-city").show();
            display_lb(player.location.city);
            $(".table-world").hide();
        });

        //CHALLENGE LIST BUTTON
        $("#existingChallengesBtn").on("click", function () {
            $(".home-page").hide();

            //SHOW CHALLENGE PAGE
            $(".existing-challenge-page").show();
            display_challenge();
        });

    //LEADERBOARD

        //CITY TAB
        $(document).on("click", "#cityButton", function () {
            console.log("clicked city btn");
            $(".table-city").show();
            display_lb(player.location.city);
            $(".table-world").hide();
        });

        //WORLD TAB
        $(document).on("click", "#worldButton", function () {
            console.log("clicked world btn");
            $(".table-city").hide();
            display_lb("world");
            $(".table-world").show(); 
        });


    //MY CHALLENGES

        //EACH CHALLENGE ENTRY BUTTON --> CHALLENGE DETAILS
        $(".challenge-entry").on("click", function () {
            $(".challenge-details-page").show();
            $(".existing-challenge-page").hide();
            //Display Challenge Details according to the challenge ID
            display_challenge_details($(this).parent().attr("cid"));
        });

        //ACCEPT CHALLENGE
        $(".acceptBtn").on("click", function (e) {
            e.stopPropagation();//to handle .challenge-entry click
            alert("Accepted!");
            var c_id = $(this).parent().attr("cid");
            challenge.child(c_id).once("value").then(res =>{
                currentMode = res.val().id;
            })
            methods.acceptChallenge(c_id);
        });

        //REJECT CHALLENGE
        $(".rejectBtn").on("click", function (e) {
            e.stopPropagation();//to handle .challenge-entry click
            alert("Rejected!");
            var c_id = $(this).parent().attr("cid");
            methods.rejectChallenge(c_id);
        });

        //PLAY ANOTHER ROUND BUTTON
        $(".playBtn").on("click", function (e) {
            e.stopPropagation();//to handle .challenge-entry click
            alert("Play!");
            var c_id = $(this).parent().attr("cid");
            challenge.child(c_id).once("value").then(res =>{
                currentMode = res.val().id;
            })
        });

        //BACK TO 'MY CHALLENGE'
        $(".back-to-my-challenge").on("click", function () {
            $(".challenge-details-page").hide();
            $(".existing-challenge-page").show();
        });


    //NEW CHALLENGE

        //CREATE CHALLENGE BUTTON VIA EMAIL
        $("#challengeEmailBtn").on("click", function (event) {
            event.preventDefault();
            if($(".friend-email-message").val() !== "")
            {
                $(".friend-email-message").show();
            }
            else{
                var user2email = $("#challengeEmail").val().trim();
                user2email = user2email.replace(/\./g, ',');
                methods.newChallenge(user2email);
                $(".challenge-page").hide();
                $(".home-page").show();
            }
        });

    //RETURN TO MAIN MENU BUTTON
    $(".back-to-main-menu").on("click", function () {
        $(".challenge-page").hide();
        $(".leaderboard-page").hide();
        $(".existing-challenge-page").hide();
        $(".home-page").show();
    });

    $(".back-to-login-page").on("click", function () {
        $(".signup-page").hide();
        $(".login-page").show();
    });
})


//DISPLAY LEADERBOARD LIST
function display_lb(location){
    //GET ID OF TABLE
    var tableid;
    if (location != "world")
        tableid = "#cityLeaderboardTable";
    else tableid = "#worldLeaderboardTable";

    $(tableid).empty();
    var worldmode = "<tr><th colspan=\"2\" class=\"table-tabs tabs-th\"><a href=\"#\" id=\"cityButton\" class=\"a-city-inactive cityBtn\">City</a></th>"+
    "<th colspan=\"2\" class=\"tabs-th\"><a id=\"worldButton\" href=\"#\" class=\"a-world worldBtn\">World</a></th>"+
    "</tr><tr><th>Rank</th><th>Name</th><th>Area</th><th>Score</th></tr>";
    
    var citymode = "<tr> <th colspan=\"2\" class=\"table-tabs tabs-th\"><a href=\"#\" id=\"cityButton\" class=\"a-city cityBtn\">City</a></th>"+
    "<th colspan=\"2\" class=\"tabs-th\"><a id=\"worldButton\" href=\"#\" class=\"a-world-inactive worldBtn\">World</a></th>"+
    "</tr><tr><th>Rank</th><th>Name</th><th>Area</th><th>Score</th></tr>";

    if (location == "world")
        $(tableid).append(worldmode);
    else $(tableid).append(citymode);

    //GET LEADERBOARD INFORMATION
    lb.child(location).once("value").then(res =>{
        var a = res.val();
        for (let i = 1; i <= 20; i++)
        {
            var table_entry = $("<tr>");
            var rank = $("<td>").html(i);
            var name = $("<td>").html(a[i].name);
            var city = $("<td>").html(a[i].city);
            var score = $("<td>").html(a[i].score);
            table_entry.append(rank);
            table_entry.append(name);
            table_entry.append(city);
            table_entry.append(score);
            $(tableid).append(table_entry);
        }
    })
}


//MAKE CHALLENGE LIST
function display_challenge(){
    users.child(player.email).once('value').then(res =>{
        var a  = res.val().challenge_list;
        console.log(a);
        var table_head_none = "<tr><th>Challenger</th><th>Score<br> <span class=\"score-desc\">(You - Challenger)</span></th><th>Status</th><th colspan=\"2\">Action</th></tr>"+
                        "<tr class=\"existing-empty-message\"><th colspan=\"4\">No Challenges</th></tr>";

        var table_head = "<tr><th>Challenger</th><th>Score<br> <span class=\"score-desc\">(You - Challenger)</span></th><th>Status</th><th colspan=\"2\">Action</th></tr>";
        $("#challengeTable").empty();


        if (a == null)
            $("#challengeTable").append(table_head_none);
        else
            $("#challengeTable").append(table_head)

        for (var i in a)
        {
            challenge.child(i).once('value').then(result =>{
                    var obj = result.val();
                    //JQUERY OBJECTS TO BE ADDED TO TABLE
                    var challenge_entry = $("<tr>");
                    challenge_entry.addClass("challenge-entry");
                    challenge_entry.attr("cid", i);

                    var opponent = $("<td>");
                    var score = $("<td>");
                    var status = $("<td>");
                    var action1 = $("<button>");
                    var action2 = $("<button>");

                    //ADD INFORMATION TO JQUERY OBJECTS

                    //get which user you are
                    var you, enemy;
                    if (player.email != obj.user1)
                    {
                        you = "user2"
                        enemy = "user1"
                    }
                    else
                    {
                        you = "user1";
                        enemy = "user2";
                    }

                    //get enemyname
                    var enemyName = obj[enemy+"name"];

                    //add values to jquery objects
                    opponent.html(enemyName);
                    score.html(obj[you+"score"]+" - "+obj[enemy+"score"]);
                    status.html(obj.accepted == false ? "Pending" : obj.whoseTurn == obj[you] ? "Your Turn" : "Enemy's Turn");

                    //append first three elements
                    challenge_entry.append(opponent);
                    challenge_entry.append(score);
                    challenge_entry.append(status);

                    //create buttons according to the status of challenge
                    if (status.html() == "Pending")
                    {
                        action1.addClass("btn btn-success acceptBtn");
                        action2.addClass("btn btn-danger rejectBtn");
                        action1.html("Accept");
                        action2.html("Reject");

                        challenge_entry.append(action1);
                        challenge_entry.append(action2);
                    }
                    else if (status.html() == "Your Turn")
                    {
                        action1.addClass("btn btn-secondary playBtn");
                        action1.attr("colspan", 2);
                        challenge_entry.append(action1);

                    }
                    else if (status.html() == "Enemy's Turn")
                    {
                        action1.addClass("btn btn-secondary playBtn disabled");
                        action1.attr("colspan", 2);
                        challenge_entry.append(action1);
                    }

                    //append entry to table
                    $("#challengeTable").append(challenge_entry);
                }
            )
        }
    })
}

//DISPLAY CHALLENGE DETAILS
function display_challenge_details(challengeid){
    challenges.child(challengeid).once('value').then(res =>{
        var a = res.val()["rounds"];
        $("#challengeDetailsTable").empty();
        //ITERATE THROUGH ALL THE ROUNDS
        for (let i = 1; i <= 5; i++)
        {

            if (a[i] == "") continue;

            var tr = $("<tr>");
            var round = $("<td>");
            var score = $("<td>");
            var userscore = $("<span>");
            var enemyscore = $("<span>");

            //ADD ROUND NUMBER
            round.html(i);

            //GET USER SCORE
            if (a[i][player.email] != "")
                userscore.html(a[i][player.email].score);
            else
                userscore.html("N/A");

            //GET ENEMY SCORE -- check if enemy is user1 or user2, and then retrieve score
            var enemyid;
            if (res.val().user1 == player.email)
                enemyid = res.val().user2;
            else enemyid = res.val().user1;

            if (a[i][enemyid] != "")
                enemyscore.html(a[i][enemyid].score);
            else enemyscore.html("N/A");
            
            //BOTH PLAYERS HAVE PLAYED
            if (enemyscore.html() != "N/A" && userscore.html() != "N/A"){
                let us = parseInt(userscore.html());
                let es = parseInt(enemyscore.html());
                //ADD COLOR TO SCORE TO DETERMINE THE WINNER
                if (us > es)
                {
                    userscore.css("color", "green");
                    enemyscore.css("color", "red");
                }
                else
                {
                    userscore.css("color", "red");
                    enemyscore.css("color", "green");
                }
            }

            //MAKE SCORE ELEMENT
            score.append(userscore);
            score.append(" - ");
            score.append(enemyscore);

            //APPEND DATA TO THE WHOLE ENTRY
            tr.append(round);
            tr.append(score);

            //APPEND TR ELEMENT TO TABLE
            $("#challengeDetailsTable").append(tr);
        }
    })
}
