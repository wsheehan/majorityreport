import React, { Component } from 'react'
import { orderBy, sumBy } from 'lodash'
import BN from 'bignumber.js'
import randomColor from 'randomcolor'

import Round from './Round'
import UserInfo from './UserInfo'


class Market extends Component {
  render() {
    return (
      <div>
        <Description {...this.state} />
        <UserInfo {...this.props} />
        <div className="outcomes-wrapper col-sm-7">
          {this.state.outcomes.map(outcome => (
            <Outcome key={outcome.id} outcome={outcome} rounds={this.state.rounds} />
          ))}
        </div>
        <div className="selected-outcome-wrapper col-sm-5">
          <SelectedOutcome outcome={this.state.selectedOutcome} selectOutcome={this.selectOutcome} />
        </div>
      </div>
    )
  }

  selectOutcome = (selectedOutcome) => {
    this.setState({ selectedOutcome })
  }
}

function SelectedOutcome ({ outcome, rounds }) {
  if (!outcome || !rounds) return <div>empty</div>

  console.log(outcome)

  return (
    <div className="selected-outcome">
      {outcome.description}
    </div>
  )
}

function Description (state) {
  return (
    <div className="market-description col-sm-6">
      <div className="market-title">{state.description}</div>
      <div>{state.type}</div>
    </div>
  )
}

function Outcome ({ outcome, rounds, selectOutcome }) {
  return (
    <div className="outcome-row" onClick={() => selectOutcome(outcome.description)}>
      <span className="outcome">{outcome.description}</span>
      {rounds.map((round, i) => (
        <Round key={i} i={i} round={round} outcomeId={outcome.id} />
      ))}
    </div>
  )
}

function fillRounds(rounds, outcomes) {
  for (let j = rounds.length - 1; j >= 0; j--) {
    const total = sumBy(outcomes, 'stake')
    const sorted = orderBy(outcomes, [o => o.stake.toNumber()], ['desc'])

    const current = sorted[0].stake
    const previous = sorted[1].stake
    const last = sorted[2].stake

    const roundTotal = previous.dividedBy(2).minus(last).minus(current).times(-1)

    const id = sorted[0].id
    outcomes[id].stake = outcomes[id].stake.minus(roundTotal)

    rounds[j].id = id
    rounds[j].stake = roundTotal
  }
}

function getOutcomes(info, type) {
  if (type === 'BINARY') {
    return [{description: 'NO', id: 0}, {description: 'YES', id: 1}, {description: 'INVALID', id: 2}]
  } else {
    return [...info.outcomes, {description: 'INVALID', id: info.outcome.length}]
  }
}

function marketType (m) {
  return m.marketType === 'yesNo' ? 'BINARY' : 'CATEGORICAL'
}

export default Market