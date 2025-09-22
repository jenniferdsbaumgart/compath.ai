import React from "react";
import { render, screen, act } from "@testing-library/react";
import { CoinDisplay } from "../coin-display";

describe("CoinDisplay", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should render coins value correctly", () => {
    render(<CoinDisplay coins={100} />);

    expect(screen.getByText("100")).toBeInTheDocument();
    // Check if the icon SVG is present
    expect(document.querySelector("svg")).toBeInTheDocument();
  });

  it("should apply custom className", () => {
    render(<CoinDisplay coins={50} className="custom-class" />);

    const container = screen.getByText("50").closest("div");
    expect(container).toHaveClass("custom-class");
  });

  it("should show animation class when animate is true and coins change", () => {
    const { rerender } = render(<CoinDisplay coins={10} animate={true} />);

    expect(screen.getByText("10")).toBeInTheDocument();

    // Change coins value
    act(() => {
      rerender(<CoinDisplay coins={20} animate={true} />);
    });

    // Fast-forward timers
    act(() => {
      jest.advanceTimersByTime(400);
    });

    // The animation should have started
    const container = screen.getByText("20").closest("div");
    expect(container).toHaveClass("scale-110");
  });

  it("should not animate when animate is false", () => {
    const { rerender } = render(<CoinDisplay coins={5} animate={false} />);

    act(() => {
      rerender(<CoinDisplay coins={15} animate={false} />);
    });

    act(() => {
      jest.advanceTimersByTime(400);
    });

    const container = screen.getByText("15").closest("div");
    expect(container).not.toHaveClass("scale-110");
  });

  it("should update display value after animation delay", () => {
    const { rerender } = render(<CoinDisplay coins={0} />);

    act(() => {
      rerender(<CoinDisplay coins={100} />);
    });

    // Before animation completes
    expect(screen.getByText("0")).toBeInTheDocument();

    // After animation delay
    act(() => {
      jest.advanceTimersByTime(400);
    });
    expect(screen.getByText("100")).toBeInTheDocument();
  });

  it("should have correct default styling", () => {
    render(<CoinDisplay coins={25} />);

    const container = screen.getByText("25").closest("div");
    expect(container).toHaveClass(
      "flex",
      "items-center",
      "justify-center",
      "gap-1.5",
      "bg-amber-100",
      "text-amber-800",
      "px-3",
      "py-1.5",
      "rounded-full",
      "font-medium",
      "border",
      "border-amber-200"
    );
  });
});
