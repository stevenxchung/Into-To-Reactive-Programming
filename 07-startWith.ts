// There is a small bug previously when hitting refresh, it does not clear right away
// We fix this by using startWith()

import { of, from, fromEvent } from 'rxjs';
import { flatMap, map, merge } from 'rxjs/operators';
import * as $ from 'jquery';

let refreshButton = document.querySelector('.refresh');
let refreshClickStream = fromEvent(refreshButton, 'click');
let startupRequestStream = of('https://api.github.com/users');

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

let responseStream = requestOnRefreshStream.pipe(
  merge(startupRequestStream),
  flatMap(requestUrl => from($.getJSON(requestUrl)))
);

let createSuggestionStream = (responseStream: any) => {
  return responseStream.pipe(
    map(
      (listUser: any) => listUser[Math.floor(Math.random() * listUser.length)]
    )
  );
};

let suggestion1Stream$ = createSuggestionStream(responseStream);
let suggestion2Stream$ = createSuggestionStream(responseStream);
let suggestion3Stream$ = createSuggestionStream(responseStream);

let renderSuggestion = (userData: any, selector: any) => {
  let element = document.querySelector(selector);
  let usernameEl = element.querySelector('.username');
  usernameEl.href = userData.html_url;
  usernameEl.textContent = userData.login;
  let imgEl = element.querySelector('img');
  imgEl.src = userData.avatar_url;
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
