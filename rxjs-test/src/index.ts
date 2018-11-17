// All changes here will automatically refresh browser via webpack :)

import { of, from, fromEvent } from 'rxjs';
import {
  flatMap,
  map,
  merge,
  startWith,
  shareReplay,
  tap
} from 'rxjs/operators';
import * as $ from 'jquery';

const refreshButton = document.querySelector('.refresh');
const closeButton1 = document.querySelector('.close1');
const closeButton2 = document.querySelector('.close2');
const closeButton3 = document.querySelector('.close3');

const refreshClickStream = fromEvent(refreshButton, 'click');
const close1Clicks = fromEvent(closeButton1, 'click');
const close2Clicks = fromEvent(closeButton2, 'click');
const close3Clicks = fromEvent(closeButton3, 'click');

const startupRequestStream = of('https://api.github.com/users');

let requestOnRefreshStream = refreshClickStream.pipe(
  map(ev => {
    let randomOffset = Math.floor(Math.random() * 500);
    return 'https://api.github.com/users?since=' + randomOffset;
  })
);

//------a---b------c----->
//s---------------------->
// merge both data streams
//s-----a---b------c----->

let responseStream = startupRequestStream.pipe(
  merge(requestOnRefreshStream),
  flatMap(requestUrl => from($.getJSON(requestUrl))),
  tap(val => {
    console.log('In startupRequestStream pipe!');
  }),
  shareReplay(1)
);

// ----u---------->
//   startWith(N)
// N---u---------->
// -------N---N--->
//     merge
// N---u--N---N-u->

let createSuggestionStream = (responseStream: any) => {
  return responseStream.pipe(
    map(
      (listUser: any) => listUser[Math.floor(Math.random() * listUser.length)]
    ),
    startWith(null),
    merge(refreshClickStream.pipe(map(ev => null)))
  );
};

let suggestion1Stream$ = createSuggestionStream(responseStream);
let suggestion2Stream$ = createSuggestionStream(responseStream);
let suggestion3Stream$ = createSuggestionStream(responseStream);

// Rendering
let renderSuggestion = (suggestedUser: any, selector: any) => {
  let suggestionEl = document.querySelector(selector);
  if (suggestedUser === null) {
    $(selector).hide()
  } else {
    // Using vanilla JS did not show for some reason
    $(selector).show()
    let usernameEl = suggestionEl.querySelector('.username');
    usernameEl.href = suggestedUser.html_url;
    usernameEl.textContent = suggestedUser.login;
    let imgEl = suggestionEl.querySelector('img');
    imgEl.src = '';
    imgEl.src = suggestedUser.avatar_url;
  }
};

suggestion1Stream$.subscribe((user: any) => {
  renderSuggestion(user, '.suggestion1');
});

suggestion2Stream$.subscribe((user: any) => {
  renderSuggestion(user, '.suggestion2');
});

suggestion3Stream$.subscribe((user: any) => {
  renderSuggestion(user, '.suggestion3');
});
