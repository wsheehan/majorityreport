import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Link } from 'react-router-dom'
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon'

import Market from './components/Market'
import Markets from './components/Markets'
import Creator from './components/Creator'
import Reporters from './components/Reporters'
import Precedents from './components/Precedents'

import './App.scss'

// const scalerMarket = "0x30c1a409258fe44facbfc3d5f89d8f39964f3d13"
// const binaryMarket = "0x30c1a409258fe44facbfc3d5f89d8f39964f3d13"
// const categoricalMarket = "0x5b6834410a66a20651e1323391b73a8e5c87d3e1"
// const houseMarket =  "0xbbbc0a8baa03535e0a680ee2f057162aaaafd570"
// const bastilleMarket = "0x67ef420c045f3561d11ef94b24da7e2010650cc3"

class App extends Component {
  render() {
    return (
      <Router>
        <div className="App">
          <Header {...this.props} />
          <div className="body-wrapper">
            <Route path="/market/:id"
              render={props => <Market {...this.state} {...props} />}
            />
            <Route exact path="/"
              render={props => <Markets {...this.state} {...props} />}
            />
            <Route path="/precedents"
              render={props => <Precedents />}
            />
            <Route path="/creator/:id"
              render={props => <Creator {...props} />}
            />
          </div>
        </div>
      </Router>
    );
  }
}

function Header ({ web3 }) {
  return (
    <div>
      <header className="Header">
        <div className="brand">
          <div className="brand-top">MAJORITY</div>
          <div className="brand-bottom">REPORT</div>
        </div>
        <div className="nav"><Link to="/">Disputes</Link></div>
        <div className="nav"><Link to="/precedents">Precedents</Link></div>
      </header>
      <svg className="Header-triangle" preserveAspectRatio="none" height="50" viewBox="0 0 100 100">
        <polygon points="0,100 0,0 100,0" opacity="1"></polygon>
      </svg>
    </div>
  )
}

function Footer () {
  return (
    <footer>
      Footer
    </footer>
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
