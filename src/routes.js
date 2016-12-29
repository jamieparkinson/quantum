import React from 'react';
import {
    Route,
    IndexRoute
} from 'react-router';

import {
    IndexComponent,
    Grover,
    Shor
} from './components/';

const routes = (
    <Route path="/">
        <IndexRoute component={IndexComponent}/>
        <Route path="grover"
               component={Grover}/>
        <Route path="shor"
               component={Shor}/>
    </Route>
);

export default routes;