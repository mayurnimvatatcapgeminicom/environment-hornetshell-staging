export const addSelectedLocation = (
  {
    location = ''
  } = {}
) => ({
  type: 'ADD_LOCATION',
  selectedLocation: {    
      location    
  }
});

