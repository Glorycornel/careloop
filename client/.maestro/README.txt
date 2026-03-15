CareLoop Mobile E2E

This project uses Maestro for real mobile UI automation.

Prerequisites

- Java installed on the host
- Maestro CLI installed
- An Android emulator or iOS simulator already running
- A build of the app installed on that device
- MAESTRO_APP_ID set to the installed app's package or bundle id

Quick run

From /home/glory/careloop/client:

MAESTRO_APP_ID=com.example.careloop pnpm e2e:mobile:auth

Recommended build targets

- iPhone device: `pnpm build:dev:ios`
- iOS simulator: `pnpm build:dev:ios-sim`
- Android device/emulator: `pnpm build:dev:android`

After installing the dev build, start Metro with:

- `pnpm start:dev-client`

What the flows cover

- guest to sign-up flow
- authenticated return to the tabs shell
- add a prebuilt habit from the library
- logout
- sign back in with the same account

Notes

- The runner script generates a unique email address by default
- The flows avoid the custom habit form so they do not depend on notification permission prompts
