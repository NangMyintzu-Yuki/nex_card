import { test, expect } from "@playwright/test";

test.describe("NEX CARD smoke tests", () => {
  test("landing page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/NEX CARD/i);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("login page loads", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("register page loads", async ({ page }) => {
    await page.goto("/register");
    await expect(page.getByRole("button", { name: /create account|sign up|register/i })).toBeVisible();
  });

  test("slug check API returns JSON", async ({ request }) => {
    const res = await request.get("/api/slug/check?slug=test-available-slug");
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body).toHaveProperty("available");
  });

  test("robots.txt is served", async ({ request }) => {
    const res = await request.get("/robots.txt");
    expect(res.ok()).toBeTruthy();
    const text = await res.text();
    expect(text).toContain("Sitemap");
  });

  test("sitemap.xml is served", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.ok()).toBeTruthy();
    const text = await res.text();
    expect(text).toContain("<urlset");
  });

  test("forgot-password page loads", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(page.getByRole("heading", { name: /reset password/i })).toBeVisible();
  });

  test("health endpoint is ok", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.ok()).toBeTruthy();
  });
});
