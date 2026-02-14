import { router } from "./router";

function App() {
  return (
    <div>
      <button type="button" onClick={() => router.history.push("/login")}>
        로그인
      </button>
    </div>
  );
}

export default App;
