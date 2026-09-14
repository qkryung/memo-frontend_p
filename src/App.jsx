import { useState, useEffect } from "react";

// 백엔드 API 주소. 지금은 백엔드가 없으니 환경변수로만 준비해 둔다.
// import.meta.env 는 Vite가 제공하는 환경변수 접근 객체.
// VITE_ 로 시작하는 변수만 브라우저 코드에 노출된다(보안상 중요).
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function App() {
  const [memos, setMemos] = useState([]);   // 메모 목록 상태
  const [text, setText] = useState("");      // 입력창 상태

  // 1장에서는 백엔드가 없으므로 임시 데이터로 화면만 확인한다.
  useEffect(() => {
    setMemos([{ id: 1, content: "첫 번째 메모(임시 데이터)" }]);
  }, []);

  // 아래 함수들은 3장부터 실제 fetch 호출로 채운다.
  const addMemo = () => {
    if (!text.trim()) return;
    setMemos([...memos, { id: Date.now(), content: text }]);
    setText("");
  };
  const deleteMemo = (id) => setMemos(memos.filter((m) => m.id !== id));

  return (
    <div style={{ maxWidth: 480, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>📝 연습 메모장</h1>
      <div style={{ display: "flex", gap: 8 }}>
        <input value={text} onChange={(e) => setText(e.target.value)}
          placeholder="메모를 입력하세요" style={{ flex: 1, padding: 8 }} />
        <button onClick={addMemo}>추가</button>
      </div>
      <ul>
        {memos.map((m) => (
          <li key={m.id}>
            {m.content}
            <button onClick={() => deleteMemo(m.id)} style={{ marginLeft: 8 }}>삭제</button>
          </li>
        ))}
      </ul>
    </div>
  );
}