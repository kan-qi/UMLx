$(document).ready(function(){

  // navbar
  $("#homePage").click(function () {
    $("#teams").hide();
    $("#wiki").hide();
    $('#home').fadeIn('slow');
  });

  $("#wikiPage").click(function () {
    $("#teams").hide();
    $("#home").hide();
    $('#wiki').fadeIn('slow');
  });

  $("#teamsPage").click(function () {
    $("#home").hide();
    $("#wiki").hide();
    $('#teams').fadeIn('slow');
  });



  // the wiki page
  var copyText= [
   'ML diagrams have been widely used to describe structural and behavioral aspects of the system to be developed. Except for specifying design decisions and supporting exchange of design ideas, the information inferred from UML model analysis helps us to understand the scope and potential risks in software development.In this project, we will develop a web-based tool to support automated analysis of different kinds of UML diagrams (robustness diagrams, sequence diagrams, class diagrams, etc.) based on certain established metrics and present the analytical results in intuitive formats for the end users to understand. To accomplish the task, we will develop algorithms to recognize patterns in the data set, and adopt machine learning techniques to understand the significant relationships, and build the system on top of popular web technologies – MongoDb, Nodejs, HTML/CSS, Javascript, etc. - to deliver easy access of the functions of the system.',
   'Simply put, the second line',
   'impressed by the third line.'
  ];
  $("#first").click(function () {
    $("#card").hide();
    $("#card-text").text(copyText[0]);
    $('#card').fadeIn('slow');
  });
  $("#second").click(function () {
    $("#card").hide();
    $("#card-text").text(copyText[1]);
    $('#card').fadeIn('slow');
  });

  $("#third").click(function () {
    $("#card").hide();
    $("#card-text").text(copyText[2]);
    $('#card').fadeIn('slow');
  });

});


// $(function () {
//     $("#card").hide().fadeIn(4000);      // DOESN'T WORK
// });
