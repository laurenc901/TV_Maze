"use strict";

const $showsList = $("#shows-list");
const $episodesArea = $("#episodes-area");
const $searchForm = $("#search-form");
const noImgUrl = 'https://tinyurl.com/tv-missing'

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
  // ADD: Remove placeholder & make request to TVMaze search shows API.
  
  let res = await axios.get(`http://api.tvmaze.com/search/shows?q=${term}`);
  let shows = res.data.map(result => {
  let show = result.show ;
  return {
      id: show.id,
      name: show.name,
      summary: show.summary,
      image: show.image ? show.image : noImgUrl,
  };
});

return shows;
  
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    let $show = $(
      `<div class="col-md-6 col-lg-3 Show" data-show-id="${show.id}">
      <div class="card" data-show-id="${show.id}">
        <img class="card-img-top" src="${show.image.medium}">
        <div class="card-body">
          <h5 class="card-title">${show.name}</h5>
          <p class="card-text">${show.summary}</p>
          <button class="btn btn-primary get-episodes">Episodes</button>
        </div>
      </div>  
    </div>
   `);

    $showsList.append($show);  
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  let query = $("#search-query").val();
  if (!query) return;

  $episodesArea.hide();
  
  let currShows = await getShowsByTerm(query);

  
  populateShows(currShows);
}

$searchForm.on("submit", function (evt) {
  evt.preventDefault();

 searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 * https://api.tvmaze.com/shows/1/episodes
 */

async function getEpisodesOfShow(id) {
  let res = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`);
  let epis = res.data.map(epi => ({
      id: epi.id,
      name: epi.name,
      season: epi.season,
      number: epi.number,
  }));

return epis;
 }

/** for each episode info, creates new list item with episode name, season and number
 * appends list item to episode list area
 */

 function populateEpisodes(epis) { 
  const $episodesList = $("#episodes-list");
  $episodesList.empty();
    
  for (let epi of epis) {
    let $item = $(
      `<li>
         ${epi.name}
         (season ${epi.season}, episode ${epi.number})
       </li>
      `);

    $episodesList.append($item);
  }

  $("#episodes-area").show();
}

/** when get episodes button is clicked, this event handler
 * gets the episode info for the show clicked on and runs this through populate episodes
 */

$("#shows-list").on("click", ".get-episodes", async function handleEpisodeClick(evt) {
  let showId = $(evt.target).closest(".Show").data("show-id");
  let epis = await getEpisodesOfShow(showId);
  populateEpisodes(epis);
});