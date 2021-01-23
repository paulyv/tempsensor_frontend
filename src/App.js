import React, { Component } from 'react';
import './App.css';
import '../node_modules/react-vis/dist/style.css';
import 'bootstrap/dist/css/bootstrap.min.css'
import moment from 'moment';
import {XYPlot, XAxis, YAxis, LineSeries} from 'react-vis';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';


class App extends Component {
  constructor(props) {
  super(props);
  this.state = {humidity: null,
                temperature: null,
                chart_temperatures: [],
                chart_humidities: [],
                delay: 10000,
                chart_delay: 60000
              };
};

componentDidMount() {
  this.getCurrentSensorData()
  this.getHistoryData()
  this.interval = setInterval(this.getCurrentSensorData, this.state.delay);
  this.interval = setInterval(this.getHistoryData, this.state.chart_delay);
}

getCurrentSensorData = () => {
  fetch('http://tempsensor.local:3000/api/sensors/bedroom/data')
  .then(response => response.json())
  .then(data => {
    this.setState({humidity: data.humidity});
    this.setState({temperature: data.temperature});
})
  .catch(err => console.error(err.toString()))
}

getHistoryData = () => {
  fetch('http://tempsensor.local:3000/api/sensors/bedroom/history')
  .then(response => response.json())
  .then(data => {
    this.setState({chart_temperatures: data.temperatures});
    this.setState({chart_humidities: data.humidities});

})
  .catch(err => console.error(err.toString()))
}

  render() {

    let ratio = 1;
    let number_of_ticks_to_show = 15
    let sliced_temps = this.state.chart_temperatures;
    let sliced_humids = this.state.chart_humidities;

    // If there's over 12h worth of data let's select only the newest 12h. (2min x 360) 
    if(this.state.chart_temperatures.length > 360) {
      sliced_temps = this.state.chart_temperatures.slice(Math.max(this.state.chart_temperatures.length - 360, 0))
    }
    // If there's more data points than we want to show let's calculate a ratio for filtering
    if(sliced_temps.length > number_of_ticks_to_show) {
      ratio = Math.ceil(sliced_temps.length / number_of_ticks_to_show);
    }
    // Finally let's create a new data array with the previous configurations
    let temperature_data = sliced_temps.map(i => {
      return {x: moment(new Date(i.x)).format("HH:mm"), y: i.y};
        }).filter((item, index) => {
        return index % ratio === 0;
        })
    
    // Let's do the same with humidity data
    if(this.state.chart_humidities.length > 360) {
      sliced_humids = this.state.chart_humidities.slice(Math.max(this.state.chart_humidities.length - 360, 0))
    }

    let humidity_data = sliced_humids.map(i => {
      return {x: moment(new Date(i.x)).format("HH:mm"), y: i.y};
    }).filter((item, index) => {
      return index % ratio === 0;
     })

    return (
  <>
  <Navbar bg="dark" variant="dark">
    <Navbar.Brand><div className="title-font"></div></Navbar.Brand>
  </Navbar>

  <Container fluid style={{marginLeft: '10px', marginTop: '20px'}}>
    <div className="title-area">
      <h1>House climate</h1>
    </div>
    <Row>
      <Col md={7} style={{maxWidth: "90%"}}>
          <XYPlot xType="ordinal" height={200} width={750}>
            <XAxis title="" />
            <YAxis title="Celsius" />
            <LineSeries data={temperature_data} color="#FFCCCB" />
          </XYPlot>
      </Col>
      <Col md={4}>
        <div className="temperature-area">
          <h3>Current temperature</h3>
          <h3>{this.state.temperature}&deg;C</h3>
        </div>
      </Col>
    </Row>
    <Row>
      <Col md={7} style={{maxWidth: "90%"}}>
          <XYPlot xType="ordinal" height={200} width={750}>
            <XAxis title="" />
            <YAxis title="Humidity %" />
            <LineSeries data={humidity_data} color="#ADD8E6"/>
          </XYPlot>
      </Col>
      <Col md={4}>
        <div className="humidity-area">
          <h3>Current humidity</h3>
          <h3>{this.state.humidity}%</h3>
        </div>
      </Col>
    </Row>
  </Container>
  </>
    );
  }
}

export default App;
