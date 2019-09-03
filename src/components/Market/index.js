import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { orderBy, sumBy } from 'lodash'
import graphql from '../../graphql'
import BN from 'bignumber.js'
import randomColor from 'randomcolor'
import { getReliability } from '../../helpers'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import PatternExtractor from 'pattern-extractor'
import Linkify from 'linkifyjs/react'
import Loader from '../Loader'
import Disputes from './Disputes'
import { hexToAscii } from 'web3-utils'
import ResolutionSource from '../ResSource'
import * as API from '../../api'

import { parseMarket, fillRounds, getDisputeOutcome, formatTs } from '../../helpers' 

import './style.scss'

async function fetchMarket({ match, web3 }) {
  const marketId = match.params.id

  const query = `{
    market(id: "${marketId}") {
      id
      topic
      description
      extraInfo
      outcomes
      finalized
      marketType
      endTime
      createdAt
      feeWindow {
        id
      }
      marketCreator {
        id
        marketsCreated
        markets {
          id
          invalid
          finalized
          disputes {
            id
          }
        }
      }
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
        reporter {
          id
        }
        timestamp
        amountStaked
        isDesignatedReporter
        payoutNumerators
        invalid
      }
    }
    feeWindows(orderBy: startTime, orderDirection: desc, first: 3){
      id
      startTime
      endTime
      address
    }
  }`

  const { market, feeWindows } = await graphql(query)
  return { market: parseMarket(market, feeWindows), feeWindows }
}

class Market extends Component {
  constructor() {
    super()
    this.state = { 
      market: null,
      precedents: null 
    }
  }

  async componentDidMount() {
    const data = await fetchMarket(this.props)
    this.setState(data)

    // fetch precedents
    const { precedents, err } = await API.market(data.market.id)
    if (precedents) {
      this.setState({ precedents })
    }
  }

  render() {
    const { market } = this.state

    if (!market) return <Loader />

    return (
      <div className="Market container-fluid">
        <div className="row">
          <div className="col-sm-12">
            <div className="market-title">
              <div className="description">{market.description}</div>
              <div className="links">
                <a className="dope-link" href={`https://reporters.chat/markets/${market.id}`}>Chat</a>
              </div>
              <span className="market-topic">{hexToAscii(market.topic)}</span>
            </div>
          </div>
          <div className="col-sm-4">
            <PrecedentsUsed precedents={this.state.precedents} />
            <div className="market-description-long">
              <p><b>Description:</b> <Linkify tagName="span">{market.longDescription || "N/A"}</Linkify></p>
              <p><b>Res Source:</b> <ResolutionSource text={market.resolutionSource || "General Knowledge"} /></p>
              <p>Market Created: <span className="time-block">{formatTs(market.createdAt)}</span></p>
              <p>Reporting Start: <span className="time-block">{formatTs(market.endTime)}</span></p>
            </div>
            <MarketCreator marketCreator={market.marketCreator} />
          </div>
          <div className="col-sm-7">
            <Disputes market={market} />
          </div>
        </div>
      </div>
    )
  }
}

function PrecedentsUsed ({ precedents }) {
  if (!precedents) return null

  return (
    <div className="market-precedents-wrapper">
      <div><b>Reasons for Invalid</b></div>
      {precedents.map(p => (
        <span>{p.name}</span>
      ))}
    </div>
  )
}

function MarketCreator ({ marketCreator }) {
  const { id, marketsCreated, markets } = marketCreator

  const finalMarkets = markets.filter(m => m.finalized)
  const validDecimal = finalMarkets.filter(m => !m.invalid).length / finalMarkets.length
  const reliability = getReliability(validDecimal)
  const disputedDecimal = finalMarkets.filter(m => m.disputes.length).length / finalMarkets.length

  return (
    <div className="market-creator">
      <div className="market-creator-header">
        <b>Creator: </b><Link className="dope-link" to={`/creator/${id}`}>{id}</Link>
        <div>Markets Created: {marketsCreated} ({finalMarkets.length} Finalized)</div>
        <div>
          Reliability: 
          <div className="reliability" style={{ backgroundColor: reliability.color }}>{reliability.label}</div> 
          <div>Valid: {(validDecimal * 100).toFixed(2)}%</div>
          <div>Disputed: {(disputedDecimal * 100).toFixed(2)}%</div>
        </div>
      </div>
    </div>
  )
}

export default Market