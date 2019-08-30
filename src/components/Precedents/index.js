import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { orderBy } from 'lodash'
import Loader from '../Loader'
import * as API from '../../api'

import './style.scss'

class Precedents extends Component {
  constructor() {
    super()

    this.state = {
      precedents: null,
      err: null
    }
  }

  async componentDidMount() {
    const data = await API.precedents()
    if (data.err) {
      this.setState({ err: data.err })
    } else {
      this.setState({ precedents: data })
    }
  }

  render() {
    if (!this.state.precedents) {
      return <Loader />
    }

    if (this.state.err) {
      return <div>{this.state.err.message}</div>
    }

    const totalInvalids = this.state.precedents.reduce((acc, p) => acc + p.markets, 0)
    const sortedPrecedents = orderBy(this.state.precedents, 'markets', 'desc')

    return (
      <div className="precedents container-fluid">
        <div className="row">
          {sortedPrecedents.map(p => (
            <div className="precedent-wrapper col-sm-6" key={p.id}>
              <div className="precedent">
                <span className="short-name">{p.name}</span>
                <h5><Link className="dope-link" to={`/precedent/${p.id}`}>{p.description}</Link></h5>
                <p>{p.rationale}</p>
                <span className="precedent-invalids">Markets Invalidated: {p.markets} <span className="percent-of-invalids">{((p.markets / totalInvalids) * 100).toFixed(2)}%</span></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
}

export default Precedents