
function roulette(){
    //Apikey for TheMovieDB
    let apikey = "8d5d0ae3269d0d64b7c94cbeb92c4de7";
    //Obtain the user input from the html
    let usergenre = document.formhtml.keywordname.value;
    //Initialize variables
    let genreids = [];
    let genreurl = "https://api.themoviedb.org/3/genre/movie/list?api_key=8d5d0ae3269d0d64b7c94cbeb92c4de7&language=en-US";
    let posterurl = "http://image.tmdb.org/t/p/w500";
    let allgenres = [];


    //Format the user input so it can be usable for query searches
    let keywordarray = usergenre.split(',');
    let propergenrearray = [];
    for (let x = 0; x < keywordarray.length;x++){
        keywordarray[x] = keywordarray[x].toLowerCase();
        keywordarray[x] = keywordarray[x].trim();
        propergenrearray.push(keywordarray[x].charAt(0).toUpperCase()+keywordarray[x].slice(1));
    }

    //Get a list of all genres and their ID's by initializing a query search
    //Wait for the query to finish searching by utilizing promises
    //Afterwards we check if we have matching genres from the user input and push the ID
    let genrepromise = getgenres(genreurl);
    genrepromise.then(function(data){
        //
        for (let i = 0;i < propergenrearray.length;i++) {
            for (let x = 0; x < data["genres"].length; x++) {
                if (data["genres"][x]["name"] == propergenrearray[i]) {
                    genreids.push(data["genres"][x]["id"])
                }
                allgenres.push(data["genres"][x])
            }
        }

        return genreids;
    })

        //Get a list of all movies and their ID's by initializing a query search
        //Once again we utilize promises from fetchs
        .then(function (array) {
            let discoverpromise = discovermovie(array);
            discoverpromise.then(function (result) {

                // Because there are thousands and thousands of movies under genres and also the fact that some movies are missing lots of relevant information
                // I have decided to focus on the top 20 movies under the genre and randomize the movie within that
                let random_movie = Math.floor((Math.random() * result["results"].length));
                return result["results"][random_movie]
            })

                .then(function (movie) {

                    //We call function getmoviedetails to obtain a list of all the movie's details.
                    let moviepromise = getmoviedetails(movie["id"])
                        moviepromise.then(function (moviedetails) {

                            //We reset the background image and clear the contents of the page
                            document.body.style.backgroundImage = 'none';
                            document.body.innerHTML = '';

                            // Rebuild the html page adding the header
                            let h = document.createElement("H1");
                            let t = document.createTextNode(moviedetails['title']);
                            document.body.style.color = 'black';
                            h.style.display = 'inline-block';
                            h.style.verticalAlign = 'middle';
                            document.body.style.paddingTop= '100px';
                            h.appendChild(t);
                            document.body.appendChild(h);

                            //Add the poster image of the randomized movie
                            let poster = document.createElement("img");
                            poster.src = posterurl+moviedetails['poster_path'];
                            poster.style.display = 'block';
                            poster.style.marginLeft = 'auto';
                            poster.style.marginRight = 'auto';
                            poster.style.width = '50';
                            document.body.appendChild(poster);

                            //Get the list of cast and crew from the movie ID by initializing another query search

                            let castcrewpromise = getmoviecast(movie["id"])
                                castcrewpromise.then(function (cast) {

                                    //Call table create to create the table
                                    tableCreate(moviedetails,allgenres,cast);

                                    //Initializes the button to refresh the page
                                    let returnbutton = document.createElement('button')

                                    //button formats
                                    returnbutton.style.marginTop = '30px';
                                    returnbutton.style.textAlign = 'center';
                                    returnbutton.type = "button";
                                    returnbutton.innerHTML = "Try Another Genre!";
                                    document.body.appendChild(returnbutton);

                                    returnbutton.addEventListener("click",function () {
                                        //refreshes the page
                                        location.reload();

                                    })


                                })
                        })
                })
        })
}


//Function to get genres by fetching the given URL and return the json
function getgenres(genreurl) {

    //Fetch returns a promise and it is annoyingly asynchronous so we must return the promise.
    return fetch(genreurl)
        .then(response=>response.json())
        .then(function (json) {
            return json;
        })
}

//Function to get a list of all movies given the genre ids by making a query search
function discovermovie (genreids) {

    //We join the genreID's with %2C (a comma)
    let genrestring = genreids.join("%2C");
    let discoverurl = "https://api.themoviedb.org/3/discover/movie?api_key=8d5d0ae3269d0d64b7c94cbeb92c4de7&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&with_genres="+genrestring;
    //Fetch returns a promise and it is annoyingly asynchronous so we must return the promise.
    return fetch(discoverurl)
        .then(response=>response.json())
        .then(function (json) {
            return json;

        })
}
//Function to get a movie's Details (excluding cast) given the movie ID by making a query search
function getmoviedetails(movieid) {

    let getmovieurl = "https://api.themoviedb.org/3/movie/"+movieid+"?api_key=8d5d0ae3269d0d64b7c94cbeb92c4de7&language=en-US"
    //Fetch returns a promise and it is annoyingly asynchronous so we must return the promise.
    return fetch(getmovieurl)
        .then(response=>response.json())
        .then(function (data) {
            return data
        })
}
//Function to get the cast of a movie given a movie ID by making another query search
function getmoviecast(movieid) {
    let url = "https://api.themoviedb.org/3/movie/"+movieid+"/credits?api_key=8d5d0ae3269d0d64b7c94cbeb92c4de7";
    //Fetch returns a promise and it is annoyingly asynchronous so we must return the promise.
    return fetch(url)
        .then(response=>response.json())
        .then(function (data) {
            return data;

        })

}

