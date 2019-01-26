import React, { Component } from 'react'
import AddFlight from './containers/AddFlight'
import AddTrip from './containers/AddTrip'
import Integrations from './containers/Integrations'
import { PageHeader, Nav, NavItem } from 'react-bootstrap'
import { Switch, Route } from 'react-router'
import { withRouter } from 'react-router-dom'
import FontAwesome from 'react-fontawesome'
import 'react-dates/initialize'
import './App.css'

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      navEventKey: null
    }
  }
  componentDidMount() {
    const { pathname: navEventKey } = this.props.location
    this.setState({ navEventKey })
  }

  onNavSelect = navEventKey => {
    this.setState({ navEventKey })
    this.props.history.push(navEventKey)
  }

  render() {
    return (
      <div className="App">
        <PageHeader>
          <FontAwesome name="plane-departure" />
          &nbsp;Trello Travel Creator
        </PageHeader>
        <Nav bsStyle="tabs" className="App-Nav" activeKey={this.state.navEventKey} onSelect={this.onNavSelect}>
          <NavItem eventKey="/createtrip">
            Create new trip
          </NavItem>
          <NavItem eventKey="/addflight">
            Add flight segments
          </NavItem>
          <NavItem eventKey="/integrations">
            Integrations
          </NavItem>
        </Nav>
        <Switch>
          <Route path="/addflight" component={AddFlight} />
          <Route path="/createtrip" component={AddTrip} />
          <Route path="/integrations" component={Integrations} />
        </Switch>
      </div>
    );
  }
}

export default withRouter(App)
