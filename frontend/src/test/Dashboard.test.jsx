import { render, screen } from "@testing-library/react";
import Dashboard from "../pages/Dashboard";
import { withRouter } from "./utils";

describe("Dashboard", () => {
  test("shows loading state initially", () => {
    localStorage.setItem("token", "fake-token");
    localStorage.setItem("role", "Citizen");

    render(withRouter(<Dashboard />));

    expect(
      screen.getByText(/Loading Dashboard/i)
    ).toBeInTheDocument();
  });
});
