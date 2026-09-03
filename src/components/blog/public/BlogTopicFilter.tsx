import { useId, useRef, useState, type ReactNode } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

interface BlogTopicFilterProps {
  selectedName?: string;
  children: ReactNode;
}

const BlogTopicFilter = ({ selectedName, children }: BlogTopicFilterProps) => {
  const [open, setOpen] = useState(false);
  const id = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);

  return (
    <div
      className="most-blog-filter-disclosure"
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          setOpen(false);
          toggleRef.current?.focus();
        }
      }}
    >
      <button
        ref={toggleRef}
        type="button"
        className="most-blog-topic-toggle"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
      >
        <span>Темы статей{selectedName ? `: ${selectedName}` : ""}</span>
        <ChevronDownIcon aria-hidden="true" />
      </button>
      <div
        id={id}
        className="most-blog-topic-filter"
        data-open={open}
        role="group"
        aria-label="Категории статей"
      >
        {children}
      </div>
    </div>
  );
};

export default BlogTopicFilter;
