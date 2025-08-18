export const ENDPOINTS = {
  CLI_LOGIN: process.env.AIRSHIP_CONSOLE_URL 
    ? `${process.env.AIRSHIP_CONSOLE_URL}/dashboard/cli/user`
    : "http://localhost:8000/dashboard/cli/user",
  USER: {
    VERIFY: "/auth/user-profile",
  },
  UPLOAD: {
    GENERATE_SIGNED_URL: "/cli/gen-signed-url",
    GENERATE_SIGNED_URL_WITH_CI_TOKEN: "/cli/ci/gen-signed-url",
  },
  PROMOTE: {
    PROMOTE_BUNDLE: "/cli/ci/promote",
    UPDATE_RELEASE: "/cli/ci/update-release",
  },
} as const;
