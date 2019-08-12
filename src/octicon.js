import React from 'react'
import Octicon, {getIconByName} from '@primer/octicons-react'

export default function OcticonByName({name, ...props}) {
  return <Octicon {...props} icon={getIconByName(name)} />
}