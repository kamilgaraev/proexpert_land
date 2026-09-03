import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import BlogTopicFilter from "./BlogTopicFilter";

afterEach(cleanup);

it("exposes the selected topic and closes the disclosure with Escape", () => {
  render(
    <BlogTopicFilter selectedName="Материалы">
      <button>Все статьи</button>
    </BlogTopicFilter>,
  );
  const toggle = screen.getByRole("button", { name: "Темы статей: Материалы" });
  const panel = document.getElementById(toggle.getAttribute("aria-controls")!);
  expect(toggle).toHaveAttribute("aria-expanded", "false");
  expect(panel).toHaveAttribute("data-open", "false");
  fireEvent.click(toggle);
  expect(toggle).toHaveAttribute("aria-expanded", "true");
  const topic = screen.getByRole("button", { name: "Все статьи" });
  topic.focus();
  fireEvent.keyDown(topic, { key: "Escape" });
  expect(panel).toHaveAttribute("data-open", "false");
  expect(toggle).toHaveFocus();
});
