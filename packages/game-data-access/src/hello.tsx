export function Hello({
  name = 'game-data-access',
  className,
}: {
  name?: string
  className?: string
}) {
  return <div className={className}>Hello {name}</div>
}
