# Flutter FCM Provisioning App

This Flutter application is the mobile companion for the `pico-fcm-notifier` PlatformIO library. It allows you to securely provision a Raspberry Pi Pico W with WiFi credentials and the necessary Firebase Cloud Messaging (FCM) details over Bluetooth Low Energy (BLE).

Once provisioned, the Pico W can send push notifications to this app via a Firebase Cloud Function.

## Features

- **Scan & Connect:** Scans for and connects to Pico W devices advertising the correct BLE service.
- **Secure Pairing:** Manages the BLE bonding process to ensure a secure, encrypted connection.
- **Credential Provisioning:** Provides a simple UI to enter WiFi SSID, password, and automatically fetches FCM details.
- **One-Tap Setup:** Sends all credentials to the Pico W with a single button press.
- **FCM Integration:** Initializes Firebase and retrieves an FCM token to be sent to the Pico W.
- **Status Feedback:** Clear status messages for scanning, connecting, bonding, and provisioning states.

## Prerequisites

1.  A Raspberry Pi Pico W flashed with the [pico-fcm-notifier](https://github.com/IoT-gamer/pico-fcm-notifier) firmware.
2.  A Google Firebase project.
3.  [Flutter](https://docs.flutter.dev/get-started/install) installed on your development machine.
4.  The [Firebase CLI](https://firebase.google.com/docs/cli#setup_update_cli) installed.

---

## Firebase Setup (Required)

Before you can use the app, you must set up a Firebase project and deploy a Cloud Function.

### Step 1: Create a Firebase Project

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Click **"Add project"** and follow the on-screen instructions to create a new project.

### Step 2: Configure the Flutter App

Your Flutter app needs to connect to your Firebase project. This is done using the FlutterFire CLI.

1.  **Install the CLI:** If you haven't already, install the Firebase CLI:
    either
    ```bash
    npm install -g firebase-tools
    ```
    or
    ```bash
    curl -sL https://firebase.tools | bash
    ```

2.  **Activate FlutterFire CLI:**
    ```bash
    dart pub global activate flutterfire_cli
    ```

3.  **Login to Firebase:**
    ```bash
    firebase login
    ```

4.  **Configure the App:** From the root directory of this Flutter project, run the following command:
    ```bash
    flutterfire configure
    ```
    This command will guide you through selecting your Firebase project and the platforms to configure (e.g., Android, iOS). It will automatically generate the `lib/firebase_options.dart` file.

    > **Note:** The `lib/firebase_options.dart` file is not included in this repository as it contains project-specific identifiers. You **must** generate it yourself.

### Step 3: Set Up and Deploy the Cloud Function

The Pico W needs an HTTP endpoint to send notification requests to. You will deploy this using Firebase Cloud Functions.

1.  **Initialize Firebase in the `functions` directory:**
    - Navigate to the `functions` directory inside this project.
    - If you see a `firebase.json` file, you can skip this step. Otherwise, run:
      ```bash
      firebase init functions
      ```
    - Select your existing Firebase project.
    - Choose **JavaScript** as the language.
    - Decline to use ESLint if asked.
    - Decline to install dependencies with npm for now.

2.  **Review the Function Code:**
    - The code is already provided in `functions/index.js`. It creates an HTTP endpoint called `sendNotificationHttp`.

3.  **Install Dependencies:**
    - Navigate to the `functions` directory and run:
      ```bash
      npm install
      ```

4.  **Deploy the Function:**
    - From the `functions` directory, run:
      ```bash
      firebase deploy --only functions
      ```

5.  **Get the Function URL:**
    - After deployment is complete, the Firebase CLI will output the **Function URL**. It will look something like this:
      `https://sendnotificationhttp-<your-project-hash>-uc.a.run.app`
    - **Copy this URL.**

6.  **Add the Function URL to the App:**
    - Add your Function URL as a constant to `lib/constants.dart. Replace `<YOUR_FUNCTION_URL>` with the actual URL you copied in the previous step.
      ```dart
      // lib/constants.dart

      const String fcmFunctionUrl = 'https://<YOUR_FUNCTION_URL>';
      ```
    - The main application code will import this file to use the URL when provisioning the Pico.

You are now ready to run the Flutter app!

---

## How to Use the App

1.  **Run the App:** Launch the application on your mobile device or emulator.
2.  **Enable Bluetooth:** Make sure Bluetooth is enabled on your phone.
3.  **Scan for Devices:** Tap the "Scan" icon in the app bar. The app will look for a device named `PicoFCM`.
4.  **Select and Connect:** Tap on your Pico device from the list of scan results. Then tap the **"Connect"** button.
5.  **Pair/Bond:** Your phone will prompt you to pair with the Pico. Accept the pairing request. The app will show the bond state as `bonded`.
6.  **Get FCM Details:** Once connected and bonded, tap the **"Get FCM Token"** button. This will populate the FCM URL and Token fields.
7.  **Enter WiFi Credentials:** Fill in your WiFi network's SSID and Password.
8.  **Provision:** Tap the **"Send All Credentials & Connect"** button. The app will send all the details to the Pico. The Pico will then disconnect from BLE and attempt to connect to WiFi.
9.  **Test Notification:** Press the notification button on your Pico device. You should receive a push notification on your phone.

## Troubleshooting

- **Permissions Denied:** Make sure you grant the app Bluetooth and Location permissions when prompted.
- **Can't Find Device:** Ensure your Pico W is powered on and running the `pico-fcm-notifier` firmware. Check that the device name in the firmware matches the one in the app's scan filter (`PicoFCM`).
- **Bonding Fails:** If you have trouble pairing, go to your phone's Bluetooth settings, find the Pico device, and select "Forget" or "Unpair". Then try the connection process again. This is often necessary if you have re-flashed the Pico's firmware, as it erases its stored bonding keys.
- **Notifications Not Received:**
    - Double-check that you correctly copied the Cloud Function URL into `lib/constants.dart`.
    - Use the Arduino IDE's Serial Monitor to check for any error messages from the Pico when it tries to send a notification (e.g., "WiFi not connected", "HTTP error").

## License

This project is released under the MIT License.