//Function that creates the table with all the content and details. Takes in moviedetails,genres,and cast.
function tableCreate(movie,allgenres,cast){

    //Initial table set up
    let body = document.body,
        tbl  = document.createElement('table');
    tbl.style.width  = '100px';
    tbl.style.border = '1px solid black';

    //Initialize variables and arrays
    let genrenames = [];
    let productioncompanies = [];
    let productioncountries = [];
    let actors = [];
    let crew = [];

    //Match and compare genre ID's and append the string names of the genres to the array.
    for(let x = 0; x<movie["genres"].length;x++){
        for(let y = 0; y <allgenres.length;y++){
            if ((movie["genres"][x]["id"]==allgenres[y]["id"]) && (!(genrenames.includes(allgenres[y]["name"])))){
                genrenames.push(allgenres[y]["name"])
            }
        }
    }
    //Append a list of production companies to array
    for(let x = 0; x<movie["production_companies"].length;x++){
        productioncompanies.push(movie["production_companies"][x]["name"]);

    }
    //Append a list of production countries to array
    for(let x = 0; x<movie["production_countries"].length;x++){
        productioncountries.push(movie["production_countries"][x]["name"]);

    }
    //Append a list of cast to array
    for(let x = 0; x<cast["cast"].length;x++){
        actors.push(cast["cast"][x]["name"]);

    }
    //Append a list of crew to array
    for(let x = 0; x<cast["crew"].length;x++){
        crew.push(cast["crew"][x]["name"]);

    }

    //We create our rows/columns using a 2D method where i = rows and j = columns
    for(let i = 0; i < 10; i++){
        let tr = tbl.insertRow();
        for(let j = 0; j < 2; j++){

            let td = tr.insertCell();
            //Checks if we are in the 2nd column for data ENTRY
            if (j == 1 ){
                if (i == 0 ){
                    td.appendChild(document.createTextNode(movie['release_date']))
                }
                else if(i == 1){
                    td.appendChild(document.createTextNode(movie['overview']))
                }
                else if(i == 2){
                    td.appendChild(document.createTextNode(genrenames.join()))
                }
                else if(i==3){
                    td.appendChild(document.createTextNode(movie['vote_average']))
                }
                else if(i == 4){
                    td.appendChild(document.createTextNode(productioncompanies.join()))

                }
                else if(i == 5){
                    td.appendChild(document.createTextNode(productioncountries.join()))

                }
                else if(i == 6){
                    if(movie['revenue'] == '0'){
                        td.appendChild(document.createTextNode("N/A"))
                    }
                    td.appendChild(document.createTextNode("$"+movie["revenue"] ))

                }
                else if(i == 7){
                    if(movie['budget'] == '0'){
                        td.appendChild(document.createTextNode("N/A"))
                    }
                    td.appendChild(document.createTextNode("$"+movie["budget"] ))

                }
                else if(i == 8){
                    td.appendChild(document.createTextNode(actors.join()))

                }
                else if(i == 9){
                    td.appendChild(document.createTextNode(crew.join()))

                }

            }
            //If we are in the 1st column for data DESCRIPTION
            if (j == 0 ){
                if (i == 0 ){
                    td.appendChild(document.createTextNode("Release Date"))
                }
                else if(i == 1){
                    td.appendChild(document.createTextNode("Overview"))
                }
                else if(i == 2){
                    td.appendChild(document.createTextNode("Genres"))
                }
                else if(i==3){
                    td.appendChild(document.createTextNode("Vote Average"))
                }
                else if(i == 4){
                    td.appendChild(document.createTextNode("Production Companies"))

                }
                else if(i == 5){
                    td.appendChild(document.createTextNode("Production Countries"))

                }
                else if(i == 6){
                    td.appendChild(document.createTextNode("Revenue"))

                }
                else if(i == 7){
                    td.appendChild(document.createTextNode("Budget"))

                }
                else if(i == 8){
                    td.appendChild(document.createTextNode("Cast"))

                }
                else if(i == 9){
                    td.appendChild(document.createTextNode("Crew"))

                }

            }

            td.style.border = '1px solid black';


        }
    }
    //Table formatting
    tbl.align = "center";
    tbl.style.width = "800px";
    tbl.style.height = "400px";
    tbl.style.marginTop = '30px';
    body.appendChild(tbl);
}

