# **Running a BitLink Project Locally and Exporting an APK**
BitLink is a simple application that combines URL management and URL shortening systems into one application. Its features are focused on promoting multiple links on various social media platforms and analyzing the feedback obtained, which can be used as a report. Besides being able to be used generally, BitLink can also serve business purposes.

This project is developed as part of the COMP6100001-Software Engineering Project course at Binus University. The project is built using a serverless architecture and leverages the Google Cloud Platform services. However, please note that the project utilizes a trial account, and the trial duration will `expire on August 17th, 2023`. Therefore, the services will be shut down after that date.

This guide provides instructions on how to run a BitLink Project locally using Live Server in VS Code and how to export a debug version of the APK file for Android.

### **Prerequisites**
Before running the BitLink project locally or exporting the APK, make sure you follow these steps:
- Create the BitLink Project folder.
- [Node.js](https://nodejs.org/en) - Node.js is required to run the Cordova CLI.
- [Emulator](https://www.bluestacks.com/id/index.html) - Install an Android emulator like BlueStacks to run the APK on your computer.
- [Cordova](https://cordova.apache.org/) - Inside the BitLink Project folder, install the Cordova CLI by running the following command in the terminal or command prompt: ```npm install -g cordova```
- Next, create the Cordova project. ```cordova create BitLink com.bitlinkApp BitLink``` If you change ```com.bitlinkApp``` don't forget to change ```widget id="com.bitlinkApp"``` on config.xml
- Clone this repository to your computer in any directories ```git clone https://github.com/arifnrsk/BitLink``` *we suggest in a different directory from the BitLink project folder*
- Copy the contents of the "www" folder and config.xml file from the cloned repository into the Cordova Project folder that you created before. Replace any existing files if prompted.

### Running the BitLink Project Locally
To run the BitLink project locally using Live Server in VS Code:
1. Open the Cordova project directory using the VS Code created earlier.
2. Install the Live Server extension in VS Code.
3. Open the www directory.
4. Right-click the index.html file and select "Open with Live Server" from the context menu.
5. The BitLink project will open in your default web browser, running locally via Live Server.

### Exporting and Running the APK
To export a debug version of the APK file for Android and run it on an emulator:
1. Open the Cordova project directory using the VS Code created earlier, or open a terminal or command prompt and navigate to the Cordova project directory.
3. Run the following command to add the Android platform to the BitLink project: ```cordova platform add android```
4. Build the BitLink Project by running the following command: ```cordova build android```
5. Once the build process is complete, navigate to the following directory within the project: `platforms\app\build\outputs\apk`
6. In the apk directory, you will find the app-debug.apk file. This is the debug version of the APK file that can be installed on an Android emulator.
7. Start the Android emulator of your choice, such as BlueStacks.
8. Drag and drop the app-debug.apk file onto the emulator window.
9. The APK will be installed on the emulator.
10. Locate the app on the emulator and launch it to run the BitLink Project.

Please note that the debug version of the APK is suitable for testing and development purposes. For the release version, which is intended for distribution, you will need to follow the official documentation to generate a signed APK.

That's it! You can now run BitLink Project locally using Live Server in VS Code and export a debug version of the APK file to run on an Android emulator like BlueStacks.





