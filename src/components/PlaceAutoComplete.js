import React from 'react';
import { load_google_maps } from '../utils';
import { addSelectedLocation } from '../actions/cellsolar';
import { connect } from 'react-redux';
export default class PlaceAutoComplete extends React.Component {

    // Define Constructor
    constructor(props) {
        super(props);
        // Declare State
        this.state = {
            selectedLocation: []
        };

    }

    handlePlaceSelect = () => {

        // Extract City From Address Object
        const addressObject = this.autocomplete.getPlace();
        if (addressObject) {
            const address = addressObject.address_components;
            // Check if address is valid
            if (address) {
                // Set State
                this.setState(
                    {
                        selectedLocation: addressObject
                    }
                );
            }
        }
    }
    componentDidMount() {

        var options = {
            types: ['address'],
        };
        const googleMapsPromise = load_google_maps();
        Promise.all([
            googleMapsPromise
        ])
            .then(values => {

                this.autocomplete = new google.maps.places.Autocomplete(
                    document.getElementById('placeautosuggest')
                );
                // Fire Event when a suggested name is selected
                this.autocomplete.addListener('place_changed', this.handlePlaceSelect);
            });
    }

    onSubmit = (e) => {
        e.preventDefault();

        if (this.state.selectedLocation.length === 0) {
            return;
        } else {

            this.props.onSubmit({
                location: this.state.selectedLocation,

            });
        }
    };
    render() {
        return (
            <div>
                <form onSubmit={this.onSubmit}>
                    <div className="form-row">
                        <div className="col-12 col-md-9 mb-2 mb-md-0">
                            <input type="text" placeholder={this.props.placeholdertext} className="form-control form-control-lg" autoComplete="off" id="placeautosuggest"  ></input>

                        </div>
                        <div className="col-12 col-md-3">
                            <button type="submit" className="btn btn-block btn-lg btn-success">Submit</button>
                        </div>
                    </div>
                </form>
            </div>
        )
    }
}
