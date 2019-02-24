import React, { Component } from 'react'
import axios from 'axios'
import Web3 from 'web3'

import Market from './components/Market'

import './App.css'

class App extends Component {
  constructor() {
    super()
    this.state = {
      market: null,
      web3: new Web3(Web3.givenProvider)
    }
  }

  async componentDidMount() {
    const query = `{
      market(id: "0xbbbc0a8baa03535e0a680ee2f057162aaaafd570") {
        topic
        description
        extraInfo
        outcomes
        finalized
        disputes {
          id
          size
          payoutNumerators
          invalid
          tokens {
            tokenType
            owners {
              id
              tokenAddress
              amount
            }
          }
        }
        initialReports {
          id
          reporter
          amountStaked
          isDesignatedReporter
          payoutNumerators
          invalid
        }
      }
    }`

    const res = await axios.post('http://127.0.0.1:8000/subgraphs/name/augur', JSON.stringify({ query }))
    const { market } = res.data.data

    const { web3 } = this.state
    market.outcomes = market.outcomes.map(web3.utils.hexToAscii)

    if (res.data.data) {
      this.setState({ market })
    }
  }

  render() {
    return (
      <div className="App">
        <Sidebar />
        <div className="body-wrapper">
          <Market {...this.state} />
        </div>
      </div>
    );
  }
}

function Sidebar () {
  return (
    <div className="sidebar">
      <span><i class="fas fa-search"></i></span>
    </div>
  )
}

export default App
