import '@testing-library/jest-dom';
import { vi, beforeEach } from 'vitest';

// Mock fetch for tests
global.fetch = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
});