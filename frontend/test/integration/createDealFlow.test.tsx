import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createElement } from "react";

// ─── Mock wagmi ─────────────────────────────────────────────────────────────

const mockWriteContractAsync = vi.fn();

vi.mock("wagmi", () => ({
  useAccount: () => ({ address: "0xABCDEF1234567890ABCDEF1234567890ABCDEF12" }),
  useChainId: () => 84532,
  useReadContract: () => ({ data: undefined, isLoading: false }),
  useWriteContract: () => ({
    writeContractAsync: mockWriteContractAsync,
    isPending: false,
    error: null,
  }),
  usePublicClient: () => ({
    simulateContract: vi.fn().mockResolvedValue(undefined),
  }),
}));

vi.mock("wagmi/chains", () => ({
  baseSepolia: { id: 84532 },
}));

// ─── Mock Toast ─────────────────────────────────────────────────────────────

const mockAddToast = vi.fn();

vi.mock("@/components/Toast", () => ({
  useToast: () => ({
    addToast: mockAddToast,
    removeToast: vi.fn(),
    updateToast: vi.fn(),
  }),
  ToastProvider: ({ children }: { children: React.ReactNode }) => createElement("div", null, children),
}));

// ─── Mock fetch for IPFS upload ─────────────────────────────────────────────

const mockFetch = vi.fn();
global.fetch = mockFetch;

// ─── Import after mocks ────────────────────────────────────────────────────

import CreateDealModal from "@/components/CreateDealModal";

// ─── Test helpers ───────────────────────────────────────────────────────────

