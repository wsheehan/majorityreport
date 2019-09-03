import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Link } from 'react-router-dom'
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon'

import Market from './components/Market'
import Markets from './components/Markets'
import Creator from './components/Creator'
import Reporters from './components/Reporters'
import Precedent from './components/Precedent'
import Precedents from './components/Precedents'

import './App.scss'

class App extends Component {
  render() {
    return (
      <Router>
        <div className="App">
          <Header {...this.props} />
          <div className="body-wrapper">
            <div className="non-footer-body">
              <Route path="/market/:id"
                render={props => <Market {...props} />}
              />
              <Route exact path="/"
                render={props => <Markets {...props} />}
              />
              <Route path="/precedents"
                render={props => <Precedents />}
              />
              <Route path="/precedent/:id"
                render={props => <Precedent {...props} />}
              />
              <Route path="/creator/:id"
                render={props => <Creator {...props} />}
              />
            </div>
            <Footer />
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
    <footer className="containter-fluid">
      <div className="row">
        <div className="col-sm-3">
          <div><a href="https://github.com/wsheehan/majorityreport" className="dope-link">Github</a></div>
          <div><a href="https://github.com/wsheehan/majorityreport/issues" className="dope-link">Feedback</a></div>
        </div>
        <div className="col-sm-3">
          <div><a href="https://twitter.com/_wilbur4ce_" className="dope-link">Twitter</a></div>
          <div><a href="https://medium.com/@sheehan_95" className="dope-link">Blog</a></div>
        </div>
      </div>
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
