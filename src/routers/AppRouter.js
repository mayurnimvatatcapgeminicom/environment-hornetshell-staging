import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import SearchLocation from '../components/SearchLocation';
import NotFoundPage from '../components/NotFoundPage';
import Header from '../components/Header';
import SelectAreaPage from '../components/SelectArea';
import {} from '../utils';

const AppRouter = () => (
  <BrowserRouter>
    <div>
      <Header />
      <Switch>
        <Route path="/" component={SearchLocation} exact={true} />   
        <Route path="/SelectArea" component={SelectAreaPage} />     
        
      </Switch>
    </div>
  </BrowserRouter>
);

export default AppRouter;
