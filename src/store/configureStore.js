import { createStore, combineReducers } from 'redux';
import cellSolarReducer from '../reducers/cellsolar';


export default () => {
  const store = createStore(
    combineReducers({
      location: cellSolarReducer
      
    }),
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
  );

  return store;
};
