import React, { Component } from 'react'
import BN from 'bignumber.js'
import Loader from '../Loader'
import { isEqual } from 'lodash'
import graphql from '../../graphql'
import { hexToAscii } from 'web3-utils'
import { Link } from 'react-router-dom'
import { weiToDec, parseMarket, formatTs } from '../../helpers'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

class MarketsTable extends Component {
  constructor(props) {
    super()

    const tableParams = {
      skip: 0,
      first: 10,
      orderBy: 'totalDisputed',
      user: props.user,
      finalized: false,
      invalid: null,
      ...props.tableParams
    }

    this.state = {
      tableParams,
      markets: props.markets,
      showSettings: false
    }
  }

  constructWhereQuery() {
    const { tableParams } = this.state
    const whereFilter = tableParams.invalid === null
      ? `where: { finalized: ${tableParams.finalized}`
      : `where: { finalized: ${tableParams.finalized}, invalid: ${tableParams.invalid}`

    if (tableParams.user) {
      return whereFilter + ` marketCreator: "${tableParams.user}"}`
    } else {
      return whereFilter + "}"
    }
  }

  async fetchMarkets() {
    const params = this.state.tableParams
    const whereFilter = this.constructWhereQuery()

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
      feeWindows(orderBy: startTime, orderDirection: desc, first: 3) {
        id
        startTime
        endTime
        address
      }
    }`
    console.log(query)
    const { markets, feeWindows } = await graphql(query)
    this.setState({ 
      markets: markets.map(m => parseMarket(m, feeWindows)), 
    })
  }

  componentDidUpdate(_, prevState) {
    if (!isEqual(prevState.tableParams, this.state.tableParams)) {
      this.fetchMarkets()
    }
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
    const { feeWindow, featuredMarket, showSettings, markets, tableParams } = this.state
    if (!markets) {
      return <Loader />
    }

    const settingsDisplay = showSettings ? 'block' : 'none'

    return (
      <div>
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
              <th>Outcome</th>
              <th>Staked</th>
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
              <MarketRow key={market.id} market={market} {...this.props} />
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
    )
  }
}

export function MarketType ({ type }) {
  if (type === "Binary") {
    return <FontAwesomeIcon icon={["fas", "adjust"]} size="1x" />
  } else if (type === "Categorical") {
    return <FontAwesomeIcon icon={["fas", "ellipsis-h"]} size="1x" />
  } else {
    return <FontAwesomeIcon icon={["fas", "ruler-horizontal"]} size="1x" />
  }
}

export function MarketRow ({ market, history }) {
  const topic = hexToAscii(market.topic).split(',')[0]
  return (
      <tr>
        <td className="description-cell">
          <Link className="dope-link" to={`/market/${market.id}`}>{market.description}</Link>
        </td>
        <td><span className="market-topic">{topic}</span></td>
        <td className="text-center"><MarketType type={market.marketType} /></td>
        <td><Link to={`/creator/${market.marketCreator.id}`}>{market.marketCreator.id.slice(0, 8)}...</Link></td>
        <td><span className={`outcome-${market.tentativeOutcome}`}>{market.tentativeOutcome}</span></td>
        <td>{weiToDec(new BN(market.totalDisputed)).toFixed(2)} REP</td>
        <td><span className="num-rounds">{market.disputes.length}</span></td>
        <td>{market.status}</td>
      </tr>
  )
}

export default MarketsTable