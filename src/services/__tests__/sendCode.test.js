import { vi } from "vitest";
import { sendCode } from "../blogService";

it("sends turnstile_token with request", async () => {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({ ok: true })
  });
  global.fetch = fetchMock;

  await sendCode("a@b.com", "tok");

  expect(fetchMock).toHaveBeenCalledWith(
    expect.stringContaining("/auth/send-code"),
    expect.objectContaining({
      body: JSON.stringify({ email: "a@b.com", turnstile_token: "tok" })
    })
  );
});
