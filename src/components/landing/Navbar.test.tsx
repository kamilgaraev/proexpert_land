import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import Navbar from "./Navbar";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const renderNavigation = () => {
  const listeners = new Set<() => void>();
  const media = {
    matches: false,
    addEventListener: (_event: string, listener: () => void) =>
      listeners.add(listener),
    removeEventListener: (_event: string, listener: () => void) =>
      listeners.delete(listener),
  };
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => media),
  );
  render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>,
  );
  return { media, listeners };
};

describe("Marketing navigation", () => {
  it("closes the mobile menu with Escape and returns focus to its trigger", () => {
    renderNavigation();
    const toggle = screen.getByRole("button", { name: "Открыть меню" });
    const menu = document.getElementById("most-mobile-navigation");
    expect(menu).toHaveAttribute("hidden");
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(menu).not.toHaveAttribute("hidden");
    screen.getByRole("link", { name: /Контакты/ }).focus();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(menu).toHaveAttribute("hidden");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveFocus();
  });

  it("closes the mobile menu when following a navigation link", () => {
    renderNavigation();
    fireEvent.click(screen.getByRole("button", { name: "Открыть меню" }));
    fireEvent.click(screen.getByRole("link", { name: /Контакты/ }));
    expect(document.getElementById("most-mobile-navigation")).toHaveAttribute(
      "hidden",
    );
    expect(
      screen.getByRole("button", { name: "Открыть меню" }),
    ).toHaveAttribute("aria-expanded", "false");
  });

  it("removes viewport listeners when the menu closes", () => {
    const { listeners } = renderNavigation();
    fireEvent.click(screen.getByRole("button", { name: "Открыть меню" }));
    expect(listeners.size).toBe(1);
    fireEvent.click(screen.getByRole("button", { name: "Закрыть меню" }));
    expect(listeners.size).toBe(0);
  });
});
