import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Home from "../pages/Home";

describe("Home page", () => {
  test("renders landing page content", () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    expect(
      screen.getByText(/Making Cities/i)
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /login \/ register/i })
    ).toBeInTheDocument();
  });
});
