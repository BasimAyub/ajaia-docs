import path from "node:path";
import { expect, test } from "@playwright/test";

async function createDocument(page: import("@playwright/test").Page, title: string) {
  await page.goto("/");
  await page.getByPlaceholder("Name a new document").fill(title);
  await page.getByRole("button", { name: "New document" }).click();
  await expect(page).toHaveURL(/\/documents\//);
  await expect(page.getByRole("textbox", { name: "Document title" })).toHaveValue(title);
}

async function expectSaved(page: import("@playwright/test").Page) {
  await expect(page.getByText(/^Saved at/)).toBeVisible({ timeout: 12_000 });
}

test("persists a newly created document after reload", async ({ page }) => {
  const title = `Persistence note ${Date.now()}`;
  const content = `Persisted reviewer draft ${Date.now()}`;

  await createDocument(page, title);
  await page.getByLabel("Document body").click();
  await page.keyboard.type(content);
  await expectSaved(page);

  await page.reload();
  await expect(page.getByText(content)).toBeVisible();
});

test("shared viewers can read but cannot edit", async ({ page }) => {
  await page.goto("/documents/seed-q3-strategy");
  await page.getByLabel("Add or update access").selectOption("maya");
  await page.getByLabel("Access level").selectOption("VIEWER");
  await page.getByRole("button", { name: "Share document" }).click();
  await expect(page.getByText("Sharing updated.")).toBeVisible();

  await page.getByRole("link", { name: "Dashboard" }).click();
  await page.getByLabel("Switch demo identity").selectOption("maya");
  await expect(page.getByText("maya@ajaia.test", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /Q3 Product Strategy/ })).toBeVisible();

  await page.getByRole("link", { name: /Q3 Product Strategy/ }).click();
  await expect(page).toHaveURL(/\/documents\/seed-q3-strategy$/);
  await expect(page.getByText("Viewing as Maya Singh", { exact: true })).toBeVisible();
  await expect(page.getByText("Viewer", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Document body")).toHaveAttribute("contenteditable", "false");
  await expect(page.getByRole("button", { name: "Save" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Bold" })).toBeDisabled();
});

test("shared editors can save changes that survive reload", async ({ page }) => {
  const content = `Editor persistence ${Date.now()}`;

  await page.goto("/documents/seed-research-synthesis");
  await expect(page.getByText("Editor", { exact: true })).toBeVisible();
  await page.getByLabel("Document body").click();
  await page.keyboard.type(content);
  await expectSaved(page);

  await page.reload();
  await expect(page.getByText(content)).toBeVisible();
});

test("imports Markdown into an editable document and rejects unsupported files", async ({ page }) => {
  await page.goto("/");
  await page.locator('input[type="file"]').setInputFiles(path.join(process.cwd(), "tests/fixtures/reviewer-import.md"));
  await page.getByRole("button", { name: "Import", exact: true }).click();
  await expect(page).toHaveURL(/\/documents\//);
  await expect(page.getByRole("textbox", { name: "Document title" })).toHaveValue("reviewer-import");
  await expect(page.getByText("Imported decision context")).toBeVisible();

  await page.getByLabel("Document body").click();
  await page.keyboard.type(" Imported and edited.");
  await expectSaved(page);

  await page.goto("/");
  await page.locator('input[type="file"]').setInputFiles({
    name: "unsupported.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("not a supported import")
  });
  await page.getByRole("button", { name: "Import", exact: true }).click();
  await expect(page.getByText("Only .txt and .md imports are supported in this submission.")).toBeVisible();
});
