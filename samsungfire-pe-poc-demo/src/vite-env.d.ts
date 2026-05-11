/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STORM_BASE_URL?: string;
  readonly VITE_STORM_AGENT_INBOX?: string;
  readonly VITE_STORM_AGENT_EXTRACTOR?: string;
  readonly VITE_STORM_AGENT_NORMALIZER?: string;
  readonly VITE_STORM_KEY_INBOX?: string;
  readonly VITE_STORM_KEY_EXTRACTOR?: string;
  readonly VITE_STORM_KEY_NORMALIZER?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
