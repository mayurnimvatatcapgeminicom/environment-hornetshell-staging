
const cellSolarReducerDefaultState = [];

export default (state = cellSolarReducerDefaultState, action) => {
  switch (action.type) {
    case 'ADD_LOCATION':
      return [            
        action.selectedLocation
      ];    
    default:
      return state;
  }
};
