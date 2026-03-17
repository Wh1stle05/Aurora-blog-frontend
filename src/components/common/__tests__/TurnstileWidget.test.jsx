import { render, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import TurnstileWidget from "../TurnstileWidget";

it("renders a container for turnstile", async () => {
  document.documentElement.setAttribute("data-theme", "light");
  const OriginalObserver = window.MutationObserver;
  window.MutationObserver = class {
    observe() {}
    disconnect() {}
  };
  window.turnstile = {
    render: vi.fn(() => "wid"),
    remove: vi.fn(),
  };

  const { getByTestId } = render(
    <TurnstileWidget siteKey="test" onVerify={() => {}} />
  );

  expect(getByTestId("turnstile-container")).toBeTruthy();
  await waitFor(() =>
    expect(window.turnstile.render).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ theme: "light" })
    )
  );

  delete window.turnstile;
  window.MutationObserver = OriginalObserver;
  document.documentElement.removeAttribute("data-theme");
});
