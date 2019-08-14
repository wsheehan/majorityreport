import React, { Component } from 'react'
import { orderBy, sumBy } from 'lodash'
import graphql from '../../graphql'
import BN from 'bignumber.js'
import randomColor from 'randomcolor'

import OcticonByName from '../../octicon'
import PatternExtractor from 'pattern-extractor'
import Loader from '../Loader'
import UserInfo from '../UserInfo'
import Disputes from './Disputes'

import { parseMarket, fillRounds, getDisputeOutcome } from '../../helpers' 

import './style.scss'

async function fetchMarket({ match, web3 }) {
  const marketId = match.params.id

  const query = `{
    market(id: "${marketId}") {
      topic
      description
      extraInfo
      outcomes
      finalized
      marketType
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

  const { market } = await graphql(query)
  return parseMarket(market, web3)
}

class Market extends Component {
  constructor() {
    super()
    this.state = { market: null }
  }

  async componentDidMount() {
    this.setState({
      market: await fetchMarket(this.props)
    })
  }

  render() {
    const { market } = this.state

    if (!market) return <Loader />

    return (
      <div className="Market container-fluid">
        <div className="row">
          <div className="col-sm-12">
            <div className="market-title">{market.description}</div>
          </div>
          <div className="col-sm-4">
            <div className="market-description-long">
              <p><b>Description:</b> {market.longDescription || "N/A"}</p>
              <p><b>Res Source:</b> <ResolutionSource text={market.resolutionSource || "N/A"} /></p>
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