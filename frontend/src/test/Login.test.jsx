import { render, screen } from "@testing-library/react";
import Login from "../pages/Login";
import { withRouter } from "./utils";

describe("Login page", () => {
  test("renders login form fields", () => {
    render(withRouter(<Login />));

    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /login/i })
    ).toBeInTheDocument();
  });
});
