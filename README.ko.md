# Story Harness

[![check](https://github.com/bborok1234/story-harness/actions/workflows/check.yml/badge.svg)](https://github.com/bborok1234/story-harness/actions/workflows/check.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[English](README.md) | **한국어**

> 이 문서는 [영문 README](README.md)의 번역본입니다. 내용이 다를 경우 **영문 문서가 기준**입니다.

**캐릭터챗이 Claude Code처럼 동작한다면?**

Story Harness는 Claude Code를 대화형 상황극/스토리텔링 엔진으로 바꿉니다 — 새 에이전트 루프를 만드는
게 아니라 **Claude Code 위에 얹는 얇은 배포 레이어**로요. 세계관은 **파일**에 살고, 에이전트는 한
장면에 필요한 것만, 필요할 때 읽습니다. *프롬프트 엔지니어링이 아니라 환경 엔지니어링.*

## 데모 플레이

```bash
cd examples/imperial-ball
claude            # 그 다음 인캐릭터로:  "황태자 Aurelio에게 첫 춤을 청한다."
```

Storyteller가 장면을 읽고, 당신의 행동을 스토리 파일에 반영한 뒤, 서술합니다. `/recap`이나 `/save`도
써보세요. 관계와 세계 상태는 `states/state.json`과 `log.md`에 남습니다 — 사람이 읽고, 고치고, git으로
버전 관리할 수 있는 평범한 파일입니다.

> 완전한 게임마스터 보이스를 원하면 `/config` → **Output style** → **storyteller**로 한 번 설정하세요.

## 동작 방식

| 레이어 | 위치 |
|---|---|
| **환경(Environment)** | `story/` 파일 — `SCENE.md`, `characters/`, `world/`, `events/`, `log.md`, `states/state.json` |
| **두뇌(Brain)** | `CLAUDE.md` — 짧은 헌법(파일 포맷 + 규칙), 거대 프롬프트 아님 |
| **인격(Persona)** | `.claude/output-styles/storyteller.md` — GM 보이스 |
| **제어(Controls)** | `.claude/skills/`(플레이 루프 + `/recap` `/save`), `.claude/agents/`, 훅 |

스토리 파일은 **Open Knowledge Format(OKF)** 규약을 따릅니다: 마크다운 + YAML 머리말(`type:`),
관계는 마크다운 링크로, 폴더마다 `index.md`, 추가 전용 `log.md`.

## 새 스토리 시작

골격을 복사해 편집하세요:
```bash
cp -R templates/story my-story && cd my-story && claude
```

## 검증

```bash
./scripts/check.sh             # 정적 검사 (LLM 없음)
./evals/run.sh dance-prince    # 시나리오 테스트 (claude 헤드리스 구동)
```

## 상태

P1 (MVP) — 진행 상황은 [로드맵](ROADMAP.md)과
[플랜](docs/plan/2026-06-21-story-harness.md) 참고. Claude Code 기반이며 `AGENTS.md`를 통해
Codex/OpenCode로 이식 가능.

## 문서

전체 문서는 [`docs/`](docs/README.ko.md) — 가이드와 레퍼런스.

## 기여 & 라이선스

[CONTRIBUTING.md](CONTRIBUTING.md)와 [행동 강령](CODE_OF_CONDUCT.md)을 봐주세요.
[MIT 라이선스](LICENSE)로 배포됩니다.
