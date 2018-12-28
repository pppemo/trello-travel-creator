import React, { Component } from 'react'
import Trello from './api/trello'
import AddFlight from './containers/AddFlight'
import { PageHeader, Nav, NavItem } from 'react-bootstrap'
import { Switch, Route } from 'react-router'
import { withRouter } from 'react-router-dom'
import './App.css'

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      navEventKey: null
    }
  }
  componentDidMount() {
    Trello.authorize()
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
          Trello Travel Creator
        </PageHeader>
        <Nav bsStyle="pills" activeKey={this.state.navEventKey} onSelect={this.onNavSelect}>
          <NavItem eventKey="/addflight">
            Add flight segments
          </NavItem>
          <NavItem eventKey="/createtrip">
            Create new trip
          </NavItem>
        </Nav>
        <Switch>
          <Route path="/addflight" component={AddFlight} />
        </Switch>
      </div>
    );
  }
}

export default withRouter(App)
