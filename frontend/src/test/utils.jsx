import { BrowserRouter } from "react-router-dom";

export function withRouter(ui) {
  return <BrowserRouter>{ui}</BrowserRouter>;
}
