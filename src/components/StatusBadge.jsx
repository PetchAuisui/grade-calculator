import Icon from '../icons'
import { isDraft } from '../lib/grade'

// ป้ายสถานะเทอม: ออกแล้ว / ทดลอง (เกรดจริงยังไม่ออก)
export default function StatusBadge({ term }) {
  const draft = isDraft(term)
  return (
    <span className={`badge ${draft ? 'draft' : 'final'}`}>
      <Icon name={draft ? 'flask' : 'check'} size="1em" /> {draft ? 'ทดลอง' : 'ออกแล้ว'}
    </span>
  )
}
