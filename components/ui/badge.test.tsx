import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "./badge";

describe("Badge", () => {
  it("renders its children", () => {
    render(<Badge>Premium</Badge>);
    expect(screen.getByText("Premium")).toBeInTheDocument();
  });

  it("applies the default variant styling", () => {
    render(<Badge>Default</Badge>);
    expect(screen.getByText("Default")).toHaveClass("bg-primary");
  });

  it("applies the destructive variant styling", () => {
    render(<Badge variant="destructive">Erreur</Badge>);
    expect(screen.getByText("Erreur")).toHaveClass("bg-destructive");
  });

  it("merges a custom className without dropping variant classes", () => {
    render(<Badge className="mt-4">Custom</Badge>);
    const el = screen.getByText("Custom");
    expect(el).toHaveClass("mt-4");
    expect(el).toHaveClass("bg-primary");
  });
});
