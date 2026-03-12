# ReelBox — Design Spec

## Overview

ReelBox는 인스타그램 릴스를 카테고리, 태그, 메모와 함께 저장하고 검색할 수 있는 개인 웹 서비스입니다.

### Problem

인스타그램 컬렉션(저장) 기능은 키워드(컬렉션명)로만 분류 가능하며, 저장된 릴스 내에서 세부 검색이나 필터링을 지원하지 않습니다. 예를 들어 "데이트" 컬렉션에서 "역삼동" 식당만 찾으려면 릴스를 하나씩 열어 확인해야 합니다.

### Solution

릴스 URL을 저장할 때 카테고리, 태그, 메모를 추가하고, 이를 통해 검색/필터링할 수 있는 웹 서비스를 제공합니다.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js (App Router) |
| Backend | Server Actions |
| ORM | Prisma |
| Database | PostgreSQL (Vercel Postgres 또는 Supabase 무료) |
| Deployment | Vercel |

## Data Model

### Reel

| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | PK |
| url | String (unique) | 인스타그램 릴스 URL (중복 저장 불가) |
| thumbnail | String? | 자동 추출된 썸네일 URL (nullable) |
| memo | String? | 자유 메모 텍스트 |
| categoryId | String? | Category FK |
| createdAt | DateTime | 생성일 |
| updatedAt | DateTime | 수정일 |

### Category

| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | PK |
| name | String (unique) | 카테고리명 (데이트, 맛집, 여행 등) |
| reels | Reel[] | 해당 카테고리의 릴스들 |

### Tag

| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | PK |
| name | String (unique) | 태그명 (역삼동, 이탈리안 등) |
| reels | ReelTag[] | 연결된 릴스들 |

### ReelTag (Join Table)

| Field | Type | Description |
|-------|------|-------------|
| reelId | String | Reel FK (composite PK) |
| tagId | String | Tag FK (composite PK) |

- PK: composite (reelId, tagId)
- Reel:Category = N:1 (릴스 하나는 카테고리 1개)
- Reel:Tag = N:M (릴스 하나에 태그 여러 개, ReelTag 조인 테이블)

### Constraints & Validation

- `Reel.url`은 unique — 중복 URL 저장 시 "이미 저장된 릴스입니다" 에러 표시
- `Tag.name`은 대소문자 구분 없이 unique (저장 시 소문자로 정규화)

## Screens

### 1. 메인 화면 (홈)

- **상단 바**: ReelBox 로고 (좌), + 릴스 추가 버튼 (우)
- **검색창**: 태그, 메모, 카테고리 통합 검색
- **카테고리 필터**: 칩(pill) 형태, 가로 스크롤, "전체" 기본 선택
- **카테고리 필터**: "전체", "미분류" + 사용자 카테고리 칩 목록
- **릴스 카드 그리드**: 2열 그리드, 기본 정렬: 최신순 (createdAt DESC)
  - 각 카드: 썸네일(없으면 기본 플레이스홀더 아이콘) + 카테고리 태그(보라) + 태그(초록) + 메모 미리보기 (1줄, 말줄임)
  - 카드 클릭 시 상세 화면으로 이동
  - **페이지네이션**: 무한 스크롤, 1회 로드 20개

### 2. 릴스 추가 화면

- **← 뒤로** 버튼 + "릴스 추가" 타이틀
- **릴스 URL**: 텍스트 입력, placeholder "https://www.instagram.com/reel/..."
- **썸네일 미리보기**: URL 입력 시 Open Graph 메타데이터에서 자동 추출 시도, 실패 시 미표시
- **카테고리**: 드롭다운 선택
  - 기존 카테고리 목록 표시
  - 하단에 "+ 새 카테고리 추가" 옵션
- **태그**: 텍스트 입력 후 엔터로 추가, 각 태그에 ✕ 삭제 버튼
- **메모**: 자유 텍스트 영역
- **저장하기** 버튼

### 3. 릴스 상세 화면

- **← 뒤로** 버튼 + 수정/삭제 버튼 (상단 우측)
- **썸네일**: 크게 표시 (없으면 기본 플레이스홀더)
- **인스타그램에서 보기**: 인스타그램 핑크 버튼, 탭 시 원본 릴스 URL로 이동
- **카테고리**: 보라색 칩으로 표시
- **태그**: 초록색 칩 목록
- **메모**: 전체 내용 표시
- **저장일**: 하단 우측
- **삭제**: 확인 다이얼로그 표시 후 삭제 ("이 릴스를 삭제하시겠습니까?")
- **수정**: 릴스 추가 화면(Screen 2)을 재사용, 기존 값 pre-populate

## Key Features

### 검색

- 태그 name, 메모 content, 카테고리 name을 통합 검색
- v1: PostgreSQL LIKE (`%keyword%`) 기반 검색
- 추후 최적화: pg_trgm 확장 또는 Full-Text Search 전환 가능

### 카테고리 필터링

- 메인 화면 상단 칩으로 카테고리별 필터링
- "전체" 선택 시 모든 릴스 표시
- 검색과 필터링 조합 가능 (카테고리 필터 + 검색어)

### 썸네일 자동 추출

- 릴스 URL에서 Open Graph (og:image) 메타데이터를 서버 사이드에서 추출
- 실패 시 썸네일 없이 저장 (graceful fallback), 카드에 기본 플레이스홀더 아이콘 표시

### 카테고리 관리

- 별도 관리 화면 없음
- 릴스 추가 시 드롭다운에서 "새 카테고리 추가" 옵션으로 인라인 생성

## Layout & Responsiveness

- **모바일 우선** 디자인
- 데스크탑: 콘텐츠 영역 max-width 제한 (420px), 가운데 정렬
- 모바일: 풀 너비

## Authentication

- 현재: 로그인 없음 (개인 도구)
- 추후: 인스타그램 계정 연동 고려

## Out of Scope (v1)

- 인스타그램 API를 통한 릴스 자동 가져오기
- 소셜 로그인 / 멀티 유저
- PWA Share Target (모바일 공유 시트 연동)
- 카테고리 수정/삭제 기능
