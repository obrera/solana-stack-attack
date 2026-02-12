interface ProfileUiAvatarProps {
  name: string
  size?: number
}

export function ProfileUiAvatar({ name, size = 80 }: ProfileUiAvatarProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div
      className="flex items-center justify-center rounded-full bg-green-500 font-bold text-white"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials}
    </div>
  )
}
