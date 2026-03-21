# 🎨 TermuxDroid UI Development Guide

Panduan lengkap pengembangan User Interface (UI) di TermuxDroid Framework.

---

## 📋 Daftar Isi

- [Arsitektur UI](#arsitektur-ui)
- [Struktur File UI](#struktur-file-ui)
- [Komponen UI](#komponen-ui)
- [Layout XML](#layout-xml)
- [Material Design](#material-design)
- [Event Handling](#event-handling)
- [Animasi](#animasi)
- [Resources](#resources)
- [Activity Lifecycle](#activity-lifecycle)
- [Tips Pengembangan](#tips-pengembangan)
- [Contoh Kustomisasi](#contoh-kustomisasi)

---

## 🏗️ Arsitektur UI

TermuxDroid menggunakan arsitektur UI Android standar dengan pemisahan yang jelas antara:

```
┌─────────────────────────────────────────┐
│           MainActivity.java             │
│         (Logic & Event Handler)         │
└─────────────────┬───────────────────────┘
                  │ findViewById()
                  ▼
┌─────────────────────────────────────────┐
│         activity_main.xml               │
│           (UI Layout)                   │
└─────────────────┬───────────────────────┘
                  │ Uses
                  ▼
┌─────────────────────────────────────────┐
│      res/values/ (colors, strings)      │
│      res/drawable/ (shapes, gradients)  │
│         (Resources & Styling)           │
└─────────────────────────────────────────┘
```

---

## 📁 Struktur File UI

```
app/src/main/
├── java/com/myapp/
│   ├── MainActivity.java      # Entry point UI logic
│   └── MyApplication.java     # Global app initialization
│
└── res/
    ├── layout/
    │   └── activity_main.xml  # Main UI layout
    │
    ├── values/
    │   ├── colors.xml         # Color definitions
    │   ├── strings.xml        # String resources
    │   └── themes.xml         # App theme
    │
    └── drawable/
        ├── gradient_header.xml    # Gradient background
        ├── info_background.xml    # Card background
        └── ic_launcher_background.xml
```

---

## 🧩 Komponen UI

### Komponen Layout

| Komponen | Deskripsi | Contoh Penggunaan |
|----------|-----------|-------------------|
| `LinearLayout` | Layout vertikal/horizontal | Container utama |
| `NestedScrollView` | Scrollable container | Untuk konten panjang |
| `MaterialCardView` | Card dengan shadow | Content cards |
| `ConstraintLayout` | Flexible positioning | Complex layouts |

### Komponen Widget

| Widget | Deskripsi | Contoh Penggunaan |
|--------|-----------|-------------------|
| `TextView` | Tampilan teks | Label, judul, counter |
| `MaterialButton` | Button Material Design | Tombol aksi |
| `EditText` | Input field | Form input |
| `ImageView` | Gambar | Icon, foto |

---

## 📐 Layout XML

### Struktur Dasar

```xml
<?xml version="1.0" encoding="utf-8"?>
<androidx.core.widget.NestedScrollView
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="vertical">

        <!-- UI Components Here -->

    </LinearLayout>
</androidx.core.widget.NestedScrollView>
```

### Atribut Layout Penting

```xml
<!-- Ukuran -->
android:layout_width="match_parent"   <!-- Lebar penuh parent -->
android:layout_width="wrap_content"   <!-- Sesuai konten -->
android:layout_height="match_parent"  <!-- Tinggi penuh parent -->

<!-- Padding & Margin -->
android:padding="16dp"                <!-- Jarak dalam -->
android:layout_margin="16dp"          <!-- Jarak luar -->

<!-- Gravity & Alignment -->
android:gravity="center"              <!-- Posisi konten -->
android:layout_gravity="center"       <!-- Posisi view -->

<!-- Appearance -->
android:background="@color/primary"   <!-- Background -->
android:elevation="4dp"               <!-- Shadow height -->
android:alpha="0.8"                   <!-- Transparency -->
```

### Contoh: Card dengan Material Design

```xml
<com.google.android.material.card.MaterialCardView
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:layout_margin="16dp"
    app:cardBackgroundColor="@color/white"
    app:cardCornerRadius="24dp"
    app:cardElevation="0dp"
    app:strokeColor="@color/gray"
    app:strokeWidth="1dp">

    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="vertical"
        android:padding="24dp">

        <!-- Content Here -->

    </LinearLayout>
</com.google.android.material.card.MaterialCardView>
```

---

## 🎨 Material Design

### Theme Configuration

File: `res/values/themes.xml`

```xml
<style name="Theme.MyApp" parent="Theme.MaterialComponents.DayNight.DarkActionBar">
    <!-- Primary brand color -->
    <item name="colorPrimary">@color/primary</item>
    <item name="colorPrimaryVariant">@color/primary_dark</item>
    <item name="colorOnPrimary">@color/white</item>

    <!-- Secondary brand color -->
    <item name="colorSecondary">@color/accent</item>
    <item name="colorSecondaryVariant">@color/accent_variant</item>
    <item name="colorOnSecondary">@color/white</item>

    <!-- Status bar color -->
    <item name="android:statusBarColor">?attr/colorPrimaryVariant</item>
</style>
```

### Color Palette

File: `res/values/colors.xml`

```xml
<!-- Primary colors -->
<color name="primary">#FF2196F3</color>
<color name="primary_dark">#FF1976D2</color>
<color name="primary_light">#FF64B5F6</color>

<!-- Accent colors -->
<color name="accent">#FF00BCD4</color>
<color name="accent_variant">#FF26C6DA</color>

<!-- Background colors -->
<color name="background">#FFF8FAFE</color>
<color name="surface">#FFFFFFFF</color>
<color name="card_background">#FFFFFFFF</color>

<!-- Text colors -->
<color name="on_primary">#FFFFFFFF</color>
<color name="on_surface">#FF1E293B</color>
<color name="on_surface_variant">#FF64748B</color>
```

### Material Button Styles

```xml
<!-- Filled Button -->
<com.google.android.material.button.MaterialButton
    android:layout_width="match_parent"
    android:layout_height="56dp"
    android:text="Primary Button"
    app:cornerRadius="16dp"
    app:backgroundTint="@color/primary" />

<!-- Outlined Button -->
<com.google.android.material.button.MaterialButton
    android:layout_width="match_parent"
    android:layout_height="56dp"
    android:text="Outlined Button"
    app:cornerRadius="16dp"
    style="@style/Widget.MaterialComponents.Button.OutlinedButton"
    app:strokeColor="@color/primary"
    app:strokeWidth="2dp" />

<!-- Button with Icon -->
<com.google.android.material.button.MaterialButton
    android:layout_width="match_parent"
    android:layout_height="56dp"
    android:text="Add Item"
    app:icon="@android:drawable/ic_menu_add"
    app:iconGravity="textStart"
    app:cornerRadius="16dp" />
```

---

## ⚡ Event Handling

### Click Listener

```java
// Setup button click
btnIncrement.setOnClickListener(v -> {
    counter++;
    updateCounter();
    animateCounter();
    Log.d(TAG, "Counter incremented: " + counter);
});
```

### Multiple Events

```java
// Reset button dengan animasi
btnReset.setOnClickListener(v -> {
    counter = 0;
    updateCounter();
    
    // Animasi scale
    tvCounter.setScaleX(1.5f);
    tvCounter.setScaleY(1.5f);
    tvCounter.animate()
        .scaleX(1f)
        .scaleY(1f)
        .setDuration(300)
        .start();
    
    Toast.makeText(this, "✓ Counter diulang", Toast.LENGTH_SHORT).show();
});
```

### Long Click

```java
btnShowInfo.setOnLongClickListener(v -> {
    Toast.makeText(this, "Long pressed!", Toast.LENGTH_SHORT).show();
    return true; // Event consumed
});
```

---

## 🎬 Animasi

### Property Animation

```java
// Scale animation
tvCounter.animate()
    .scaleX(1.2f)
    .scaleY(1.2f)
    .setDuration(100)
    .withEndAction(() -> tvCounter.animate()
        .scaleX(1f)
        .scaleY(1f)
        .setDuration(100)
        .start())
    .start();
```

### Alpha Animation (Fade)

```java
// Fade in
tvInfo.setAlpha(0f);
tvInfo.animate()
    .alpha(1f)
    .setDuration(300)
    .start();

// Fade out
tvInfo.animate()
    .alpha(0f)
    .setDuration(300)
    .start();
```

### Translation Animation (Move)

```java
// Move view
view.animate()
    .translationX(100f)
    .translationY(50f)
    .setDuration(500)
    .start();
```

### Rotation Animation

```java
// Rotate view
view.animate()
    .rotation(360f)
    .setDuration(1000)
    .start();
```

### Animation Set (Chaining)

```java
// Multiple animations in sequence
view.animate()
    .scaleX(1.2f)
    .scaleY(1.2f)
    .rotation(10f)
    .setDuration(200)
    .withEndAction(() -> {
        // Second animation
        view.animate()
            .scaleX(1f)
            .scaleY(1f)
            .rotation(0f)
            .setDuration(200)
            .start();
    })
    .start();
```

---

## 📦 Resources

### String Resources

File: `res/values/strings.xml`

```xml
<resources>
    <string name="app_name">TermuxDroid</string>
    <string name="counter_label">TAP COUNT</string>
    <string name="increment">+ Tambah</string>
    <string name="decrement">- Kurangi</string>
    <string name="reset">↺ Ulangi</string>
    <string name="show_info">Lihat Info Device</string>
</resources>
```

**Usage in Java:**
```java
textView.setText(R.string.app_name);
```

**Usage in XML:**
```xml
<TextView
    android:text="@string/app_name"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content" />
```

### Drawable Resources

#### Gradient Background

File: `res/drawable/gradient_header.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android">
    <gradient
        android:angle="135"
        android:startColor="@color/gradient_start"
        android:centerColor="@color/gradient_center"
        android:endColor="@color/gradient_end"
        android:type="linear" />
    <corners
        android:bottomLeftRadius="32dp"
        android:bottomRightRadius="32dp" />
</shape>
```

#### Rounded Rectangle

File: `res/drawable/info_background.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android">
    <solid android:color="@color/surface_variant" />
    <corners android:radius="16dp" />
    <stroke
        android:width="1dp"
        android:color="@color/card_stroke" />
</shape>
```

#### Circle Shape

```xml
<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android"
    android:shape="oval">
    <solid android:color="@color/primary" />
    <size
        android:width="100dp"
        android:height="100dp" />
</shape>
```

---

## 🔄 Activity Lifecycle

### Lifecycle Methods

```java
public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        // Inisialisasi UI, setup views
        Log.d(TAG, "onCreate");
    }

    @Override
    protected void onStart() {
        super.onStart();
        // Activity visible to user
        Log.d(TAG, "onStart");
    }

    @Override
    protected void onResume() {
        super.onResume();
        // Activity interactive
        Log.d(TAG, "onResume");
    }

    @Override
    protected void onPause() {
        super.onPause();
        // Activity partially/fully obscured
        Log.d(TAG, "onPause");
    }

    @Override
    protected void onStop() {
        super.onStop();
        // Activity not visible
        Log.d(TAG, "onStop");
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        // Activity finishing
        Log.d(TAG, "onDestroy");
    }

    @Override
    protected void onRestart() {
        super.onRestart();
        // Activity restarting after stop
        Log.d(TAG, "onRestart");
    }
}
```

### Lifecycle Flow

```
┌─────────┐
│ onCreate│ ← App dimulai
└────┬────┘
     │
     ▼
┌─────────┐
│ onStart │ ← App visible
└────┬────┘
     │
     ▼
┌─────────┐
│ onResume│ ← App interactive
└────┬────┘
     │
     ▼
  [User Interaction]
     │
     ▼
┌─────────┐
│ onPause │ ← User leaving
└────┬────┘
     │
     ▼
┌─────────┐
│  onStop │ ← App hidden
└────┬────┘
     │
     ├──────────────┐
     ▼              ▼
┌─────────┐    ┌─────────┐
│onRestart│    │onDestroy│
└────┬────┘    └─────────┘
     │
     ▼
  [Loop back to onStart]
```

---

## 💡 Tips Pengembangan

### 1. Gunakan Dev Mode

```bash
./scripts/dev.sh
```

- Auto-rebuild saat file berubah
- Auto-install ke device
- Hot reload-like experience

### 2. Preview Layout

Gunakan Android Studio untuk preview XML layout jika tersedia, atau test langsung di device.

### 3. Consistent Spacing

```xml
<!-- Gunakan kelipatan 8dp -->
android:padding="8dp"
android:padding="16dp"
android:padding="24dp"
android:padding="32dp"
```

### 4. Responsive Design

```xml
<!-- Gunakan match_parent dan wrap_content -->
android:layout_width="match_parent"
android:layout_height="wrap_content"

<!-- Gunakan ScrollView untuk konten panjang -->
<NestedScrollView>
    <!-- Content -->
</NestedScrollView>
```

### 5. String Externalization

**Jangan hardcode text!**

❌ **Salah:**
```xml
<TextView android:text="Hello World" />
```

✅ **Benar:**
```xml
<TextView android:text="@string/hello_world" />
```

### 6. Logging untuk Debugging

```java
private static final String TAG = "MainActivity";

@Override
protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    Log.d(TAG, "onCreate called");
    // ...
}
```

---

## 🛠️ Contoh Kustomisasi

### Mengubah Warna Tema

1. Edit `res/values/colors.xml`:

```xml
<color name="primary">#FF9C27B0</color>  <!-- Purple -->
<color name="accent">#FFFFC107</color>   <!-- Amber -->
```

2. Build & run:
```bash
./scripts/build.sh && ./scripts/install-apk.sh
```

### Menambah Button Baru

1. Edit `res/layout/activity_main.xml`:

```xml
<com.google.android.material.button.MaterialButton
    android:id="@+id/btnNew"
    android:layout_width="match_parent"
    android:layout_height="56dp"
    android:text="New Button"
    app:cornerRadius="16dp" />
```

2. Edit `MainActivity.java`:

```java
Button btnNew = findViewById(R.id.btnNew);
btnNew.setOnClickListener(v -> {
    Toast.makeText(this, "Button clicked!", Toast.LENGTH_SHORT).show();
});
```

### Menambah Layout Baru

1. Buat file baru `res/layout/activity_second.xml`
2. Buat Java class baru `SecondActivity.java`
3. Daftarkan di `AndroidManifest.xml`

### Menambah Font Custom

1. Buat folder `res/font/`
2. Tambah file font (`.ttf` atau `.otf`)
3. Gunakan di layout:

```xml
<TextView
    android:fontFamily="@font/custom_font"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content" />
```

---

## 📖 Referensi

- [Material Design Guidelines](https://material.io/design)
- [Android Layout Documentation](https://developer.android.com/guide/topics/ui/declaring-layout)
- [Material Components for Android](https://github.com/material-components/material-components-android)
- [Android Developer Guide](https://developer.android.com/guide)

---

## 🚀 Quick Commands

```bash
# Build APK
./scripts/build.sh

# Install ke device
./scripts/install-apk.sh

# Run app
./scripts/run.sh

# Dev mode (auto-reload)
./scripts/dev.sh

# Clean build
./gradlew clean
```

---

**Dibuat dengan ❤️ untuk TermuxDroid Framework**
