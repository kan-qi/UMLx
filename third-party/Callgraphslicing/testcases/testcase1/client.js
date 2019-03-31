queryAppServices();

function hello(v){
	encodeURI();
	v();
}

function hello1(){
	
}

function queryAppServices(temp1, temp2, temp3){
   	//document.write("temp1="+temp1+"<br>");
    //document.write("temp2="+temp2+"<br>");
	
    var client = new Usergrid.Client({
        orgName:"milesg",
        appName:"sandbox"
    });
    
    //Here is the name of your book
    var id =temp1;
    
    //Setup the query options object
    var options = {
      type: "partneraccount",
      qs : {"ql": "where id = '"+id+"'"}
    };
	queryAppServices3();
    //Create collection will give back a collection of objects that
    //conform to your query.
	hello(function(){
		hello1();
	});
	client.createCollection(options, function(){
		hello();
	});
	
    client.createCollection(options, function(error, partneraccounts){
    
        if(error) {
           
            //$("#response").append("Error");
        } else {
            //Get the first entity of the collection here.
            var firstBook = partneraccounts.getFirstEntity();
            if(firstBook == null)
            {
                document.write("<html>");
                document.write("<head>");
                
                document.write("<meta name='viewport' content='width=device-width, initial-scale=1.0' />");
                
                document.write("<link rel='stylesheet' type='text/css' href='index.css'>");
                document.write("<link href='//netdna.bootstrapcdn.com/bootstrap/3.0.0/css/bootstrap.min.css' rel='stylesheet'> <link href='//netdna.bootstrapcdn.com/font-awesome/3.2.1/css/font-awesome.css' rel='stylesheet' /> <link href='http://fonts.googleapis.com/css?family=Abel|Open+Sans:400,600' rel='stylesheet' />");
                
                document.write("</head>");
                
                document.write( "<div class='container'>");
                document.write( "<div class='row'>");
                document.write( "<div class='col-md-6 col-md-offset-3 panel panel-default'>");
                
                document.write( "<h1 class='margin-base-vertical'>OOps, Partner does not exist, please type in it again</h1>");
                document.write("<p> The page will be redirected to homepage after 5 seconds. </p>");
                document.write(" </div><!-- //main content --></div><!-- //row --> </div> ");
                
                document.write( "<script> function my_Wait(){window.location = 'http://testg.sinaapp.com';}</script>");
                document.write( "<script> setTimeout('my_Wait()',5000); </script>");
                
                document.write("</html>");
                return false;
            }
            else{
            //Use the get() function to get the title of your book here
            var id = firstBook.get("id");
            //Use the get() function to get the uuid of your book here
            var uuid = firstBook.get("name");
            //$("#response").append("Your book title is:"+title+" it's uuid is:"+uuid);
            //document.write("<br>"+"Your book title is:"+id+"<br>"+" it's uuid is:"+uuid);
  
            queryAppServices2(temp2, temp3);
            }
            return true;
            //document.write("<br>"+"Your book title is:"+title+"<br>"+" it's uuid is:"+uuid);
        }
    }


    );

    // document.write("Hello Wrold!");
}


