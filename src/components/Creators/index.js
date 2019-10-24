import React, { Component } from 'react'
import { isEqual } from 'lodash'
import graphql from '../../graphql'
import { hexToAscii } from 'web3-utils'
import { Link } from 'react-router-dom'
import Loader from '../Loader'
import { getReliability } from '../../helpers'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import './style.scss'

function parseUser(user) {
  const finalMarkets = user.markets.filter(m => m.finalized)
  const validDecimal = finalMarkets.filter(m => !m.invalid).length / finalMarkets.length
  const reliability = getReliability(validDecimal)
  const disputedDecimal = finalMarkets.filter(m => m.disputes.length).length / finalMarkets.length
  return { ...user, reliability, validDecimal, disputedDecimal }
}

class Creators extends Component {
  constructor(props) {
    super()

    const tableParams = {
      skip: 0,
      first: 10,
      orderBy: 'marketsCreated'
    }

    this.state = {
      tableParams,
      users: null,
      showSettings: false
    }
  }

  async fetchMarkets() {
    const params = this.state.tableParams
    const query = `{
      users(orderBy: marketsCreated, orderDirection: desc, first: ${params.first}, skip: ${params.skip}) {
        id
        marketsCreated
        markets {
          totalDisputed
          finalized
          invalid
          disputes { id }
        }
      }
    }`
    const { users } = await graphql(query)
    this.setState({ users: users.map(parseUser) })
  }

  componentDidMount() {
    this.fetchMarkets()
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
    const { showSettings, users, tableParams } = this.state
    if (!users) {
      return <Loader />
    }

    const settingsDisplay = showSettings ? 'block' : 'none'

    return (
      <div className="row">
        <div className="col-sm-10 offset-sm-1 creators">
          <div className="settings-popup" style={{display: settingsDisplay}}>
            <span>
              <span>Sort By: </span> 
              <select onChange={e => this.updateTableParam("orderBy", e.target.value)}>
                <option value="marketsCreated">Markets Created</option>
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
                <th className="description-cell">Id</th>
                <th>Markets Created</th>
                <th>Reliability</th>
                <th>REP Disputed in Markets</th>
                <th>
                  Status
                  <span className={`settings settings-up-${showSettings}`} onClick={this.toggleShowSettings}>
                    <FontAwesomeIcon icon={["fas", showSettings ? "times" : "cog"]} style={{color: "#333333"}} size="2x" />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td><Link className="dope-link" to={`/creator/:id`}>{user.id}</Link></td>
                  <td>{user.marketsCreated}</td>
                  <td>{user.reliability.label}</td>
                  <td></td>
                </tr>
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
    )
  }
}

export default Creators