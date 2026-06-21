# 시작하기

[English](getting-started.md) | **한국어**

> 영문이 기준입니다: [getting-started.md](getting-started.md).

## 준비물

- [Claude Code](https://code.claude.com) 설치 및 로그인 (`claude --version`).
- `python3` (정적 검사에만 필요).

## 데모 플레이

```bash
git clone https://github.com/bborok1234/story-harness
cd story-harness/examples/imperial-ball
claude
```

세션에서 게임마스터 보이스를 한 번 설정 — `/config` 열고 **Output style** 선택 후 **storyteller**
고르기. (옛 `/output-style` 명령은 Claude Code v2.1.91에서 제거됨.)

그 다음 **인캐릭터로** — 캐릭터가 하는 행동을 산문으로 적습니다:

```
황태자 Aurelio에게 다가가 첫 춤을 청한다 — 진심 어린 미소로 손을 내민다.
```

Storyteller가 이렇게 합니다:
1. 관련 파일 읽기 (`SCENE.md`, `characters/prince.md`),
2. 서술하기 **전에** 결과를 `states/state.json`과 `log.md`에 반영,
3. 장면을 되돌려 서술.

## 커맨드

- `/recap` — 지금까지의 상황 "줄거리 요약".
- `/save` — `saves/<타임스탬프>/`에 스냅샷 (되돌리려면 복사해 덮어쓰기).

## 방금 무슨 일이?

거대 프롬프트에 욱여넣은 게 없습니다. 에이전트가 필요할 때 파일을 탐색했어요 — Claude Code가
코드베이스를 읽는 방식 그대로. 관계와 세계는 열어서 고칠 수 있는 평범한 파일에 있습니다.

다음: [내 스토리 만들기](writing-a-story.ko.md).
