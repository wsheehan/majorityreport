import React, { Component } from 'react'
import ResSource from '../ResSource'
import Loader from '../Loader'
import { Link } from 'react-router-dom'
import BN from 'bignumber.js'

import { weiToDec, parseMarket } from '../../helpers'
import graphql from '../../graphql'
import './style.scss'

class Markets extends Component {
  constructor() {
    super()

    this.state = {
      markets: null
    }
  }

  async componentDidMount() {
    const query = `{
      markets(orderBy: totalDisputed, orderDirection: desc, where: { finalized: null }, first: 10) {
        id
        description
        topic
        marketType
        totalDisputed
        status
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

  render() {
    const { markets, feeWindow, featuredMarket } = this.state
    if (!markets) {
      return <Loader />
    }

    return (
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
          <table className="mr-table">
            <thead>
              <tr>
                <th className="description-cell">Description</th>
                <th>Topic</th>
                <th>Type</th>
                <th>Creator</th>
                <th>Disputed</th>
                <th>Round</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {markets.map(market => (
                <MarketRow market={market} {...this.props} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
}

function MarketRow ({ market, web3, history }) {
  const topic = web3.utils.hexToAscii(market.topic).split(',')[0]

  return (
      <tr onClick={() => history.push(`/market/${market.id}`)}>
        <td className="description-cell">{market.description}</td>
        <td><span className="market-topic">{topic}</span></td>
        <td>{market.marketType}</td>
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