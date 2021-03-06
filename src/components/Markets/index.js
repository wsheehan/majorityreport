import React, { Component } from 'react'
import MarketsTable from '../MarketsTable'
import Loader from '../Loader'
import { Link } from 'react-router-dom'
import BN from 'bignumber.js'
import { isEqual } from 'lodash'
import Linkify from 'linkifyjs/react'

import { weiToDec, parseMarket } from '../../helpers'
import graphql from '../../graphql'
import { hexToAscii } from 'web3-utils'
import './style.scss'

class Markets extends Component {
  constructor() {
    super()

    this.state = {
      markets: null,
      tableParams: {
        skip: 0,
        first: 25,
        orderBy: 'totalDisputed',
        finalized: false,
        invalid: null
      },
      showSettings: false
    }
  }

  componentDidMount() {
    this.fetchMarkets()
  }

  componentDidUpdate(_, prevState) {
    if (!isEqual(prevState.tableParams, this.state.tableParams)) {
      this.fetchMarkets()
    }
  }

  async fetchMarkets() {
    const params = this.state.tableParams
    const whereFilter = params.invalid === null
      ? `where: { finalized: ${params.finalized} }`
      : `where: { finalized: ${params.finalized}, invalid: ${params.invalid} }`

    const query = `{
      markets(orderBy: ${params.orderBy}, orderDirection: desc, ${whereFilter}, first: ${params.first}, skip: ${params.skip}) {
        id
        description
        topic
        marketType
        totalDisputed
        outcomes
        status
        payoutNumerators
        invalid
        createdAt
        extraInfo
        marketCreator { id }
        disputes {
          id
          size
          sizeFilled
          payoutNumerators
          invalid
          completed
          completedTimestamp
        }
        initialReport {
          id
          reporter { id }
          amountStaked
          isDesignatedReporter
          payoutNumerators
          invalid
          timestamp
        }
        createdAt
        endTime
        finalized
      }
      feeWindows(orderBy: startTime, orderDirection: desc, first: 3){
        id
        startTime
        endTime
        address
      }
      market(id: "0x9d79ac2fe94e85c677d2394a5302c26d9fe4cc25") {
        id
        topic
        description
        extraInfo
        outcomes
        finalized
        marketType
        totalDisputed
        createdAt
        marketCreator { id }
        disputes {
          id
          size
          sizeFilled
          payoutNumerators
          invalid
          completed
          completedTimestamp
        }
        initialReport {
          id
          reporter { id }
          amountStaked
          isDesignatedReporter
          payoutNumerators
          invalid
          timestamp
        }
      }
    }`
    const { markets, feeWindows, market } = await graphql(query)
    this.setState({ 
      markets: markets.map(m => parseMarket(m, feeWindows)), 
      feeWindow: feeWindows[1], 
      featuredMarket: parseMarket(market, feeWindows) 
    })
  }

  render() {
    const { markets, feeWindow, featuredMarket, showSettings, tableParams } = this.state
    if (!markets) {
      return <Loader />
    }
    const settingsDisplay = showSettings ? 'block' : 'none'
    return (
      <div>
        <div className="markets container-fluid">
          <div className="row">
            <div className="featured-market col-md-10 offset-md-1">
              <div id="featured">Featured Market</div>
              <div id="featured-desc">
                <Link className="dope-link" to={`/market/${featuredMarket.id}`}>{featuredMarket.description}</Link>
              </div>
              <p><i><Linkify>{featuredMarket.longDescription}</Linkify></i></p>
              <div id="feature-res-source"><span>Res Source: </span><Linkify>{featuredMarket.resolutionSource || "General Knowledge"}</Linkify></div>
              <span id="featured-tentative">Tentative Outcome: <span className={`tentative tentative-${featuredMarket.tentativeOutcome}`}>{featuredMarket.tentativeOutcome}</span> </span>
              <span id="featured-staked">&nbsp;&nbsp;Disputed: {weiToDec(new BN(featuredMarket.totalDisputed)).toFixed(2)} REP</span>
              <span className="issues">
                Possible issues: <Link to={`/precedent/2`} className="dope-link">Conflicting Details</Link>
              </span>
            </div>
          </div>
          <div className="row">
            <MarketsTable {...this.props} markets={markets} tableParams={this.state.tableParams} />
          </div>
        </div>
      </div>
    )
  }
}

function ProgressBar ({ feeWindow }) {
  // const prog = ((Date.now() / 1000) - Number(feeWindow.startTime)) / (Number(feeWindow.endTime) - Number(feeWindow.startTime))
  return (
    <div className="progress">
      <div className="progress-bar" style={{width: `${0.1 * 100}%`}}></div>
    </div>
  )
}

export default Markets