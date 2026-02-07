export interface Milestone {
  id: string
  name: string
  description: string
  icon: string
  type: 'score' | 'taps' | 'level' | 'upgrades'
  threshold: number
}

export function gameCheckMilestones(
  score: number,
  totalTaps: number,
  totalUpgrades: number,
  achieved: string[],
  milestones: Milestone[],
): Milestone[] {
  const newlyAchieved: Milestone[] = []

  for (const milestone of milestones) {
    if (achieved.includes(milestone.id)) {
      continue
    }

    let value = 0
    switch (milestone.type) {
      case 'score':
        value = score
        break
      case 'taps':
        value = totalTaps
        break
      case 'upgrades':
        value = totalUpgrades
        break
    }

    if (value >= milestone.threshold) {
      newlyAchieved.push(milestone)
    }
  }

  return newlyAchieved
}
