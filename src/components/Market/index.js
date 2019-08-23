import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { orderBy, sumBy } from 'lodash'
import graphql from '../../graphql'
import BN from 'bignumber.js'
import randomColor from 'randomcolor'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import PatternExtractor from 'pattern-extractor'
import Linkify from 'linkifyjs/react'
import Loader from '../Loader'
import Disputes from './Disputes'
import { hexToAscii } from 'web3-utils'
import ResolutionSource from '../ResSource'

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
    this.state = { market: null }
  }

  async componentDidMount() {
    this.setState(await fetchMarket(this.props))
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
                <a href="augur.casino">Trade</a>&nbsp;&nbsp;
                <a href={`https://reporters.chat/markets/${market.id}`}>Chat</a>
              </div>
              <span className="market-topic">{hexToAscii(market.topic)}</span>
            </div>
          </div>
          <div className="col-sm-4">
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

function getReliability (validDecimal) {
  if (validDecimal === 1) {
    return { label: "Pristine", color: "green" }
  } else if (validDecimal >= 0.95) {
    return { label: "Very Good", color: "green" }
  } else if (validDecimal >= 0.9) {
    return { label: "Good", color: "green" }
  } else if (validDecimal >= 0.5) {
    return { label: "Bad", color: "orange" }
  } else if (validDecimal === NaN) {
    return { label: "Unknown", color: "gray" }
  } else {
    return { label: "Abysmal", color: "red" }
  }
}

function MarketCreator ({ marketCreator }) {
  const { id, marketsCreated, markets } = marketCreator

  const finalMarkets = markets.filter(m => m.finalized)
  const validDecimal = finalMarkets.filter(m => !m.invalid).length / finalMarkets.length
  const reliability = getReliability(validDecimal)

  return (
    <div className="market-creator">
      <div className="market-creator-header">
        <b>Creator: </b><Link to={`/creator/${id}`}>{id.slice(0, 8)}...</Link>
        <div>Markets Created: {marketsCreated} ({finalMarkets.length} Finalized)</div>
        <div>
          Reliability: 
          <span className="reliability" style={{ backgroundColor: reliability.color }}>{reliability.label}</span> 
          <span>{(validDecimal * 100).toFixed(2)}%</span></div>
      </div>
    </div>
  )
}

export default Market