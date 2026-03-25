import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";

import Contact from "./Contact.jsx";
import { ToastContext } from "../../context/ToastContextBase.js";


function renderContact(toastValue) {
  return render(
    <ToastContext.Provider value={toastValue}>
      <Contact />
    </ToastContext.Provider>
  );
}


vi.mock("../../components/common/TurnstileWidget.jsx", () => ({
  default: ({ onVerify }) => <button onClick={() => onVerify("turnstile-token")}>verify</button>,
}));

test("submits contact form through turnstile modal and shows success feedback", async () => {
  const success = vi.fn();
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ ok: true }),
  });

  renderContact({ success, error: vi.fn(), info: vi.fn() });

  fireEvent.change(screen.getByLabelText("姓名"), { target: { value: "Alice" } });
  fireEvent.change(screen.getByLabelText("邮箱"), { target: { value: "alice@example.com" } });
  fireEvent.change(screen.getByLabelText("消息"), { target: { value: "Hello" } });
  fireEvent.click(screen.getByRole("button", { name: /发送消息/i }));

  expect(await screen.findByText(/发送前请完成人机验证/)).toBeInTheDocument();
  fireEvent.click(screen.getByText("verify"));

  await waitFor(() => expect(global.fetch).toHaveBeenCalled());
  expect(global.fetch).toHaveBeenCalledWith(
    "/api/contact",
    expect.objectContaining({
      method: "POST",
      body: JSON.stringify({
        nickname: "Alice",
        email: "alice@example.com",
        content: "Hello",
        turnstile_token: "turnstile-token",
      }),
    })
  );
  await waitFor(() => expect(success).toHaveBeenCalled());
});
