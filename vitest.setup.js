import '@testing-library/jest-dom';

if (!('IntersectionObserver' in globalThis)) {
  class IntersectionObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  globalThis.IntersectionObserver = IntersectionObserverMock;
}
