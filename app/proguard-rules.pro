# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /data/data/com.termux/files/home/android-sdk/tools/proguard/proguard-android.txt

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep custom views
-keep class * extends android.view.View {
    public <init>(android.content.Context);
    public <init>(android.content.Context, android.util.AttributeSet);
}
