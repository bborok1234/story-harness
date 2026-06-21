# 게임마스터 보이스 (출력 스타일)

[English](output-style.md) | **한국어**

> 영문이 기준입니다: [output-style.md](output-style.md).

Claude Code는 소프트웨어 엔지니어링 어시스턴트로 배포됩니다. 상황극을 하려면 시스템 레벨 인격을
**Storyteller** 출력 스타일로 바꿉니다:

```
/output-style storyteller
```

이게 코더를 게임마스터로 바꾸는 단 하나의 스위치입니다. 이것은:

- 내장 코딩 지침을 제거하고 (`keep-coding-instructions: false`),
- GM 보이스를 설치합니다: 2인칭, 현재 시제, 장면 단위 호흡, 각자 목소리를 가진 캐릭터,
- 계약을 강제합니다 — *플레이어가 자기 캐릭터를 소유한다; 사실은 파일에서 온다; 서술 전에 저장한다.*

세션당 **한 번만** 설정하면 유지됩니다. 일반 Claude Code로 돌아가려면 `/output-style default`.

## 보이스 vs 절차

- **출력 스타일** (`.claude/output-styles/storyteller.md`) = *당신이 누구이고 어떻게 말하는가.*
- **`storyteller` 스킬** (`.claude/skills/storyteller/`) = *단계별 턴 루프.*

스킬은 플레이 중 자동 로드됩니다(스토리 디렉터리 + 인캐릭터 행동에 반응). 그래서 출력 스타일 없이도
메커니즘은 작동하지만, 켜면 산문이 훨씬 좋아집니다.

## 아웃오브캐릭터

`(OOC: ...)`로 잠깐 빠져나오세요(질문, 장면 조정). Storyteller는 평이하게 답하고, 아무것도 바꾸지
않고, 다음 턴에 픽션으로 돌아옵니다.
