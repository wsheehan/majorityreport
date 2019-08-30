import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { orderBy, isEqual, reduce } from 'lodash'
import Loader from '../Loader'
import * as API from '../../api'
import BN from 'bignumber.js'
import graphql from '../../graphql'
import { weiToDec, parseMarket, formatTs } from '../../helpers'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { MarketType, MarketRow } from '../MarketsTable'

import './style.scss'

class Precedents extends Component {
  constructor() {
    super()

    this.state = {}
  }

  async filloutMarkets(ids) {
    let query = ''
    ids.map(id => {
      query += `
      ${id.slice(1)}: market(id: "${id}") {
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
        }`
    })

    const finalQuery = `{
      ${query},
      feeWindows(orderBy: startTime, orderDirection: desc, first: 3) {
        id
        startTime
        endTime
        address
      }
    }`

    const res = await graphql(finalQuery)
    return orderBy(reduce(res, (acc, val, key) => {
      if (key !== 'feeWindows') {
        acc.push(parseMarket(val, res.feeWindows))
      }
      return acc
    }, []), m => Number(m.totalDisputed), 'desc')
  }

  async componentDidMount() {
    const data = await API.precedent(this.props.match.params.id)
    if (data.err) {
      this.setState({ err: data.err })
    } else {
      const { id, name, description, markets } = data
      const fullMarkets = await this.filloutMarkets(markets.map(m => m.id))
      this.setState({ 
        id, 
        name, 
        description, 
        markets: fullMarkets,
        totalDisputed: fullMarkets.reduce((acc, m) => acc.plus(m.totalDisputed), new BN(0)) 
      })
    }
  }

  render() {
    if (!this.state.markets) {
      return <Loader />
    }

    if (this.state.err) {
      return <div>{this.state.err.message}</div>
    }

    return (
      <div className="precedent-page container-fluid">
        <div className="row">
          <div className="col-sm-2"></div>
          <div className="precedent-wrapper col-sm-8">
            <div className="precedent row">
              <div className="col-sm-6">
                <h3><b>{this.state.name}</b></h3>
                <p>{this.state.description}</p>
              </div>
              <div className="col-sm-4">
                <div className="staked-and-won">Correct: <span>{weiToDec(this.state.totalDisputed).dividedBy(3).times(2).toFixed(2)} REP</span></div>
                <div className="staked-and-slashed">Slashed: <span>{weiToDec(this.state.totalDisputed).dividedBy(3).times(1).toFixed(2)} REP</span></div>
                <div className="markets-count">Markets Invalidated: {this.state.markets.length}</div>
              </div>
            </div>
          </div>
        </div>
          <table className="mr-table">
            <thead>
              <tr>
                <th className="description-cell">Description</th>
                <th>Topic</th>
                <th className="text-center">Type</th>
                <th>Creator</th>
                <th>Outcome</th>
                <th>Staked</th>
                <th>Rounds</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {this.state.markets.map(market => (
                <MarketRow key={market.id} market={market} {...this.props} />
              ))}
            </tbody>
          </table>
      </div>
    )
  }
}

export default Precedents