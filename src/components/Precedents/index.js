import React, { Component } from 'react'
import { Link } from 'react-router-dom'

import './style.scss'

const precedents = [
  {
    id: 1,
    description: "The question is subjective in nature",
    rationale: "Will not reliably lead to a winning fork",
    invalids: 30,
    notables: ["Bastille", "Will this Market Fork"]
  },
  {
    id: 2,
    description: "The outcome was not known at market end time",
    rationale: "Reporters cannot know what happened as it has not occured, with some events this means that the initial reporter could report correctly the before the event happens, but that result ends up being incorrect",
    invalids: 61,
    notables: ["Senate"]
  },
  {
    id: 3,
    description: "The title, details, and outcomes are in direct conflict with each other",
    rationale: "No schelling point on correct answer other than invalid",
    invalids: 15,
    notables: ["Veil Prices", "BTC $1000"]
  },
  {
    id: 4,
    description: "There are strong arguments for the market resolving as multiple outcomes",
    rationale: "Reduces incentive to report if such markets are valid",
    invalids: 23,
    notables: ["ETH $500"]
  }
]

class Precedents extends Component {
  render() {
    return (
      <div className="precedents col-sm-10 offset-sm-1">
        {precedents.map(p => (
          <div className="precedent">
            <h4>{p.description}</h4>
            <p>{p.rationale}</p>
            {p.notables.map(n => (
              <Link to={`/market/${n}`}><span className="precedent-notable">{n}</span></Link>
            ))}
            <span className="precedent-invalids">Invalids: {p.invalids} <span>{(p.invalids / 3).toFixed(0)}%</span></span>
          </div>
        ))}
      </div>
    )
  }
}

export default Precedents