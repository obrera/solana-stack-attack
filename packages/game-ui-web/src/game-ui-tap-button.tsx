import { useGameContext } from '@solana-stack-attack/game-data-access/game-provider'
import { useCallback, useRef, useState } from 'react'

export function GameUiTapButton() {
  const { tap } = useGameContext()
  const [isPressed, setIsPressed] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      tap(x, y)

      setIsPressed(true)
      setTimeout(() => setIsPressed(false), 100)
    },
    [tap],
  )

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={handleClick}
      className={`relative h-[200px] w-[200px] select-none rounded-full border-4 border-emerald-400 bg-black/10 transition-transform duration-100 ${isPressed ? 'scale-95' : 'scale-100'} hover:border-emerald-300 active:scale-95`}
    >
      <div className="flex flex-col items-center justify-center">
        <span className="text-6xl">💎</span>
        <span className="mt-1 font-bold text-emerald-400 text-xl">TAP!</span>
      </div>
    </button>
  )
}