function queryAppServices2(temp, temp2){
    //document.write("temp="+temp+"<br>");
    var client = new Usergrid.Client({
        orgName:"milesg",
        appName:"sandbox"
    });
    
    queryAppServices3(temp2, temp);
    
    //Here is the name of your book
    var id =temp;
    
    //Setup the query options object
    var options = {
      type: "ecoupon",
      qs : {"ql": "where id = '"+id+"'"}
    };
    
    //Create collection will give back a collection of objects that
    //conform to your query.
    client.createCollection(options, function(error, ecoupons){
        if(error) {
           
            //$("#response").append("Error");
        } else {
            //Get the first entity of the collection here.
            var firstBook = ecoupons.getFirstEntity();
            if(firstBook == null)
            {
                document.write("<html>");
                document.write("<head>");
                
                document.write("<meta name='viewport' content='width=device-width, initial-scale=1.0' />");
                
                document.write("<link rel='stylesheet' type='text/css' href='index.css'>");
                document.write("<link href='//netdna.bootstrapcdn.com/bootstrap/3.0.0/css/bootstrap.min.css' rel='stylesheet'> <link href='//netdna.bootstrapcdn.com/font-awesome/3.2.1/css/font-awesome.css' rel='stylesheet' /> <link href='http://fonts.googleapis.com/css?family=Abel|Open+Sans:400,600' rel='stylesheet' />");
                
                document.write("</head>");
                
                document.write( "<div class='container'>");
                document.write( "<div class='row'>");
                document.write( "<div class='col-md-6 col-md-offset-3 panel panel-default'>");
                
                document.write( "<h1 class='margin-base-vertical'>OOps, eCoupon does not exist, please type in it again</h1>");
                document.write("<p> The page will be redirected to homepage after 5 seconds. </p>");
                document.write(" </div><!-- //main content --></div><!-- //row --> </div> ");
                
                document.write( "<script> function my_Wait(){window.location = 'http://testg.sinaapp.com';}</script>");
                document.write( "<script> setTimeout('my_Wait()',5000); </script>");
                
                document.write("</html>");
                
            }
            else{
            //Use the get() function to get the title of your book here
            var id = firstBook.get("id");
            //Use the get() function to get the uuid of your book here
            var uuid = firstBook.get("Partner_id");
            //$("#response").append("Your book title is:"+title+" it's uuid is:"+uuid);
            //document.write("<br>"+"Your book title is:"+id+"<br>"+" it's Partner_id is:"+uuid);
            queryAppServices3(temp2, temp);
            }
           
            //document.write("<br>"+"Your book title is:"+title+"<br>"+" it's uuid is:"+uuid);
        }
    }


    );

    // document.write("Hello Wrold!");
}



function queryAppServices3(temp, temp2){

    
    document.write("<html>");
    document.write("<head>");
    
    document.write("<meta name='viewport' content='width=device-width, initial-scale=1.0' />");
    
    document.write("<link rel='stylesheet' type='text/css' href='index.css'>");
    document.write("<link href='//netdna.bootstrapcdn.com/bootstrap/3.0.0/css/bootstrap.min.css' rel='stylesheet'> <link href='//netdna.bootstrapcdn.com/font-awesome/3.2.1/css/font-awesome.css' rel='stylesheet' /> <link href='http://fonts.googleapis.com/css?family=Abel|Open+Sans:400,600' rel='stylesheet' />");
    
    document.write("</head>");
    
    document.write( "<div class='container'>");
    document.write( "<div class='row'>");
    document.write( "<div class='col-md-6 col-md-offset-3 panel panel-default'>");
    
    document.write( "<h1 class='margin-base-vertical'>Submitted Successfully. We will contact with you soon. Thank you!</h1>");
    document.write( " <form class='margin-base-vertical' action='index.php' method='POST'>  <p class='text-center'> <input class='btn btn-success btn-lg' type='submit' value='Return'> </p> </form>");
    document.write( "  </div><!-- //main content -->  </div><!-- //row --> </div> ");
    document.write("</html>");
    
    saveData(temp, temp2);
    window.open('Admin_Notification.php');

}


function saveData(temp, temp2){    
    
    var client1 = new Usergrid.Client({
        //Initialize your client
        orgName:"milesg",
        appName:"sandbox"
    });
    

    
    //Setup your options object here. Remember to put your book's 
    //author in the query!
    var options1 = {
        type:"disputenotification",
    };

    var count=0;
            
    //Here is where we'll process the results of the query.
    
    client1.createCollection(options1, function(error, disputenotifications){
   		
           
        while(disputenotifications.hasNextEntity()) {
            //Put your call to .getNextEntity() below.
            var disputenotification = disputenotifications.getNextEntity();
            count = count+1;
        }
       var num=count+1;
    
  
        //Initialize our client
        
        
        var client = new Usergrid.Client({
            orgName:"milesg",
            appName:"sandbox"
        });
        
        //In our options object we set the type of the entitiy
        //and we also set any data that goes along with it
        //in this case it's the books title.
        var options = {
            type:"disputenotification",
            id:num,
            Admin_id:"1",
            eCoupon_id: temp2,
            Description: temp
        };
        
        //Let's create our entity, and display the results
        //of the creation in the html element with the id of response
        client.createEntity(options, function(error, book){
            if(error) {
                
                //error saving book
                $("#response").append("There was an error!");
            } else {
                //book saved successfully
                //Use book.get() here to get the properties from the object we just created!
                var uuid = book.get("uuid");
                var author = book.get("author"); 
                var title = book.get("title"); 
                $("#response").append("Book saved! Its uuid on our server is: "+uuid+"<br/>");
                $("#response").append("The book you saved was: "+title + "<br/>");
                $("#response").append("It's author is: "+author);
               
            }
        }); 
        
        
    });

}





