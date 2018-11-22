// All changes here will automatically refresh browser via webpack :)

import { of, from } from 'rxjs';
import { flatMap } from 'rxjs/operators';

const requestStream$ = of('https://api.github.com/users');

let responseStream$ = requestStream$.pipe(
  flatMap(requestUrl => from(jQuery.getJSON(requestUrl)))
);

responseStream$.subscribe(response => {
  console.log(response);
});
