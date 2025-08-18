export const CONFIG = {
  API: {
    BASE_URL: process.env.AIRSHIP_API_BASE_URL 
      ? `${process.env.AIRSHIP_API_BASE_URL}/api/v1`
      : "http://localhost:8000/api/v1",
  },
  BUNDLE_EXTENSION: ".airshipsigned",
} as const;
