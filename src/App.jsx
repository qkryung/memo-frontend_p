import { useEffect, useState } from "react";
import "./App.css";

// 백엔드 API 주소.
// import.meta.env 는 Vite가 제공하는 환경변수 접근 객체이며,
// VITE_ 로 시작하는 변수만 브라우저 코드에 노출된다(보안상 중요).
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// 백엔드 MemoCategory 열거형과 key가 1:1로 대응한다.
const CATEGORIES = [
  { key: "investment", label: "투자", icon: "📈" },
  { key: "ai", label: "AI", icon: "🤖" },
  { key: "tennis", label: "테니스", icon: "🎾" },
  { key: "cat", label: "고양이", icon: "🐾" },
  { key: "etc", label: "기타", icon: "🗂️" },
];

const categoryOf = (key) =>
  CATEGORIES.find((c) => c.key === key) ?? { key, label: key, icon: "🗂️" };

export default function App() {
  const [memos, setMemos] = useState([]);        // 화면에 보여줄 메모 목록
  const [stats, setStats] = useState({});        // 분류별 개수(백엔드 집계)
  const [filter, setFilter] = useState("all");   // 지금 보고 있는 분류
  const [text, setText] = useState("");          // 입력창
  const [category, setCategory] = useState("investment"); // 새 메모의 분류
  const [loading, setLoading] = useState(true);
  const [slow, setSlow] = useState(false);       // 콜드 스타트 안내용
  const [busy, setBusy] = useState(false);       // 등록·삭제 중복 클릭 방지
  const [error, setError] = useState("");
  const [tick, setTick] = useState(0);           // 목록 새로고침 트리거

  const refresh = () => setTick((t) => t + 1);

  // 분류가 바뀌거나 새로고침 신호가 올 때마다 목록과 집계를 함께 불러온다.
  useEffect(() => {
    let cancelled = false;
    const slowTimer = setTimeout(() => {
      if (!cancelled) setSlow(true);
    }, 3500);

    (async () => {
      setLoading(true);
      setError("");
      try {
        const query = filter === "all" ? "" : `?category=${filter}`;
        const [listRes, statsRes] = await Promise.all([
          fetch(`${API_URL}/memos${query}`),   // 목록 조회 GET
          fetch(`${API_URL}/memos/stats`),     // 분류별 집계 GET
        ]);
        if (!listRes.ok || !statsRes.ok) throw new Error("server error");

        const [list, counts] = await Promise.all([listRes.json(), statsRes.json()]);
        if (cancelled) return;
        setMemos(list);
        setStats(counts);
      } catch {
        if (!cancelled) {
          setError(
            "백엔드 API에 연결하지 못했습니다. 무료 플랜 서버가 잠들어 있었다면 " +
              "30~60초 뒤 다시 시도하면 깨어납니다.",
          );
        }
      } finally {
        clearTimeout(slowTimer);
        if (!cancelled) {
          setLoading(false);
          setSlow(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(slowTimer);
    };
  }, [filter, tick]);

  const addMemo = async (e) => {
    e.preventDefault();
    const content = text.trim();
    if (!content || busy) return;

    setBusy(true);
    try {
      const res = await fetch(`${API_URL}/memos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // 자바스크립트 객체 → JSON 문자열
        body: JSON.stringify({ content, category }),
      });
      if (!res.ok) throw new Error("create failed");

      setText("");
      // 다른 분류를 보고 있었다면, 방금 등록한 분류로 옮겨 결과를 바로 보여준다.
      if (filter !== "all" && filter !== category) setFilter(category);
      else refresh();
    } catch {
      setError("메모를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  };

  const deleteMemo = async (id) => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch(`${API_URL}/memos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("delete failed");
      refresh();
    } catch {
      setError("메모를 삭제하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  };

  const total = stats.total ?? 0;

  return (
    <>
      <header className="topbar">
        <div className="wrap topbar__inner">
          <a className="brand" href="/about.html">
            <span className="brand__mark">MP</span>
            박민영
          </a>
          <a className="btn btn--ghost" href="/about.html">
            &larr; 소개 페이지
          </a>
        </div>
      </header>

      <section className="header">
        <div className="wrap">
          <span className="header__eyebrow">Frontend · Backend 연동 실습</span>
          <h1>Cloud MEMO</h1>
          <p>
            관심사별로 메모를 분류해 저장합니다. 등록·조회·삭제가 모두 Render에 배포된
            FastAPI를 호출하고, 데이터는 Supabase(PostgreSQL)에 저장됩니다.
          </p>
        </div>
      </section>

      <main className="main">
        <div className="wrap">
          {/* ── 메모 입력 ── */}
          <form className="panel composer" onSubmit={addMemo}>
            <div className="panel__title">새 메모</div>
            <div className="composer__row">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="메모를 입력하세요"
                maxLength={500}
              />
              <button type="submit" className="btn btn--primary" disabled={busy || !text.trim()}>
                {busy ? "처리 중…" : "추가"}
              </button>
            </div>

            <div className="composer__picker">
              {CATEGORIES.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  className="chip"
                  aria-pressed={category === c.key}
                  onClick={() => setCategory(c.key)}
                >
                  <span aria-hidden="true">{c.icon}</span>
                  {c.label}
                </button>
              ))}
            </div>
            <p className="composer__hint">
              선택한 분류로 저장됩니다 — 현재 선택: <strong>{categoryOf(category).label}</strong>
            </p>
          </form>

          {/* ── 분류 필터 ── */}
          <nav className="filters" aria-label="분류 필터">
            <button
              type="button"
              className="tab"
              aria-selected={filter === "all"}
              onClick={() => setFilter("all")}
            >
              전체
              <span className="tab__count">{total}</span>
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                type="button"
                className="tab"
                aria-selected={filter === c.key}
                onClick={() => setFilter(c.key)}
              >
                <span aria-hidden="true">{c.icon}</span>
                {c.label}
                <span className="tab__count">{stats[c.key] ?? 0}</span>
              </button>
            ))}
          </nav>

          {/* ── 목록 ── */}
          {loading ? (
            <div className="skeleton">
              <div className="skeleton__row" />
              <div className="skeleton__row" />
              <div className="skeleton__row" />
              {slow && (
                <p className="composer__hint">
                  무료 플랜 서버를 깨우는 중입니다. 최초 요청은 30~60초 걸릴 수 있습니다…
                </p>
              )}
            </div>
          ) : error ? (
            <div className="state state--error">
              <strong>연결 실패</strong>
              {error}
              <div style={{ marginTop: 16 }}>
                <button type="button" className="btn btn--primary" onClick={refresh}>
                  다시 시도
                </button>
              </div>
            </div>
          ) : memos.length === 0 ? (
            <div className="state">
              <strong>아직 메모가 없습니다</strong>
              {filter === "all"
                ? "위 입력창에서 첫 메모를 남겨보세요."
                : `'${categoryOf(filter).label}' 분류에 저장된 메모가 없습니다.`}
            </div>
          ) : (
            <ul className="list">
              {memos.map((m) => {
                const c = categoryOf(m.category);
                return (
                  <li key={m.id} className="memo">
                    <span className="memo__badge">
                      <span aria-hidden="true">{c.icon}</span>
                      {c.label}
                    </span>
                    <span className="memo__content">{m.content}</span>
                    <button
                      type="button"
                      className="memo__delete"
                      onClick={() => deleteMemo(m.id)}
                      disabled={busy}
                    >
                      삭제
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>

      <footer className="footer">
        <div className="wrap">
          <a href="/about.html">박민영 소개 페이지</a> · KAIST DFMBA 클라우드컴퓨팅실습 개인과제
          <p className="footer__api">
            Backend API: <a href={`${API_URL}/docs`} target="_blank" rel="noopener">{API_URL}/docs</a>
          </p>
        </div>
      </footer>
    </>
  );
}
