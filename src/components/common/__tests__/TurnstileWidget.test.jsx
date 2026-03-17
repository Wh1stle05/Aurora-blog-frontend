import { render, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import TurnstileWidget from "../TurnstileWidget";

it("renders a container for turnstile", async () => {
  window.turnstile = {
    render: vi.fn(() => "wid"),
    remove: vi.fn(),
  };

  const { getByTestId } = render(
    <TurnstileWidget siteKey="test" onVerify={() => {}} />
  );

  expect(getByTestId("turnstile-container")).toBeTruthy();
  await waitFor(() => expect(window.turnstile.render).toHaveBeenCalled());

  delete window.turnstile;
});
