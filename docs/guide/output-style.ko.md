# 게임마스터 보이스 (출력 스타일)

[English](output-style.md) | **한국어**

> 영문이 기준입니다: [output-style.md](output-style.md).

Claude Code는 소프트웨어 엔지니어링 어시스턴트로 배포됩니다. 상황극은 시스템 레벨 인격을
**Storyteller** 출력 스타일로 바꿉니다 — 2인칭, 현재 시제, 인캐릭터, 코딩 도움 없음. 내장 코딩
지침을 제거하고(`keep-coding-instructions: false`) GM 보이스를 설치합니다.

## 스토리에서는 이미 켜져 있음

데모와 `templates/story/`로 만든 모든 스토리는 `.claude/settings.json`을 포함합니다:

```json
{ "outputStyle": "storyteller" }
```

그래서 스토리 디렉터리에서 `claude`를 켜면 게임마스터 보이스가 **자동 적용**됩니다 — 명령 불필요.
스킬과 출력 스타일 파일은 프로젝트의 `.claude/`에서 찾아지고, 스토리별 `settings.json`은 스타일을
*선택*만 하므로 다른 곳(예: 레포 루트)의 일반 Claude Code 동작은 그대로입니다.

## 수동 설정

설정이 없는 스토리라면 세션에서 켜기: `/config` → **Output style** → **storyteller**.
되돌리기: `/config` → **Output style** → **default**.

> 옛 `/output-style` 명령은 Claude Code v2.1.91에서 제거됨 — `/config` 사용.

## 두 보이스: story vs chat

플레이 보이스는 두 가지, 씬의 `mode`로 결정됨(스토리의 `.claude/settings.json`이 맞는 `outputStyle` 설정):

- **`storyteller`** — `mode: story`. 게임마스터 2인칭 서술; 에이전트가 세계를 운영.
- **`companion`** — `mode: chat`. 1:1 캐릭터챗: 에이전트가 등장 캐릭터가 **되어** `persona.md`에게
  1인칭으로 응답, 플레이어 행동은 서술 안 함 — Character.AI / 제타 / 크랙 / SillyTavern 캐릭터챗식.
  (`examples/companion-cafe` 데모 참고.)

수동 전환도 같음: `/config` → **Output style** → `storyteller` 또는 `companion`.

## 보이스 vs 절차

- **출력 스타일** (`.claude/output-styles/storyteller.md`) = *당신이 누구이고 어떻게 말하는가.*
- **`storyteller` 스킬** (`.claude/skills/storyteller/`) = *단계별 턴 루프.*

스킬은 플레이 중 자동 로드됩니다(스토리 디렉터리 + 인캐릭터 행동에 반응). 출력 스타일 없이도
메커니즘은 작동하지만, 켜면 산문이 훨씬 좋아집니다.

## 아웃오브캐릭터

`(OOC: ...)`로 잠깐 빠져나오세요(질문, 장면 조정). Storyteller는 평이하게 답하고, 아무것도 바꾸지
않고, 다음 턴에 픽션으로 돌아옵니다.
