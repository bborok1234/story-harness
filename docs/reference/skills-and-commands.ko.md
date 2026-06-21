# 스킬, 커맨드, 에이전트 & 훅

[English](skills-and-commands.md) | **한국어**

> 영문이 기준입니다: [skills-and-commands.md](skills-and-commands.md).

Story Harness는 Claude Code 구성요소로 만들어졌습니다. 각각이 무엇이고 어디에 있는지.

## 출력 스타일

- **`storyteller`** (`.claude/output-styles/storyteller.md`) — 게임마스터 인격.
  `/output-style storyteller`로 설정. [guide/output-style](../guide/output-style.ko.md) 참고.

## 스킬

| 스킬 | 종류 | 내용 |
|---|---|---|
| `storyteller` | 자동 | 턴 루프: **CONTEXT → DECIDE → PERSIST → NARRATE**. 스토리 디렉터리에서 인캐릭터로 행동하면 자동 발동. |
| `recap` | `/recap` | `SCENE.md` + `state.json` + 최근 `log.md`로 "줄거리 요약". |
| `save` | `/save` | 스토리를 `saves/<타임스탬프>/`에 스냅샷. |

유저 커맨드는 `disable-model-invocation: true`인 스킬입니다. 자동 스킬은 `description`으로 발동합니다.
스킬은 `.claude/skills/<이름>/SKILL.md`에 있습니다.

## 턴 루프 (storyteller)

1. **CONTEXT** — `index.md`, `SCENE.md`, `state.json`, `log.md` 끝부분, 각 등장 캐릭터 파일을 읽음.
   필요할 때 읽고, 세계 전체는 절대 로드 안 함.
2. **DECIDE** — 플레이어 행동 해석; 무엇이 반응하고, 무엇이 변하고, 어떤 이벤트가 발동하나.
3. **PERSIST** — 변경을 *먼저* 기록: `state.json` 갱신(0–100 제한, `turn` 증가), `log.md` 추가,
   영향받는 파일 편집/생성.
4. **NARRATE** — 그제서야 산문 작성.

핵심 규칙: **서술 전에 저장.**

## 예정 (P2)

- **서브에이전트 `lore-keeper`** — 격리된 컨텍스트에서 긴 히스토리를 읽고, 변경분 + 연속성 판정만 반환.
- **훅** (`.claude/settings.json`) — `SessionStart`가 상태 로드, `Stop`이 자동저장 + 로그 추가,
  `PostToolUse`가 서술-전-저장 감사. 훅은 조언이 아니라 결정론적 레일.

[로드맵](../../ROADMAP.md) 참고.
