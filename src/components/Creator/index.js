import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import Loader from '../Loader'
import graphql from '../../graphql'
import MarketsTable from '../MarketsTable'
import { getReliability, parseMarket } from '../../helpers'

import './style.scss'

class Creator extends Component {
  constructor() {
    super()

    this.state = {
      user: null,
      tableParams: {
        skip: 0,
        first: 25,
        orderBy: 'endTime',
        finalized: false,
        invalid: null
      }
    }
  }

  async fetchMarkets() {
    const params = this.state.tableParams
    const query = `{
      user(id: "${this.props.match.params.id}") {
        id
        marketsCreated
        markets(orderBy: ${params.orderBy}, orderDirection: desc, first: 500) {
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
      }
      feeWindows(orderBy: startTime, orderDirection: desc, first: 3){
        id
        startTime
        endTime
        address
      }
    }`
    const { user, feeWindows } = await graphql(query)
    return { 
      id: user.id, 
      marketsCreated: user.marketsCreated,
      allMarkets: user.markets.map(m => parseMarket(m, feeWindows)), 
      feeWindow: feeWindows[1],
    }
  }

  componentDidMount() {
    this.fetchMarkets()
      .then(data => this.setState(data))
      .catch(console.error)
  }

  render() {
    if (!this.state.allMarkets) return <Loader />

    const { id, marketsCreated, allMarkets } = this.state
    const finalMarkets = allMarkets.filter(m => m.finalized)
    const validDecimal = finalMarkets.filter(m => !m.invalid).length / finalMarkets.length
    const reliability = getReliability(validDecimal)
    const disputedDecimal = finalMarkets.filter(m => m.disputes.length).length / finalMarkets.length

    return (
      <div>
        <div className="container-fluid">
          <div>
            <div className="creator-header col-sm-6 offset-sm-3">
              <b>Creator: </b><a href={`https://etherscan.io/address/${id}`} target="_blank">{id}</a>
              <span className="reliability" style={{ backgroundColor: reliability.color }}>{reliability.label}</span> 
              <hr></hr>
              <div className="row">
                <div className="col">
                  <div>Markets Created: {marketsCreated}</div> 
                  <div>Markets Finalized: {finalMarkets.length}</div>
                </div>
                <div className="col">
                  <div>Valid: {(validDecimal * 100).toFixed(2)}%</div>
                  <div>Disputed: {(disputedDecimal * 100).toFixed(2)}%</div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <MarketsTable markets={allMarkets} {...this.props} user={id} />
          </div>
        </div>
      </div>
    )
  }
}

export default Creator