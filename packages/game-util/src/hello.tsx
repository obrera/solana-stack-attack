export function Hello({
  name = 'game-util',
  className,
}: {
  name?: string
  className?: string
}) {
  return <div className={className}>Hello {name}</div>
}
