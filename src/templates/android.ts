import type { Template } from "./index.ts";
import { GRADLE_WRAPPER_JAR } from "./gradle-wrapper-jar.ts";

// Kotlin + Jetpack Compose, one screen. Versions are a known-good set:
// Gradle 8.10.2, AGP 8.7.2 (needs Gradle 8.9+), Kotlin 2.0.21 with its Compose
// compiler plugin, Compose BOM 2024.10.01. A JDK 17+ runs it (Android Studio's
// bundled JBR works; gradlew.bat finds it on its own).

const GRADLEW_BAT = `@rem Gradle wrapper launcher for Windows.
@if "%DEBUG%"=="" @echo off
setlocal

set APP_HOME=%~dp0
if "%APP_HOME%"=="" set APP_HOME=.
for %%i in ("%APP_HOME%") do set APP_HOME=%%~fi

if defined JAVA_HOME goto javaHome
@rem No JAVA_HOME: try java on PATH, then the JDK that ships with Android Studio.
java -version >NUL 2>&1
if %ERRORLEVEL% equ 0 (
  set JAVA_EXE=java.exe
  goto execute
)
for %%d in ("%ProgramFiles%\\Android\\Android Studio\\jbr" "%LOCALAPPDATA%\\Programs\\Android Studio\\jbr") do (
  if exist "%%~d\\bin\\java.exe" (
    set JAVA_HOME=%%~d
    goto javaHome
  )
)
echo ERROR: no Java found. Install Android Studio, or a JDK 17+ and set JAVA_HOME. 1>&2
goto fail

:javaHome
set JAVA_HOME=%JAVA_HOME:"=%
set JAVA_EXE=%JAVA_HOME%\\bin\\java.exe
if exist "%JAVA_EXE%" goto execute
echo ERROR: JAVA_HOME is set to an invalid folder: %JAVA_HOME% 1>&2
goto fail

:execute
"%JAVA_EXE%" -Xmx64m -Xms64m %JAVA_OPTS% %GRADLE_OPTS% "-Dorg.gradle.appname=gradlew" -classpath "%APP_HOME%\\gradle\\wrapper\\gradle-wrapper.jar" org.gradle.wrapper.GradleWrapperMain %*
if %ERRORLEVEL% equ 0 goto end

:fail
set EXIT_CODE=%ERRORLEVEL%
if %EXIT_CODE% equ 0 set EXIT_CODE=1
exit /b %EXIT_CODE%

:end
endlocal
`;

const GRADLEW = `#!/bin/sh
# Gradle wrapper launcher (a short form of the standard script).
APP_HOME=$(cd "$(dirname "$0")" && pwd -P) || exit 1
if [ -n "$JAVA_HOME" ]; then JAVACMD=$JAVA_HOME/bin/java; else JAVACMD=java; fi
exec "$JAVACMD" -Xmx64m -Xms64m $JAVA_OPTS $GRADLE_OPTS "-Dorg.gradle.appname=gradlew" \\
  -classpath "$APP_HOME/gradle/wrapper/gradle-wrapper.jar" org.gradle.wrapper.GradleWrapperMain "$@"
`;

export const androidCompose: Template = {
  id: "android-compose",
  name: "Android app",
  icon: "📱",
  about: "Kotlin + Jetpack Compose phone app with one screen and a Gradle wrapper (gradlew.bat)",
  folder: "my-app",
  try: ["Turn the counter into a tip calculator", "Add a dark green color theme", "Build it and run it on my phone"],
  files: ({ name, slug, pkg, sdk }) => {
    const id = `com.example.${pkg}`;
    const src = `app/src/main/java/com/example/${pkg}`;
    const files: Record<string, string | Uint8Array> = {
      "MAXX.md": `# ${name} (Android, Kotlin + Jetpack Compose)

Started from Maxx's android-compose template. It builds as it is: change it, don't rewrite it.

- Screen and logic: ${src}/MainActivity.kt (one Compose screen, \`CounterScreen\`)
- App name: app/src/main/res/values/strings.xml
- Dependencies and SDK versions: app/build.gradle.kts (applicationId ${id})
- Build: \`./gradlew assembleDebug\` in Git Bash, \`.\\gradlew.bat assembleDebug\` in PowerShell.
  The APK lands in app/build/outputs/apk/debug/app-debug.apk.
- On a phone: the android_run tool (\`--with android\`) builds, installs and screenshots it.
- The first build downloads Gradle and the libraries, which takes a few minutes.
- If Gradle says the SDK location is not found, set ANDROID_HOME or put sdk.dir in local.properties.
`,
      ".gitignore": "*.iml\n.gradle/\n/local.properties\n.idea/\nbuild/\n/captures\n.kotlin/\n",
      "settings.gradle.kts": `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "${slug}"
include(":app")
`,
      "build.gradle.kts": `plugins {
    id("com.android.application") version "8.7.2" apply false
    id("org.jetbrains.kotlin.android") version "2.0.21" apply false
    id("org.jetbrains.kotlin.plugin.compose") version "2.0.21" apply false
}
`,
      "gradle.properties": `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.nonTransitiveRClass=true
kotlin.code.style=official
`,
      "gradle/wrapper/gradle-wrapper.properties": `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.10.2-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`,
      "gradle/wrapper/gradle-wrapper.jar": Uint8Array.from(atob(GRADLE_WRAPPER_JAR), (c) => c.charCodeAt(0)),
      gradlew: GRADLEW,
      "gradlew.bat": GRADLEW_BAT,
      "app/build.gradle.kts": `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
}

android {
    namespace = "${id}"
    compileSdk = 35

    defaultConfig {
        applicationId = "${id}"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
    kotlinOptions {
        jvmTarget = "11"
    }
    buildFeatures {
        compose = true
    }
}

dependencies {
    implementation(platform("androidx.compose:compose-bom:2024.10.01"))
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.activity:activity-compose:1.9.3")
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    debugImplementation("androidx.compose.ui:ui-tooling")
}
`,
      "app/src/main/AndroidManifest.xml": `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <application
        android:allowBackup="true"
        android:label="@string/app_name"
        android:supportsRtl="true"
        android:theme="@android:style/Theme.Material.Light.NoActionBar">
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
`,
      "app/src/main/res/values/strings.xml": `<resources>
    <string name="app_name">${name}</string>
</resources>
`,
      [`${src}/MainActivity.kt`]: `package ${id}

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            AppTheme {
                Surface(Modifier.fillMaxSize()) {
                    CounterScreen()
                }
            }
        }
    }
}

@Composable
fun AppTheme(content: @Composable () -> Unit) {
    val colors = if (isSystemInDarkTheme()) darkColorScheme() else lightColorScheme()
    MaterialTheme(colorScheme = colors, content = content)
}

@Composable
fun CounterScreen() {
    var count by rememberSaveable { mutableIntStateOf(0) }
    Column(
        modifier = Modifier.fillMaxSize().padding(24.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text("${name}", style = MaterialTheme.typography.headlineMedium)
        Spacer(Modifier.height(16.dp))
        Text("$count", fontSize = 64.sp)
        Spacer(Modifier.height(24.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            OutlinedButton(onClick = { count = 0 }) { Text("Reset") }
            Button(onClick = { count++ }) { Text("Tap") }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun CounterPreview() {
    AppTheme { CounterScreen() }
}
`,
    };
    // Gradle reads the SDK from here when ANDROID_HOME isn't set; ':' and '\\' need escaping.
    if (sdk) files["local.properties"] = `sdk.dir=${sdk.replace(/\\/g, "/").replace(/:/g, "\\:")}\n`;
    return files;
  },
};
