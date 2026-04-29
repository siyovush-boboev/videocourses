import { FileText, MessageCircleMore, ShieldCheck, Wallet } from 'lucide-react'

function CourseCardIcon({ type }) {
  if (type === 'shield') {
    return <ShieldCheck aria-hidden="true" strokeWidth={1.8} absoluteStrokeWidth />
  }

  if (type === 'chat') {
    return <MessageCircleMore aria-hidden="true" strokeWidth={1.8} absoluteStrokeWidth />
  }

  if (type === 'wallet') {
    return <Wallet aria-hidden="true" strokeWidth={1.8} absoluteStrokeWidth />
  }

  return <FileText aria-hidden="true" strokeWidth={1.8} absoluteStrokeWidth />
}

export default CourseCardIcon
