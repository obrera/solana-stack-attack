export function Hello({
  name = 'game-ui-web',
  className,
}: {
  name?: string
  className?: string
}) {
  return <div className={className}>Hello {name}</div>
}
