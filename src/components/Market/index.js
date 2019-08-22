import React, { Component } from 'react'
import { orderBy, sumBy } from 'lodash'
import graphql from '../../graphql'
import BN from 'bignumber.js'
import randomColor from 'randomcolor'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import PatternExtractor from 'pattern-extractor'
import Loader from '../Loader'
import Disputes from './Disputes'
import { hexToAscii } from 'web3-utils'

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
              <p><b>Description:</b> {market.longDescription || "N/A"}</p>
              <p><b>Res Source:</b> <ResolutionSource text={market.resolutionSource || "N/A"} /></p>
              <p>Market Created: <span className="time-block">{formatTs(market.createdAt)}</span></p>
              <p>Reporting Start: <span className="time-block">{formatTs(market.endTime)}</span></p>
            </div>
            <div className="market-creator">
              <div className="market-creator-header">
                <b>Created By: </b>
                <a href={`etherscan.io/address/${market.marketCreator.id}`}>{market.marketCreator.id.slice(0, 8)}...</a>
              </div>
              <hr></hr>
              <div>
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Augur_icon_white_background.png" height="25" width="25" /> 
                <span> <b>REP: 245.00</b> <i>($3062.50)</i></span>
              </div>
              <div className="info-row">
                <b>UNTRUSTRWORTHY</b> Reporter
              </div>
              <div className="info-row">
                <b>FAST</b> Reporter
              </div>
              <div className="info-row">
                <b>13</b> Markets Created
              </div>
              <div className="info-row">
                <b>2700 ETH</b> Open Interest Generated
              </div>
              <div className="info-row">
                <b>18 ETH</b> Fees Earned
              </div>
            </div>
          </div>
          <div className="col-sm-7">
            <Disputes market={market} />
          </div>
        </div>
      </div>
    )
  }
}

function MarketCreator ({ marketCreator }) {}

function ResolutionSource ({ text }) {
  const res = PatternExtractor.TextArea.extractAllUrls(text)
  
  if (res.length > 0) {
    const {start, end} = res[0].index
    const url = text.slice(start, end)
    return (
      <span>
        {text.slice(0, start)}<a href={url}>{url}</a>{text.slice(end)}
      </span>
    )
  }

  return text
}

export default Market