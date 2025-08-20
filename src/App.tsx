import { BrowserRouter } from "react-router-dom";
import MainRouter from "./routers/index.router";

function App() {
  return (
    <>
      <BrowserRouter>
        <MainRouter />
      </BrowserRouter>
    </>
  );
}

export default App;
