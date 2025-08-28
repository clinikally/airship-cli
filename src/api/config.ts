export const CONFIG = {
  API: {
    BASE_URL: process.env.AIRSHIP_API_BASE_URL 
      ? `${process.env.AIRSHIP_API_BASE_URL}/api/v1`
      : "https://airship-api.clinikally.shop/api/v1",
  },
  UI: {
    BASE_URL: process.env.AIRSHIP_UI_BASE_URL 
      ? process.env.AIRSHIP_UI_BASE_URL
      : "https://airship.clinikally.shop",
  },
  BUNDLE_EXTENSION: ".airshipsigned",
} as const;
