import React, { Component } from 'react'
import ResSource from '../ResSource'
import Loader from '../Loader'
import { Link } from 'react-router-dom'
import BN from 'bignumber.js'
import { isEqual } from 'lodash'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { weiToDec, parseMarket } from '../../helpers'
import graphql from '../../graphql'
import './style.scss'

class Markets extends Component {
  constructor() {
    super()

    this.state = {
      markets: null,
      tableParams: {
        skip: 0,
        first: 10,
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
        status
        payoutNumerators
        invalid
        marketCreator {
          id
        }
        disputes {
          id
          size
        }
        createdAt
        endTime
        finalized
      }
      feeWindows(orderBy: startTime, orderDirection: desc, first: 2){
        id
        startTime
        endTime
        address
      }
      market(id: "0xb89c7dcf8a03b2218815679adf680a0e0399fff6") {
        topic
        description
        extraInfo
        outcomes
        finalized
        marketType
        totalDisputed
        marketCreator {
          id
        }
        disputes {
          id
          size
          sizeFilled
          payoutNumerators
          invalid
          completed
        }
        initialReport {
          id
          reporter {
            id
          }
          amountStaked
          isDesignatedReporter
          payoutNumerators
          invalid
        }
      }
    }`

    const { markets, feeWindows, market } = await graphql(query)
    this.setState({ markets, feeWindow: feeWindows[1], featuredMarket: parseMarket(market) })
  }

  toggleShowSettings = () => {
    this.setState({ showSettings: !this.state.showSettings })
  }

  updateTableParam = (param, newVal) => {
    this.setState(prevState => {
      return {
        ...prevState,
        tableParams: {
          ...prevState.tableParams,
          [param]: newVal
        }
      }
    })
  }

  pagination = ({ first, skip }) => {
    this.setState(prevState => {
      return {
        ...prevState,
        tableParams: {
          ...prevState.tableParams, 
          first, 
          skip 
        }
      }
    })
  }

  page = (n) => {
    const { first, skip } = this.state.tableParams
    const x = skip + (n * first)
    this.setState(prevState => {
      return {
        ...prevState,
        tableParams: {
          ...prevState.tableParams, 
          first, 
          skip: x >= 0 ? x : 0 
        }
      }
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
              <div id="featured-desc">{featuredMarket.description}</div>
              <p>{featuredMarket.longDescription}</p>
              <div id="feature-res-source"><span>Res Source: </span><ResSource text={featuredMarket.resSource || "N/A"}/></div>
              <span id="featured-tentative">Tentative Outcome: <span className={`tentative tentative-${featuredMarket.tentativeOutcome}`}>{featuredMarket.tentativeOutcome}</span> </span>
              <span id="featured-creator">Created By: {featuredMarket.marketCreator.id.slice(0, 8)} </span>
              <span id="featured-staked">Disputed: {weiToDec(new BN(featuredMarket.totalDisputed)).toFixed(2)} REP</span>
            </div>
          </div>
          <div className="row">
            <div className="settings-popup" style={{display: settingsDisplay}}>
              <span>
                <span>Sort By: </span> 
                <select onChange={e => this.updateTableParam("orderBy", e.target.value)}>
                  <option value="totalDisputed">Total Disputed</option>
                  <option value="rounds">Number of Rounds</option> 
                </select>
              </span>
              <span>
                <span>Finalized: </span> 
                <select value={tableParams.finalized} onChange={e => this.updateTableParam("finalized", Boolean(e.target.value))}>
                  <option value="true">True</option>
                  <option value="false">False</option> 
                </select>
              </span>
              <span>
                <span>Invalid: </span> 
                <select value={tableParams.invalid} onChange={e => this.updateTableParam("invalid", e.target.value === null ? null : Boolean(e.target.value))}>
                  <option value="null">All</option>
                  <option value="true">True</option>
                  <option value="false">False</option> 
                </select>
              </span>
              <span>
                <span>Show: </span> 
                <select value={tableParams.first} 
                  onChange={e => this.pagination({ first: Number(e.target.value), skip: 0 })}>
                  <option value="10">10</option>
                  <option value="25">25</option> 
                  <option value="50">50</option> 
                </select>
              </span>
            </div>
            <table className="mr-table">
              <thead>
                <tr>
                  <th className="description-cell">Description</th>
                  <th>Topic</th>
                  <th className="text-center">Type</th>
                  <th>Creator</th>
                  <th>Disputed</th>
                  <th>Rounds</th>
                  <th>
                    Status
                    <span className={`settings settings-up-${showSettings}`} onClick={this.toggleShowSettings}>
                      <FontAwesomeIcon icon={["fas", showSettings ? "times" : "cog"]} style={{color: "#333333"}} size="2x" />
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {markets.map(market => (
                  <MarketRow market={market} {...this.props} />
                ))}
              </tbody>
            </table>
            <div className="paginator">
              <span>
                <span className="page" onClick={() => this.page(-1)}>PREV</span>
                <span className="page-num">{tableParams.skip / tableParams.first}</span>
                <span className="page" onClick={() => this.page(1)}>NEXT</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

function MarketType ({ type }) {
  if (type === "Binary") {
    return <FontAwesomeIcon icon={["fas", "adjust"]} size="1x" />
  } else if (type === "Categorical") {
    return <FontAwesomeIcon icon={["fas", "ellipsis-h"]} size="1x" />
  } else {
    return <FontAwesomeIcon icon={["fas", "ruler-horizontal"]} size="1x" />
  }
}

function MarketRow ({ market, web3, history }) {
  const topic = web3.utils.hexToAscii(market.topic).split(',')[0]

  return (
      <tr onClick={() => history.push(`/market/${market.id}`)}>
        <td className="description-cell">{market.description}</td>
        <td><span className="market-topic">{topic}</span></td>
        <td className="text-center"><MarketType type={market.marketType} /></td>
        <td><Link to={`/u/${market.marketCreator.id}`}>{market.marketCreator.id.slice(0, 8)}...</Link></td>
        <td>{weiToDec(new BN(market.totalDisputed)).toFixed(2)} REP</td>
        <td><span className="num-rounds">{market.disputes.length}</span></td>
        <td>{market.status}</td>
      </tr>
  )
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