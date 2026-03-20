/// <reference types="vite/client" />

interface Window {
  gtag: (...args: any[]) => void;
  dataLayer: any[];
}

declare namespace JSX {
  interface IntrinsicElements {
    'appkit-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'appkit-network-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  }
}
