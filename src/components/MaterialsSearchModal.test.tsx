import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, test, expect } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MaterialsSearchModal } from "./MaterialsSearchModal";

// Mock the services
vi.mock("@/services/materials", () => ({
  searchMaterials: vi.fn(),
}));

// Mock the modals
vi.mock("./EditMaterialModal", () => ({
  EditMaterialModal: ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => 
    open ? <div data-testid="edit-modal">Edit Modal</div> : null,
}));

vi.mock("./IncrementUnitsModal", () => ({
  IncrementUnitsModal: ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => 
    open ? <div data-testid="increment-modal">Increment Modal</div> : null,
}));

vi.mock("./ConfirmDeleteModal", () => ({
  ConfirmDeleteModal: ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => 
    open ? <div data-testid="delete-modal">Delete Modal</div> : null,
}));

vi.mock("@/hooks/useDebounce", () => ({
  useDebounce: (value: string) => value,
}));

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={createTestQueryClient()}>
    {children}
  </QueryClientProvider>
);

test("abre modal de consulta ao clicar no trigger", async () => {
  const user = userEvent.setup();
  
  const { container } = render(<MaterialsSearchModal />, { wrapper });
  
  const trigger = container.querySelector('button');
  if (trigger) await user.click(trigger);
  
  expect(container.textContent).toContain("Consultar Materiais");
});

test("mostra mensagem inicial quando não há busca", async () => {
  const user = userEvent.setup();
  
  const { container } = render(<MaterialsSearchModal />, { wrapper });
  
  const trigger = container.querySelector('button');
  if (trigger) await user.click(trigger);
  
  expect(container.textContent).toContain("Digite para buscar materiais");
});