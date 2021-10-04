import React, { Component } from 'react';
import { BrowserRouter,Route,Switch  } from "react-router-dom";
import Principal from '../components/Principal';

class Router extends Component {
    render() {
        return (
            <BrowserRouter>
                <Switch>
                    <Route exact path='/' component={Principal}/>
                </Switch>
            </BrowserRouter>
        );
    }
}

export default Router;
