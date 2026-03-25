import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import CommentSection from "./CommentSection.jsx";
import { ToastContext } from "../../../context/ToastContextBase.js";

vi.mock("../../../services/blogService", () => ({
  getComments: vi.fn().mockResolvedValue([]),
  createComment: vi.fn().mockResolvedValue({ ok: true }),
  reactComment: vi.fn().mockResolvedValue({ ok: true }),
  deleteComment: vi.fn().mockResolvedValue({ ok: true }),
}));

vi.mock("../../common/TurnstileWidget.jsx", () => ({
  default: ({ onVerify }) => <button onClick={() => onVerify("turnstile-token")}>verify</button>,
}));

const { createComment } = await import("../../../services/blogService");

function renderSection() {
  localStorage.setItem("user", JSON.stringify({ id: 1, nickname: "Tester" }));
  localStorage.setItem("access_token", "token");
  return render(
    <ToastContext.Provider value={{ success: vi.fn(), error: vi.fn(), info: vi.fn() }}>
      <CommentSection postId={1} />
    </ToastContext.Provider>,
  );
}

test("comment submit opens turnstile modal and posts tokenized payload", async () => {
  renderSection();
  await screen.findByText(/暂无评论/);

  fireEvent.change(screen.getByPlaceholderText(/写下你的评论/), { target: { value: "hello" } });
  fireEvent.click(screen.getByRole("button", { name: /发表评论/ }));

  expect(await screen.findByText(/发表评论前请完成人机验证/)).toBeInTheDocument();
  fireEvent.click(screen.getByText("verify"));

  await waitFor(() => expect(createComment).toHaveBeenCalledWith(1, "hello", null, "turnstile-token"));
});
