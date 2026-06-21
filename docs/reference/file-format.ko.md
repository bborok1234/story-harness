# 파일 포맷 (OKF)

[English](file-format.md) | **한국어**

> 영문이 기준입니다: [file-format.md](file-format.md).

스토리 파일은 **Open Knowledge Format** 규약을 따릅니다: 마크다운 + YAML 머리말, 링크는 엣지로,
폴더마다 `index.md`, 추가 전용 `log.md`. 사람이 편집 가능하고, git diff 되며, DB가 필요 없습니다.

## 머리말(frontmatter)

모든 스토리 파일은 YAML 머리말로 시작합니다. 필수 필드는 **`type`** 하나:

```markdown
---
type: Character
name: Prince Aurelio
role: Crown Prince
status: { trust_user: 20, affection_user: 10 }
---
# Prince Aurelio
황태자. 과묵하고, 정치적이며, 자존심 강함. [Duke Aldric](aldric.md)의 라이벌.
```

유효한 `type` 값: `Character`, `Location`, `Relationship`, `Event`, `Faction`, `Scene`.

## 관계 = 링크

다른 파일은 마크다운 링크로 참조 — `[Duke Aldric](aldric.md)`. 링크의 집합이 **곧** 세계
그래프입니다. 별도 그래프 저장소 불필요. 엣지 어휘(`relationships/`에서 사용):
`knows · likes · loves · rivals · fears · serves · betrayed`.

## 예약 파일

- **`index.md`** (폴더마다) — 내부 목록, 탐색 / 점진적 공개용.
- **`log.md`** (스토리마다) — 추가 전용, 시간순: `- [turn N] <누구/무엇>: <무슨 일>`.

## `states/state.json`

라이브 수치 상태. 숫자는 `0–100`으로 제한, `turn`은 음이 아닌 정수.

```json
{
  "turn": 0,
  "world": { "reputation": 50 },
  "relationships": {
    "prince": { "trust": 20, "affection": 10 }
  }
}
```

서사적 사실(밝혀진 비밀, 상태)은 해당 마크다운 파일에, *숫자만* `state.json`에 둡니다. 드리프트를
줄이려면 한 단계씩만 이동하는 명명된 밴드를 쓰세요 (예: `wary → neutral → warm → loyal`).

## 검증

`./scripts/check.sh`가 강제합니다: 머리말 + 유효한 `type`, `state.json` 스키마(숫자 `0–100`, 정수
`turn`), 깨진 상대 링크 없음.

OKF 배경: [Open Knowledge Format](https://cloud.google.com/blog/products/data-analytics/how-the-open-knowledge-format-can-improve-data-sharing),
Karpathy의 [LLM-wiki 패턴](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f).
