/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STORM_BASE_URL?: string;
  readonly VITE_STORM_AGENT_PAYMENT: string;
  readonly VITE_STORM_KEY_PAYMENT: string;
  readonly VITE_STORM_AGENT_UNDERWRITING: string;
  readonly VITE_STORM_KEY_UNDERWRITING: string;
  readonly VITE_STORM_AGENT_LAW: string;
  readonly VITE_STORM_KEY_LAW: string;
  readonly VITE_STORM_API_KEY?: string;
  readonly VITE_STORM_AGENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
