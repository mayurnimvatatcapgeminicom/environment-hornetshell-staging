import React from 'react';
import { connect } from 'react-redux';
import { load_google_maps } from '../utils';
import { Link } from 'react-router-dom';

class SelectAreaPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = { area: 0 };
    }

    componentDidMount() {
        var self = this;        
        const lat = this.props.location.geometry.location.lat();
        const lng = this.props.location.geometry.location.lng();
        const googleMapsPromise = load_google_maps();
        Promise.all([
            googleMapsPromise
        ])
            .then(values => {
                console.log(values);
                this.map = new google.maps.Map(document.getElementById("map"), {
                    center: { lat: lat, lng: lng },
                    zoom: 19,
                    mapTypeId: 'satellite',
                    disableDefaultUI: true,
                    zoomControl: true,
                    tilt: 0
                });
                // let marker = new google.maps.Marker({
                //   position: { lat: lat, lng: lng},
                //   map: this.map,          
                //   animation: google.maps.Animation.DROP
                // });
                let drawingManager = new google.maps.drawing.DrawingManager({
                    drawingMode: google.maps.drawing.OverlayType.POLYGON,
                    drawingControl: true,
                    drawingControlOptions: {
                        position: google.maps.ControlPosition.TOP_LEFT,
                        drawingModes: ['polygon']
                    },
                    polygonOptions: {
                        fillColor: '#e4c12f',
                        fillOpacity: 0.5,
                        strokeColor: '#e4c12f',
                        strokeWeight: 4,
                        clickable: false,
                        editable: false,
                        zIndex: 1
                    }
                });//End drawingmanager
                let polygonMap = null;
                let mapInfoWindow = null;
                google.maps.event.addListener(drawingManager, 'polygoncomplete', function (polygon) {
                    //Get Area
                    if (polygonMap !== null) {
                        polygonMap.setMap(null);
                    }
                    if (mapInfoWindow !== null) {
                        mapInfoWindow.setMap(null);
                    }
                    polygonMap = polygon;
                    var area = google.maps.geometry.spherical.computeArea(polygonMap.getPath());
                    area = Math.round(area);
                    //Store to app variable later
                    //Show a popup
                    let htmlcontent = `<div >
          HI 
        </div>`;
                    const htmlpopup = `<div class="card" style="width: 18rem;">
        <div class="card-body">          
          <p class="card-title">Din valda yta: <span class="badge badge-secondary">${area}</span></p> 
          <a class="btn btn-danger" href="#" role="button" id="clear_map_a">GÖR OM</a>
          <a class="btn btn-success" href="#" role="button" id="set_roof_area_a">GÅ VIDARE</a>         
        </div>
      </div>`;
                    var contentString = "<p class='roof_size_info_window'><span class='roof_size_info_window-text'>" + area + "kvm </span><p></p><span id='set_roof_area'><i class='fas fa-check' id='set_roof_area_i'>OK</i></span><p></p> <span id='clear_map'><i class='fas fa-times' id='clear_map_i'>clse</i></span></p>";
                    var vertices = polygonMap.getPath();
                    var pos = vertices.getAt(0);
                    var lat = pos.lat();
                    var lang = pos.lng();

                    mapInfoWindow = new google.maps.InfoWindow({
                        content: htmlpopup
                    });
                    mapInfoWindow.setPosition({ lat: lat, lng: lang });
                    this.map.setCenter({ lat: lat, lng: lang });
                    mapInfoWindow.open(this.map);
                    document.addEventListener('click', function (e) {
                        if (e.target && e.target.id == 'set_roof_area_a') {
                            console.log('Hi');
                            console.log(self.state.area);
                            self.setState({
                                area: area
                            });
                            console.log(self.state.area);
                            mapInfoWindow.close();
                            drawingManager.setMap(null);
                            let theMap = document.getElementById('map');
                            theMap.classList.add("small-map");
                            if (self.map !== null) {
                                self.map.setOptions({ zoomControl: false });
                            }
                            // showRoofPagePart2();
                        }
                    });
                    document.addEventListener('click', function (e) {
                        if (e.target && e.target.id == 'clear_map_a') {
                            console.log("Clear");
                            mapInfoWindow.close();
                            polygonMap.setMap(null);
                        }
                    });
                });
                drawingManager.setMap(this.map);
            })
    }

    onSubmitCalculate = (e) => {
        e.preventDefault();
        const daysToInstall = this.getDaysToInstall();
        const totalCost = this.getTotalCost();
        const paybackYears = this.getPaybackYears();
        const savingsPerYear = this.getSavingsPerYear();
        const bathsOfOil = this.getBathsOfOil();
        const kwhSaved = this.getKwhSaved();

        const message = `Day to install : ${daysToInstall},
                   Total Cost :${totalCost},
                   Pay back years : ${paybackYears},
                   Savings Per Year : ${savingsPerYear},
                   Baths of oil :${bathsOfOil}, 
                   KWH Saved: ${kwhSaved}`;
        debugger;
        document.getElementById('lblresult').innerHTML = message;

    };
    getDaysToInstall = () => {
        return Math.round(this.state.area / 25);
    };
    getTotalCost = () => {
        const panelType = document.getElementById("ddlpaneltype").value;
        const paymentType = document.getElementById("ddlpaymenttype").value;
        const totalArea = this.state.area;

        let intCost = totalArea / 1.7;
        if (panelType == "Premium") {
            intCost = Math.round((intCost * 3 + 30 - (0.1 * (Math.pow(intCost, 1.2)))) * 875);
        } else if (panelType == "Standard") {
            intCost = Math.round((intCost * 2.6 + 34 - (0.1 * (Math.pow(intCost, 1.2)))) * 875);
        } else {
            intCost = Math.round((intCost * 5 + 40 - (0.1 * (Math.pow(intCost, 1.2)))) * 875);
        }
        if (paymentType == "Loan") {
            intCost = Math.round(intCost * 0.01);
        }
        return intCost;
    };
    getPaybackYears = () => {
        const panelType = document.getElementById("ddlpaneltype").value;
        const paymentType = document.getElementById("ddlpaymenttype").value;
        const roofDirection = document.getElementById("ddlroofdirection").value;
        const roofSlope = parseInt(document.getElementById("inputroofslope").value);
        const totalArea = this.state.area;

        let tmp = (this.getTotalCost() * 0.9);

        if (panelType == "Premium") {
            tmp = tmp / ((totalArea / 1.7) * 300);
        } else {
            tmp = tmp / ((totalArea / 1.7) * 285);
        }

        if (roofSlope > 10 && roofSlope <= 31) {
            tmp = tmp * 1.05;
        } else if (roofSlope < 11) {
            tmp = tmp * 1.08;
        }

        if (roofDirection == 'SE' || roofDirection == "SW") {
            tmp = tmp / 0.92;
        } else {
            tmp = tmp / 0.88;
        }

        if (paymentType == "Loan") {
            tmp = tmp * 120;
        }
        let formated = (Math.round(tmp * 10) / 10);
        return formated;
    };
    getSavingsPerYear = () => {
        const panelType = document.getElementById("ddlpaneltype").value;
        const roofDirection = document.getElementById("ddlroofdirection").value;
        const roofSlope = parseInt(document.getElementById("inputroofslope").value);
        const totalArea = this.state.area;

        let cost = this.getTotalCost();
        var tmp = cost * 0.9;

        if (panelType == "Premium") {
            tmp = tmp / ((totalArea / 1.7) * 300);
        } else {
            tmp = tmp / ((totalArea / 1.7) * 285);
        }

        if (roofSlope > 10 && roofSlope <= 31) {
            tmp = tmp * 1.05;
        } else if (roofSlope < 11) {
            tmp = tmp * 1.08;
        }
        if (roofDirection == 'SE' || roofDirection == "SW") {
            tmp = tmp / 0.92;
        } else {
            tmp = tmp / 0.88;
        }
        tmp = cost / tmp;
        return Math.round(tmp);

    };
    getBathsOfOil = () => {
        let baths = Math.round((this.getKwhSaved() / 600) * 30);
        return baths;
    };
    getKwhSaved = () => {
        let savings = Math.round(this.getSavingsPerYear() * 0.9);
        let formated = (Math.round(savings / 10) * 10);
        return formated;
    };

    render() {
        return (
            <div className="d-flex">
                <div id="page-content-wrapper">

                    <div id="map" className="container-fluid map"></div>

                </div>
                <div className="bg-light border-right" id="sidebar-wrapper">
                    <div className="sidebar-heading">
                        Selected Location : {this.props.location.formatted_address}
                    </div>
                    <form onSubmit={this.onSubmitCalculate}>
                        <div className="list-group-flush">
                            <div className="form-group list-group-item list-group-item-action bg-light">
                                <p><span className="fontbolder">Din valda yta:</span> {this.state.area}</p>
                            </div>
                            <div className="list-group-item list-group-item-action bg-light">
                                <p className="fontbolder">Ditt tak vätter mot (väderstreck)</p>
                                <select className="form-control" id="ddlroofdirection">
                                    <option value="" disabled selected>Select Roof Direction</option>
                                    <option value="W">West</option>
                                    <option value="SW">South West</option>
                                    <option value="S">South</option>
                                    <option value="SE">South East</option>
                                    <option value="E">East</option>
                                </select>
                            </div>
                            <div className="list-group-item list-group-item-action bg-light">
                                <p className="fontbolder">Takets lutning</p>
                                <div className="slidecontainer">
                                    <input className="slider" type="range" id="inputroofslope" name="Roof Slope" min="1" max="60" step="1" />
                                </div>
                            </div>
                            <div className="list-group-item list-group-item-action bg-light">
                                <p className="fontbolder">Din energianvändning</p>
                                <div className="slidecontainer">
                                    <input className="slider" type="range" id="inputenergy" min="10000" max="20000" step="5000" />
                                </div>
                            </div>
                            <div className="list-group-item list-group-item-action bg-light">
                                <p className="fontbolder">Typ av panel</p>
                                <select id="ddlpaneltype" className="form-control">
                                    <option value="" disabled selected>Select Panel</option>
                                    <option value="Premium">Premium</option>
                                    <option value="Standard">Standard</option>
                                </select>
                            </div>
                            <div className="list-group-item list-group-item-action bg-light">
                                <p className="fontbolder">Välj betalningssätt</p>
                                <select id="ddlpaymenttype" className="form-control">
                                    <option value="" disabled selected>Select Payment</option>
                                    <option value="Invoice">Invoice</option>
                                    <option value="Installment">Installment</option>
                                </select>
                            </div>
                            <div className="list-group-item list-group-item-action bg-light">
                                <center>
                                    <button type="submit" className="btn btn-success">Beräkna</button>
                                </center>
                            </div>
                            <div className="list-group-item list-group-item-action bg-light">
                                <label id='lblresult'></label>
                            </div>
                        </div>
                    </form>
                </div>

            </div >


        )
    }


}

const mapStateToProps = (state) => {
    
    return {
        location: state.location[0].location
    };
};
export default connect(mapStateToProps)(SelectAreaPage);


