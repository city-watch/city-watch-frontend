import { render, screen, waitFor } from "@testing-library/react";
import Leaderboard from "../pages/Leaderboard";
import { withRouter } from "./utils";

describe("Leaderboard", () => {
  test("renders leaderboard data from API", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        leaderboard: [
          { user_id: 1, name: "Alice", total_points: 120 },
          { user_id: 2, name: "Bob", total_points: 90 },
        ],
      }),
    });

    localStorage.setItem("token", "fake-token");

    render(withRouter(<Leaderboard />));

    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
      expect(screen.getByText("Bob")).toBeInTheDocument();
    });
  });
});
