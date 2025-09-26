import { renderHook } from "@testing-library/react";
import { useProtectedRoute } from "../protected-route";

// Mock next/navigation
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock auth utility
const mockIsAuthenticated = jest.fn();
jest.mock("../../lib/auth", () => ({
  isAuthenticated: mockIsAuthenticated,
}));

describe("useProtectedRoute", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should redirect to login when user is not authenticated", () => {
    mockIsAuthenticated.mockReturnValue(false);

    renderHook(() => useProtectedRoute());

    expect(mockPush).toHaveBeenCalledWith("/login");
  });

  it("should not redirect when user is authenticated", () => {
    mockIsAuthenticated.mockReturnValue(true);

    renderHook(() => useProtectedRoute());

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("should check authentication on mount", () => {
    mockIsAuthenticated.mockReturnValue(true);

    renderHook(() => useProtectedRoute());

    expect(mockIsAuthenticated).toHaveBeenCalled();
  });
});
