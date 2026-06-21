# 아키텍처

[English](architecture.md) | **한국어**

> 영문이 기준입니다: [architecture.md](architecture.md).

## 발상

대부분의 캐릭터챗 플랫폼은 세계 전체 — 설정, 캐릭터, 기억, 규칙 — 를 하나의 거대 프롬프트에 넣습니다.
확장이 안 됩니다: 설정이 늘고, 기억이 비대해지고, 모든 게 컨텍스트 창을 두고 경쟁합니다.

Claude Code는 다른 길을 보여줬습니다: **전부 로드하지 말고, 필요한 것을 필요할 때 읽어라.**
Story Harness는 이를 상황극에 적용합니다. *프롬프트 엔지니어링 → 환경 엔지니어링.*

## 새 엔진이 아니라 레이어

Story Harness는 새 에이전트 루프나 LLM 백엔드가 **아닙니다**. Claude Code가 이미 루프를 제공합니다(파일
읽기/편집, 서브에이전트, 세션). 우리는 그 위에 얇은 **배포 레이어**를 더합니다 — `gstack` / `lazycodex`가
별도 엔진이 아니라 의견 있는 Claude Code 배포판인 것처럼.

## 4개 레이어

```
환경(Environment)  →  story/ 파일 (디스크 위의 세계)
두뇌(Brain)        →  CLAUDE.md = 짧은 헌법 (파일 포맷 + 규칙 + 포인터)
인격(Persona)      →  output-style storyteller = GM 보이스 (코더 프롬프트 제거)
제어(Controls)     →  스킬 (플레이 루프 + 커맨드), 서브에이전트, 훅
```

## 로어북 엔진이 없는 이유

SillyTavern / AI Dungeon은 키워드 트리거 시스템에 아키텍처를 씁니다: 채팅 스캔, 키워드 매칭, 토큰
예산 내 로어 주입. Story Harness는 그 서브시스템을 삭제합니다 — 에이전트의 **Read 도구 + 좋은 파일
구조 + 이름이 곧 검색**이니까요. `SCENE.md`가 `prince`를 언급 → 에이전트가 `characters/prince.md`를
읽음. 필요할 때 즉시, 예산 저글링 없이.

## 설계 영향

- **컨텍스트 / 환경 엔지니어링** — Anthropic; 파일시스템-as-메모리, 필요할 때 검색.
- **OKF + Karpathy의 LLM-위키** — 파일/메모리 포맷(머리말, 링크, `index.md`, `log.md`).
- **Ink (인터랙티브 픽션)** — 합법 전이를 가진 열거형 상태, 드리프트 제한.
- **MemGPT / Generative Agents** — 계층형 기억; 무엇이 재부상할지 = 최근성 + 중요도 + 관련성.

## 이식성

`CLAUDE.md`는 `AGENTS.md`(심링크)로 미러됩니다. Codex와 OpenCode가 이를 네이티브로 읽으므로, 같은
스토리 파일과 규약이 나중에 다른 엔진으로 옮겨집니다.
