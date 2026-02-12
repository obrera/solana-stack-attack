export function Hello({
  name = 'game-ui-native',
  className,
}: {
  name?: string
  className?: string
}) {
  return <div className={className}>Hello {name}</div>
}
