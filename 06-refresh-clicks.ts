// Send new requests from refresh clicks in RxJS

import { of, from, fromEvent } from 'rxjs';
import { flatMap, map, merge } from 'rxjs/operators';
import * as $ from 'jquery';

// Select DOM element with refresh class
const refreshButton = document.querySelector('.refresh');

// Create a click observable using fromEvent()
let refreshClickStream$ = fromEvent(refreshButton, 'click');

// Create an observable stream of GitHub users using of()
let startupRequestStream$ = of('https://api.github.com/users');

// Returns a random GitHhub user from the array
let requestOnRefreshStream$ = refreshClickStream$.pipe(
  map(ev => {
    let randomOffset = Math.floor(Math.random() * 500);
    return 'https://api.github.com/users?since=' + randomOffset;
  })
);

//------a---b------c----->
//s---------------------->
// merge both data streams
//s-----a---b------c----->

// Merges requestOnRefreshStream$ with startupRequestStream$ and flattens stream into a JSON array
let responseStream$ = requestOnRefreshStream$.pipe(
  merge(startupRequestStream$),
  flatMap(requestUrl => from($.getJSON(requestUrl)))
);

// Function that receives the responseStream$ and returns an array of GitHub users in random order
let createSuggestionStream = (responseStream$: any) => {
  return responseStream$.pipe(
    map(
      (listUser: any) => listUser[Math.floor(Math.random() * listUser.length)]
    )
  );
};

// Set each randomly generated user from the GitHub array
let suggestion1Stream$ = createSuggestionStream(responseStream$);
let suggestion2Stream$ = createSuggestionStream(responseStream$);
let suggestion3Stream$ = createSuggestionStream(responseStream$);

// Grab username and image from GitHub user array and render in the DOM
let renderSuggestion = (userData: any, selector: any) => {
  const element = document.querySelector(selector);
  const usernameEl = element.querySelector('.username');
  usernameEl.href = userData.html_url;
  usernameEl.textContent = userData.login;
  const imgEl = element.querySelector('img');
  imgEl.src = userData.avatar_url;
};

// Get data from stream for a single random user from the GitHub array
suggestion1Stream$.subscribe((user: any) => {
  renderSuggestion(user, '.suggestion1');
});

suggestion2Stream$.subscribe((user: any) => {
  renderSuggestion(user, '.suggestion2');
});

suggestion3Stream$.subscribe((user: any) => {
  renderSuggestion(user, '.suggestion3');
});
