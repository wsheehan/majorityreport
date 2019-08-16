import { library } from '@fortawesome/fontawesome-svg-core'
import { faCheck, faCog, faTimes, faAdjust, faEllipsisH, faRulerHorizontal } from '@fortawesome/free-solid-svg-icons'
import { faCheckCircle } from '@fortawesome/free-regular-svg-icons'

export default function init() {
  return library.add(faCheckCircle, faCog, faTimes, faAdjust, faEllipsisH, faRulerHorizontal)
}