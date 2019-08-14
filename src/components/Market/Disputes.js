import React from 'react'
import { orderBy } from 'lodash'
import PatternExtractor from 'pattern-extractor'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { weiToDec } from '../../helpers'

function formatOutcomes (market) {
  market.outcomes.forEach(o => {
    o.nDisputes = market.rounds.filter(r => r.outcome === o.description).length
    o.currentOutcome = market.rounds[0].outcome === o.description
  })

  const activeOutcomes = market.outcomes.filter(o => o.nDisputes > 0)
  const x = 100 / (activeOutcomes.length + ((2/3) * (market.outcomes.length - activeOutcomes.length)))
  market.outcomes.forEach(o => {
    if (o.nDisputes > 0) {
      o.width = x
    } else {
      o.width = (2/3) * x
    }
  })
}

function Disputes ({ market }) {
  const currentOutcome = market.rounds[0].outcome
  const resolved = market.finalized

  // format outcomes
  formatOutcomes(market)

  const sortedOutcomes = orderBy(market.outcomes, ['currentOutcome', 'nDisputes'], ['desc', 'desc'])

  return (
    <div>
      <div className="dispute-info">
        <ResolutionStatus market={market} />
      </div>
      <div className="disputes">
        <div className="outcomes-header">
          {sortedOutcomes.map(outcome => (
            <OutcomeHeader key={outcome.id} 
              market={market} 
              outcome={outcome} 
              resolved={resolved} 
              currentOutcome={currentOutcome} />
          ))}
        </div>

        <div className="rounds-wrapper">
          {sortedOutcomes.map(outcome => (
            <Rounds outcome={outcome} market={market} key={outcome.id} />
          ))}
        </div>
      </div>
    </div>
  )
}

function OutcomeHeader ({ market, outcome, resolved, currentOutcome }) {
  let check = null
  if (resolved && outcome.description === currentOutcome) {
    check = <FontAwesomeIcon icon={["far", "check-circle"]} style={{color:"#28a745", float: "right", margin: "4px"}} />
  }

  return (
    <div className="outcome-column" style={{width: `${outcome.width}%`}}>
      <div className={`outcome-header outcome-header-resolved-${resolved} outcome-header-current-${outcome.description === currentOutcome}`}>
        {outcome.description} {check}
      </div>
    </div>
  )
}

function numDipsutesCategory (n) {
  if (n > 10) {
    return 'spicy'
  } else if (n > 5) {
    return 'moderate'
  } else if (n > 0) {
    return 'low'
  } else {
    return 'none'
  }
}

function ResolutionStatus ({ market }) {
  if (market.finalized) {
    const outcome = market.tentativeOutcome
    const category = numDipsutesCategory(market.rounds.length - 1)
    return (
      <div className={`resolution resolution-${outcome}`}>
        Resolved as: <span className={`res-outcome res-outcome-${outcome}`}>{outcome}</span> after <span className={`num-disputes num-disputes-${category}`}>{market.rounds.length - 1}</span> rounds of dispute
      </div>
    )
  } else {
    return (
      <div className={`resolution`}>
        Tentative Outcome: <span>{market.tentativeOutcome}</span>
      </div>
    )
  }
  return null
}

function Rounds ({ outcome, market }) {
  return (
    <div key={outcome.id} className="outcome-column" style={{width: `${outcome.width}%`}}>
      <UnfilledRound rounds={market.unfilledRounds} outcome={outcome} market={market} />
      {market.rounds.map((round, i) => <Round round={round} previousRound={market.rounds[i-1]} outcome={outcome} />)}
    </div>
  )
}

function Round ({ round, outcome, previousRound }) {
  if (round.outcome === outcome.description) {
    return (
      <div className={`round round-filled round-${round.round}`}>{weiToDec(round.sizeFilled).toFixed(2)}</div>
    )
  } else if (previousRound && previousRound.outcome === outcome.description) {
    return <div className="round round-not-fillable">&nbsp;<div className="diag-line"></div></div>
  } else {
    return <div className="round">&nbsp;</div>
  }
}

function UnfilledRound ({ rounds, outcome, market }) {
  if (rounds.length === 0 || market.finalized) return null

  const round = rounds.find(r => r.outcome === outcome.description)
  if (round) {
    return (
      <div className="round unfilled-round">{weiToDec(round.sizeFilled).toFixed(2)} / {weiToDec(round.size).toFixed(2)}</div>
    )
  } else {
    return <div className="round">&nbsp;</div>
  }
}

export default Disputes