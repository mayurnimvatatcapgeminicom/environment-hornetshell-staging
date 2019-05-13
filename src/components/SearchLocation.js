import React from 'react';
import { connect } from 'react-redux';
import PlaceAutoComplete from './PlaceAutoComplete';
import { addSelectedLocation } from '../actions/cellsolar';

 class SerachLocationPage extends React.Component {
  constructor(props) {
    super(props);    
}
componentDidMount() {
  this.props.dispatch(addSelectedLocation([]));
}

  render() {
    return (
      <div className="masthead text-white text-center">
        <div className="overlay"></div>
        <div className="container">
          <div className="row">
            <div className="col-xl-9 mx-auto">
              <h1 className="mb-5">Fyll i adress och räkna fram kostnad</h1>
            </div>
            <div className="col-md-10 col-lg-8 col-xl-7 mx-auto">
              <PlaceAutoComplete placeholdertext="Skriv in din adress här..."
                onSubmit={(location) => {
                  this.props.dispatch(addSelectedLocation(location));
                  this.props.history.push('/SelectArea');
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => { 
  
   let pastLocation={};
    if(state.location.length!==0)
    {
      pastLocation: state.location[0].location
    }
    return {
      location: pastLocation
  };    
  
};

export default connect(mapStateToProps)(SerachLocationPage);
