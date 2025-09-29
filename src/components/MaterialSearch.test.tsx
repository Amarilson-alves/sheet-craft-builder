/**
 * @vitest-environment happy-dom
 */
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import MaterialSearch from "./MaterialSearch";

const mockMaterials = [
  { SKU: "AS-01", Descrição: "ASPARAGUS", Unidade: "kg", Qtdd_Depósito: 10, Categoria: "Interno" as const },
  { SKU: "AS-02", Descrição: "ASTRONAUTA", Unidade: "un", Qtdd_Depósito: 5, Categoria: "Externo" as const },
  { SKU: "BT-01", Descrição: "BATATA", Unidade: "kg", Qtdd_Depósito: 0, Categoria: "Interno" as const },
];

describe("MaterialSearch", () => {
  it("renders search input", () => {
    const onSelect = vi.fn();
    const { container } = render(<MaterialSearch items={mockMaterials} onSelect={onSelect} />);
    
    const input = container.querySelector('input[role="combobox"]');
    expect(input).toBeTruthy();
  });

  it("renders filter buttons", () => {
    const onSelect = vi.fn();
    const { container } = render(<MaterialSearch items={mockMaterials} onSelect={onSelect} />);
    
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThan(3);
  });
});