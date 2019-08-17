import React, { Component } from 'react'
import Web3 from 'web3'
import { BrowserRouter as Router, Route, Link } from 'react-router-dom'
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon'

import Market from './components/Market'
import Markets from './components/Markets'
import Precedents from './components/Precedents'
import graphql from './graphql'

import './App.scss'

// const scalerMarket = "0x30c1a409258fe44facbfc3d5f89d8f39964f3d13"
const binaryMarket = "0x30c1a409258fe44facbfc3d5f89d8f39964f3d13"
const categoricalMarket = "0x5b6834410a66a20651e1323391b73a8e5c87d3e1"

const houseMarket =  "0xbbbc0a8baa03535e0a680ee2f057162aaaafd570"

// bastille
const bastilleMarket = "0x67ef420c045f3561d11ef94b24da7e2010650cc3"

class App extends Component {
  componentDidMount() {
    this.props.web3.setFirstValidConnector(['MetaMask'])
  }

  render() {
    return (
      <Router>
        <div className="App">
          <Header {...this.props} />
          <Sidebar />
          <div className="body-wrapper">
            <Route path="/market/:id"
              render={
                props => 
                  <Market {...this.state} {...props} />
              }
            />
            <Route path="/markets"
              render={
                props => 
                  <Markets {...this.state} {...props} />
              }
            />
            <Route path="/precedents"
              render={
                props =>
                  <Precedents />
              }
            />
          </div>
        </div>
      </Router>
    );
  }
}

function Sidebar () {
  return (
    <div className="Sidebar">
      <div className="markets-nav" style={{display: 'none'}}>
          <input placeholder="description, address, or topic" className="mr-input" />
          <div className="markets-status-filter">
            <select>
              <option value="active">Active Markets</option>
              <option value="all">All Markets</option>
              <option value="awaiting next window">Awaiting Next Window</option>
              <option value="crowdsourcing">Crowdsourcing Dispute</option>
              <option value="initial report submitted">Initial Report Submitted</option>
            </select>
          </div>
        </div>
    </div>
  )
}

function Header ({ web3 }) {
  return (
    <div>
      <header className="Header">
        <div className="brand"></div>
        <div className="nav"><Link to="/markets">Active Disputes</Link></div>
        <div className="nav">Reporters</div>
        <div className="nav"><Link to="/precedents">Precedents</Link></div>
        <UserIcon account={web3.account} />
      </header>
      <svg className="Header-triangle" preserveAspectRatio="none" height="50" viewBox="0 0 100 100">
        <polygon points="0,100 0,0 100,0" opacity="1"></polygon>
      </svg>
    </div>
  )
}

function UserIcon ({ account }) {
  if (account) {
    return (
      <div className="user">
        <Jazzicon diameter={50} seed={jsNumberForAddress(account)} />
      </div>
    )
  } else {
    return <div className="user"></div>
  }
}

export default App
