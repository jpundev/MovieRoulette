
function roulette(){
    let apikey = "8d5d0ae3269d0d64b7c94cbeb92c4de7";
    let usergenre = document.formhtml.keywordname.value;
    let genreids = [];
    let genreurl = "https://api.themoviedb.org/3/genre/movie/list?api_key=8d5d0ae3269d0d64b7c94cbeb92c4de7&language=en-US";
    let posterurl = "http://image.tmdb.org/t/p/w500";
    let allgenres = [];



    let keywordarray = usergenre.split(',');

    let genrepromise = getgenres(genreurl);
    genrepromise.then(function(data){
        for (let i = 0;i < keywordarray.length;i++) {
            for (let x = 0; x < data["genres"].length; x++) {
                if (data["genres"][x]["name"] == keywordarray[i]) {
                    genreids.push(data["genres"][x]["id"])

                }
                allgenres.push(data["genres"][x])

            }

        }

        return genreids;

    })
        .then(function (array) {

            let discoverpromise = discovermovie(array);
            discoverpromise.then(function (result) {


                let random_movie = Math.floor((Math.random() * result["results"].length));
                return result["results"][random_movie]





            })
                .then(function (movie) {

                    console.log(movie);

                    document.body.style.backgroundImage = 'none';
                    document.body.innerHTML = '';



                    let h = document.createElement("H1");
                    let t = document.createTextNode(movie['title']);
                    document.body.style.color = 'black';
                    h.style.display = 'inline-block';
                    h.style.verticalAlign = 'middle';
                    document.body.style.paddingTop= '100px';

                    h.appendChild(t);
                    document.body.appendChild(h);

                    let poster = document.createElement("img");
                    poster.src = posterurl+movie['poster_path'];
                    poster.style.display = 'block';
                    poster.style.marginLeft = 'auto';
                    poster.style.marginRight = 'auto';
                    poster.style.width = '50';
                    document.body.appendChild(poster);

                    tableCreate(movie,allgenres);


                })

        })
}



function getgenres(genreurl) {



    // Gets matching GenreID's by querying all genres and then matching them by the user's genres

    return fetch(genreurl)
        .then(response=>response.json())
        .then(function (json) {
            return json;
        })
}

function discovermovie (genreids) {


    let genrestring = genreids.join();
    let discoverurl = "https://api.themoviedb.org/3/discover/movie?api_key=8d5d0ae3269d0d64b7c94cbeb92c4de7&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&with_genres="+genrestring;
    return fetch(discoverurl)
        .then(response=>response.json())
        .then(function (json) {
            return json;

        })
}

function tableCreate(movie,allgenres){
    let body = document.body,
        tbl  = document.createElement('table');
    tbl.style.width  = '100px';
    tbl.style.border = '1px solid black';
    let genrenames = [];


    for(let x = 0; x<movie["genre_ids"].length;x++){
        for(let y = 0; y <allgenres.length;y++){
            if (movie["genre_ids"][x]==allgenres[y]["id"]){
                genrenames.push(allgenres[y]["name"])
            }
        }


    }

    console.log(genrenames)

    for(let i = 0; i < 4; i++){
        let tr = tbl.insertRow();
        for(let j = 0; j < 2; j++){

            let td = tr.insertCell();
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
            }
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
            }

            td.style.border = '1px solid black';


        }
    }
    tbl.align = "center";
    tbl.style.width = "800px";
    tbl.style.height = "400px";
    tbl.style.paddingTop = "30px";
    body.appendChild(tbl);
}