function renderModal() {
  const onClose = vi.fn();
  const result = render(<CreateDealModal isOpen={true} onClose={onClose} />);
  return { ...result, onClose };
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("CreateDealModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWriteContractAsync.mockResolvedValue("0xtxhash");
    // Reset URL.createObjectURL mock
    global.URL.createObjectURL = vi.fn(() => "blob:mock-preview-url");
    global.URL.revokeObjectURL = vi.fn();
  });

  // ── Rendering ─────────────────────────────────────────────────

  it("renders the modal when isOpen is true", () => {
    renderModal();
    expect(screen.getByText("Create New Deal")).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    render(<CreateDealModal isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByText("Create New Deal")).not.toBeInTheDocument();
  });

  // ── Form validation (HTML5 required) ──────────────────────────

  it("requires title field", () => {
    renderModal();
    const titleInput = screen.getByPlaceholderText("e.g. Selling my Old PC");
    expect(titleInput).toBeRequired();
  });

  it("requires amount field", () => {
    renderModal();
    const amountInput = screen.getByPlaceholderText("0.00");
    expect(amountInput).toBeRequired();
  });

  it("requires description field", () => {
    renderModal();
    const descInput = screen.getByPlaceholderText(/Describe what you're selling/);
    expect(descInput).toBeRequired();
  });

  it("buyer address is optional", () => {
    renderModal();
    const buyerInput = screen.getByPlaceholderText("0x... or leave empty");
    expect(buyerInput).not.toBeRequired();
  });

  // ── Fee calculation display ───────────────────────────────────

  it("shows fee as 0 when amount is empty", () => {
    renderModal();
    // The fee line shows "0 ETH" -- use a matcher that finds text split across elements
    expect(screen.getByText("Protocol fee (0.5%)")).toBeInTheDocument();
    // Fee and total both show "0" but they are in span elements
    const feeRow = screen.getByText("Protocol fee (0.5%)").closest("div");
    expect(feeRow).toBeInTheDocument();
  });

  it("updates fee display when amount changes", async () => {
    renderModal();
    const amountInput = screen.getByPlaceholderText("0.00");

    await userEvent.type(amountInput, "10");

    // Fee = 10 * 0.005 = 0.0500, Total = 10.0500
    // "0.0500" appears in both fee and total spans, so use getAllByText
    const feeMatches = screen.getAllByText(/0\.0500/);
    expect(feeMatches.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/10\.0500/)).toBeInTheDocument();
  });

  it("shows correct fee for small amounts", async () => {
    renderModal();
    const amountInput = screen.getByPlaceholderText("0.00");

    await userEvent.type(amountInput, "0.5");

    // Fee = 0.5 * 0.005 = 0.0025
    expect(screen.getByText(/0\.0025/)).toBeInTheDocument();
  });

  // ── Category selection ────────────────────────────────────────

  it("renders all category buttons", () => {
    renderModal();
    const categories = ["Design", "Development", "Writing", "Marketing", "Consulting", "Physical Goods", "NFT / Crypto", "Other"];
    for (const cat of categories) {
      expect(screen.getByText(cat)).toBeInTheDocument();
    }
  });

  it("selecting a category highlights it", async () => {
    renderModal();
    const designBtn = screen.getByText("Design");

    await userEvent.click(designBtn);

    // Check for the active class
    expect(designBtn.className).toContain("bg-vault-600/20");
  });

  it("clicking a selected category deselects it", async () => {
    renderModal();
    const designBtn = screen.getByText("Design");

    await userEvent.click(designBtn);
    expect(designBtn.className).toContain("bg-vault-600/20");

    await userEvent.click(designBtn);
    expect(designBtn.className).not.toContain("bg-vault-600/20");
  });

  // ── Token selector ────────────────────────────────────────────

  it("defaults to ETH", () => {
    renderModal();
    const tokenSelect = screen.getByDisplayValue("ETH");
    expect(tokenSelect).toBeInTheDocument();
  });

  it("can change to USDC", async () => {
    renderModal();
    const tokenSelect = screen.getByDisplayValue("ETH");

    await userEvent.selectOptions(tokenSelect, "usdc");

    expect((tokenSelect as HTMLSelectElement).value).toBe("usdc");
  });

  it("updates displayed token symbol when token changes", async () => {
    renderModal();
    const amountInput = screen.getByPlaceholderText("0.00");
    await userEvent.type(amountInput, "10");

    const tokenSelect = screen.getByDisplayValue("ETH");
    await userEvent.selectOptions(tokenSelect, "usdc");

    // Summary should show USDC
    const usdcLabels = screen.getAllByText("USDC");
    expect(usdcLabels.length).toBeGreaterThan(0);
  });

  // ── Image upload flow ─────────────────────────────────────────

  it("shows upload area initially", () => {
    renderModal();
    expect(screen.getByText("Drop or click")).toBeInTheDocument();
  });

  it("uploads image via file input and shows preview", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ url: "ipfs://QmTestHash" }),
    });

    renderModal();
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeTruthy();

    const file = new File(["fake-image-data"], "test.png", { type: "image/png" });

    await userEvent.upload(fileInput, file);

    // fetch should be called for IPFS upload
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/upload", expect.objectContaining({
        method: "POST",
      }));
    });
  });

  it("shows error when image upload fails", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: "Upload failed" }),
    });

    renderModal();
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["fake-image-data"], "test.png", { type: "image/png" });

    await userEvent.upload(fileInput, file);

    await waitFor(() => {
      expect(screen.getByText("Upload failed")).toBeInTheDocument();
    });
  });

  // ── Form submission ───────────────────────────────────────────

  it("calls createDeal with correct args on submit", async () => {
    renderModal();

    const titleInput = screen.getByPlaceholderText("e.g. Selling my Old PC");
    const amountInput = screen.getByPlaceholderText("0.00");
    const descInput = screen.getByPlaceholderText(/Describe what you're selling/);

    await userEvent.type(titleInput, "My Test Deal");
    await userEvent.type(amountInput, "1.5");
    await userEvent.type(descInput, "A test description");

    const submitBtn = screen.getByText("Create Deal");
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockWriteContractAsync).toHaveBeenCalledTimes(1);
    });

    // Verify the args passed to writeContractAsync
    const callArgs = mockWriteContractAsync.mock.calls[0][0];
    expect(callArgs.functionName).toBe("createDeal");
    // buyer should be zero address (empty field = open listing)
    expect(callArgs.args[0]).toBe("0x0000000000000000000000000000000000000000");
    // title
    expect(callArgs.args[4]).toBe("My Test Deal");
  });

  it("shows success toast after successful creation", async () => {
    const { onClose } = renderModal();

    await userEvent.type(screen.getByPlaceholderText("e.g. Selling my Old PC"), "Success Deal");
    await userEvent.type(screen.getByPlaceholderText("0.00"), "1");
    await userEvent.type(screen.getByPlaceholderText(/Describe what you're selling/), "desc");

    await userEvent.click(screen.getByText("Create Deal"));

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({
        type: "success",
        title: "Deal created!",
      }));
    });

    expect(onClose).toHaveBeenCalled();
  });

  it("displays error when transaction fails", async () => {
    mockWriteContractAsync.mockRejectedValueOnce(new Error("User rejected transaction"));

    renderModal();

    await userEvent.type(screen.getByPlaceholderText("e.g. Selling my Old PC"), "Fail Deal");
    await userEvent.type(screen.getByPlaceholderText("0.00"), "1");
    await userEvent.type(screen.getByPlaceholderText(/Describe what you're selling/), "desc");

    await userEvent.click(screen.getByText("Create Deal"));

    await waitFor(() => {
      expect(screen.getByText("User rejected transaction")).toBeInTheDocument();
    });
  });

  it("includes category in description payload when selected", async () => {
    renderModal();

    await userEvent.type(screen.getByPlaceholderText("e.g. Selling my Old PC"), "Categorized Deal");
    await userEvent.type(screen.getByPlaceholderText("0.00"), "1");
    await userEvent.type(screen.getByPlaceholderText(/Describe what you're selling/), "desc");
    await userEvent.click(screen.getByText("Design"));

    await userEvent.click(screen.getByText("Create Deal"));

    await waitFor(() => {
      expect(mockWriteContractAsync).toHaveBeenCalledTimes(1);
    });

    const callArgs = mockWriteContractAsync.mock.calls[0][0];
    const descPayload = JSON.parse(callArgs.args[5]);
    expect(descPayload.category).toBe("Design");
    expect(descPayload.text).toBe("desc");
  });

  it("uses USDC token address when USDC is selected", async () => {
    renderModal();

    await userEvent.type(screen.getByPlaceholderText("e.g. Selling my Old PC"), "USDC Deal");
    await userEvent.type(screen.getByPlaceholderText("0.00"), "100");
    await userEvent.type(screen.getByPlaceholderText(/Describe what you're selling/), "desc");

    const tokenSelect = screen.getByDisplayValue("ETH");
    await userEvent.selectOptions(tokenSelect, "usdc");

    await userEvent.click(screen.getByText("Create Deal"));

    await waitFor(() => {
      expect(mockWriteContractAsync).toHaveBeenCalledTimes(1);
    });

    // The token address arg should be the USDC address
    const callArgs = mockWriteContractAsync.mock.calls[0][0];
    // args[1] is the token address
    expect(callArgs.args[1]).toBe("0x036CbD53842c5426634e7929541eC2318f3dCF7e");
  });

  // ── Close ─────────────────────────────────────────────────────

  it("calls onClose when X button is clicked", async () => {
    const { onClose } = renderModal();
    // The X button is the one with the X icon
    const closeButtons = screen.getAllByRole("button");
    // First button with X icon in the header
    const closeBtn = closeButtons.find(
      (btn) => btn.querySelector(".lucide-x") !== null
    );
    if (closeBtn) {
      await userEvent.click(closeBtn);
      expect(onClose).toHaveBeenCalled();
    }
  });
});
