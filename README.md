# **Running a BitLink Project Locally and Exporting an APK**
BitLink is a simple application that combines URL management and URL shortening systems into one application. Its features are focused on promoting multiple links on various social media platforms and analyzing the feedback obtained, which can be used as a report. Besides being able to be used generally, BitLink can also serve business purposes.

This project is developed as part of the COMP6100001-Software Engineering Project course at Binus University. The project is built using a serverless architecture and leverages the Google Cloud Platform services. However, please note that the project utilizes a trial account, and the trial duration will `expire on August 17th, 2023`. Therefore, the services will be shut down after that date.

This guide provides instructions on how to run a BitLink Project locally using Live Server in VS Code and how to export a debug version of the APK file for Android.

### **Prerequisites**
Before running the BitLink project locally or exporting the APK, make sure you have the following software installed:
- [Node.js](https://nodejs.org/en) - Node.js is required to run the Cordova CLI.
- [Cordova](https://cordova.apache.org/) -  Install the Cordova CLI by running the following command in the terminal or command prompt: ```npm install -g cordova```
- [Emulator](https://www.bluestacks.com/id/index.html) - Install an Android emulator like BlueStacks to run the APK on your computer.

### Running the BitLink Project Locally
To run the BitLink project locally using Live Server in VS Code:
1. Clone this repository to your computer using the following command: ```git clone https://github.com/arifnrsk/BitLink```
2. Open the project directory in VS Code.
3. Open the www directory in VS Code.
4. Install the Live Server extension in VS Code.
5. Right-click the index.html file and select "Open with Live Server" from the context menu.
6. The BitLink project will open in your default web browser, running locally via Live Server.

### Exporting and Running the APK
To export a debug version of the APK file for Android and run it on an emulator:
1. Open a terminal or command prompt and navigate to the BitLink project directory.
2. Run the following command to add the Android platform to the BitLink project: ```cordova platform add android```
3. Build the BitLink Project by running the following command: ```cordova build android```
4. Once the build process is complete, navigate to the following directory within the project: `platforms\app\build\outputs\apk`
5. In the apk directory, you will find the app-debug.apk file. This is the debug version of the APK file that can be installed on an Android emulator.
6. Start the Android emulator of your choice, such as BlueStacks.
7. Drag and drop the app-debug.apk file onto the emulator window.
8. The APK will be installed on the emulator.
9. Locate the app on the emulator and launch it to run the BitLink Project.

Please note that the debug version of the APK is suitable for testing and development purposes. For the release version, which is intended for distribution, you will need to follow the official documentation to generate a signed APK.

That's it! You can now run BitLink Project locally using Live Server in VS Code and export a debug version of the APK file to run on an Android emulator like BlueStacks.





