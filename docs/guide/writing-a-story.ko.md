# 스토리 만들기

[English](writing-a-story.md) | **한국어**

> 영문이 기준입니다: [writing-a-story.md](writing-a-story.md).

스토리는 파일이 든 폴더입니다. 골격을 복사해 편집하세요:

```bash
cp -R templates/story my-story && cd my-story
```

## 구성 요소

| 파일 / 폴더 | 역할 |
|---|---|
| `index.md` | 스토리 표지 — 전제 + 모든 항목 링크. |
| `SCENE.md` | **현재** 장면: 위치, 분위기, 등장 캐릭터, 현재 목표, 가능한 이벤트. |
| `characters/` | 캐릭터당 파일 하나 (`type: Character`). 성격, 목표, 아는 것. |
| `world/` | 장소, 세력, 설정 (`type: Location` / `Faction`). |
| `relationships/` | 선택: 중요한 관계당 파일 하나. |
| `events/` | 장면에서 발동 가능한 사건 (`type: Event`) — 트리거, 효과, 결과. |
| `log.md` | 추가 전용 기록; 비트당 한 줄. |
| `states/state.json` | 라이브 수치 (관계, 세계), `0–100`, 그리고 `turn` 카운터. |

## 플레이 최소 요건

장면이 돌아가려면 세 가지면 됩니다:

1. 등장 캐릭터와 목표를 적은 **`SCENE.md`**.
2. 각 캐릭터의 **`characters/<이름>.md`**.
3. **`log.md`** (오프닝 비트 한 줄로 시작 가능).

나머지(world, events, relationships)는 스토리를 깊게 하지만 필수는 아닙니다. 스토리가 자라면 파일을
추가하세요 — 참조될 때 에이전트가 읽습니다.

## 팁

- **반복하지 말고 링크하세요.** 캐릭터/장소는 마크다운 링크로 참조 — 링크가 곧 그래프.
- **`state.json`으로 긴장감을 만드세요.** 이벤트를 수치로 게이팅 (데모는 `prince.trust ≥ 60`에서 청혼 발동).
- **욕망과 비밀이 있는 캐릭터**를 쓰세요 — 설명만 있는 캐릭터보다 좋은 장면 파트너가 됩니다.
- 루트에서 `./scripts/check.sh`로 포맷 검증.

전체 포맷은 [reference/file-format](../reference/file-format.ko.md) 참고.
