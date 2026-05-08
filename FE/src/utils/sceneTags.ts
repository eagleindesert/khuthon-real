export const SCENE_TAGS = [
  '인디록',
  '인디팝',
  '재즈',
  '블루스',
  '포스트록',
  '슈게이징',
  '드림팝',
  '로파이',
  '일렉트로닉',
  '앰비언트',
  '포크',
  '어쿠스틱',
  'R&B',
  '소울',
  '힙합',
  '얼터너티브',
  '메탈',
  '펑크',
  '클래식',
  '재즈팝',
] as const

export type SceneTag = (typeof SCENE_TAGS)[number]
