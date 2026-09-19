# Cloud MEMO — 개인소개 페이지 & 프론트엔드·백엔드 연동

KAIST DFMBA 「클라우드컴퓨팅실습」 개인과제 결과물입니다.
개인 소개 페이지와, 배포된 백엔드 API를 호출하는 프론트엔드를 하나의 Vercel 프로젝트로 배포했습니다.

---

## 1. 프로젝트 소개

관심사(투자 · AI · 테니스 · 고양이 · 기타)별로 메모를 분류해 저장하는 풀스택 웹 애플리케이션입니다.

- **개인소개 페이지**에서 작성자 소개를 확인하고, 링크를 통해 **API 연동 실습 페이지**로 이동합니다.
- 실습 페이지에서 메모를 등록·조회·삭제하면 Render에 배포된 FastAPI가 실제로 호출되고,
  데이터는 Supabase(PostgreSQL)에 저장됩니다.
- 브라우저 새로고침이나 다른 기기에서 접속해도 저장된 메모가 그대로 유지됩니다.

## 2. 주요 구성

| 계층 | 기술 | 역할 | 배포 플랫폼 |
| --- | --- | --- | --- |
| 개인소개 페이지 | HTML / CSS | 작성자 소개, 실습 페이지로 연결 | Vercel |
| 프론트엔드 | React (Vite) | 메모 입력·분류 필터·목록 표시, API 호출 | Vercel |
| 백엔드 | FastAPI · SQLAlchemy | 메모 CRUD API, 분류별 집계, CORS 처리 | Render |
| 데이터베이스 | PostgreSQL | 메모 영속 저장 | Supabase |
| 소스코드·문서 | Git | 버전 관리, README | GitHub |

### 페이지 구성

두 페이지는 서로 링크로 연결되어 있어 어느 쪽에서 들어와도 다른 쪽으로 이동할 수 있습니다.

```
/about.html   개인소개 페이지   → 상단·본문 버튼으로 실습 페이지 이동
/             API 연동 실습 페이지 → 상단·하단 링크로 개인소개 페이지 이동
```

### 폴더 구조

```
memo-frontend_p/
├─ public/
│  └─ about.html      ← 개인소개 페이지 (빌드 시 dist/ 루트로 그대로 복사됨)
├─ src/
│  ├─ App.jsx         ← 메모 앱 (분류 필터 · 등록 · 삭제)
│  ├─ App.css         ← 앱 스타일
│  ├─ index.css       ← 디자인 토큰 · 기본 스타일
│  └─ main.jsx        ← React 진입점
├─ index.html         ← 실습 페이지 HTML 셸
└─ vite.config.js
```

## 3. 배포 주소

| 구분 | 주소 |
| --- | --- |
| **개인소개 페이지 (제출용 대표 주소)** | <https://memo-frontend-p.vercel.app/about.html> |
| API 연동 실습 페이지 | <https://memo-frontend-p.vercel.app/> |
| 백엔드 Swagger UI | <https://memo-backend-p.onrender.com/docs> |
| 프론트엔드 저장소 | <https://github.com/qkryung/memo-frontend_p> |
| 백엔드 저장소 | <https://github.com/qkryung/memo-backend_p> |

> Render 무료 플랜은 15분간 요청이 없으면 서버가 잠듭니다.
> 첫 접속 시 30~60초 정도 로딩이 걸릴 수 있으며(콜드 스타트), 이후에는 정상 속도로 동작합니다.

## 4. 사용하는 API

백엔드 저장소: [qkryung/memo-backend_p](https://github.com/qkryung/memo-backend_p)

| 메서드 | 경로 | 설명 |
| --- | --- | --- |
| `GET` | `/memos` | 메모 목록 조회 (`?category=` 로 분류 필터) |
| `GET` | `/memos/stats` | 분류별 메모 개수 집계 |
| `POST` | `/memos` | 메모 등록 (`content`, `category`) |
| `DELETE` | `/memos/{memo_id}` | 메모 삭제 |
| `GET` | `/health` | 서버 상태 확인 |

분류 값: `investment`(투자) · `ai`(AI) · `tennis`(테니스) · `cat`(고양이) · `etc`(기타)

## 5. 로컬 실행

```bash
npm install
npm run dev        # http://localhost:5173
```

백엔드 주소는 환경변수로 주입합니다. 프로젝트 루트에 `.env` 파일을 만들고 아래 한 줄을 넣습니다.

```
VITE_API_URL=http://localhost:8000
```

`VITE_` 접두사가 붙은 변수만 브라우저 코드에 노출됩니다.
배포 환경에서는 Vercel 프로젝트의 Environment Variables에 `VITE_API_URL`을 Render 주소로 등록해 두었습니다.

---

**박민영** · KAIST DFMBA 클라우드컴퓨팅실습 개인과제
