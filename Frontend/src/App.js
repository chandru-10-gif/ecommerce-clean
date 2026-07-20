import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";

import { Provider } from "react-redux";
import store from "./redux/Store";

import Router from "./routes";
import { BrowserRouter } from "react-router-dom";




function App() {
  return (
    <BrowserRouter basename="/ecommerce-clean">
      <Provider store={store}>
        <div className="App">
          <Router />
        </div>
      </Provider>
    </BrowserRouter>
  );
}

export default App;