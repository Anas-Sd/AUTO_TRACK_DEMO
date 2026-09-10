package com.autotrack.app

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.text.TextUtils
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.autotrack.app.network.SupabaseSyncEngine
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.util.Random

class MainActivity : AppCompatActivity() {

    private lateinit var etUserName: EditText
    private lateinit var btnStartOnboarding: Button
    private lateinit var btnPermissionOverlay: Button
    private lateinit var btnPermissionNotification: Button
    private lateinit var tvStatus: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        etUserName = findViewById(R.id.etUserName)
        btnStartOnboarding = findViewById(R.id.btnStartOnboarding)
        btnPermissionOverlay = findViewById(R.id.btnPermissionOverlay)
        btnPermissionNotification = findViewById(R.id.btnPermissionNotification)
        tvStatus = findViewById(R.id.tvStatus)

        val sharedPref = getSharedPreferences("AutoTrackPrefs", Context.MODE_PRIVATE)
        val existingVaultCode = sharedPref.getString("VAULT_CODE", null)

        if (existingVaultCode == null) {
            // Generate 6-digit numeric Vault Code for easy web sync
            val randomNum = 100000 + Random().nextInt(900000)
            val generatedCode = "SP-$randomNum"
            sharedPref.edit().putString("VAULT_CODE", generatedCode).apply()
        }

        val savedName = sharedPref.getString("USER_NAME", "")
        if (!savedName.isNull_or_empty()) {
            etUserName.setText(savedName)
            // Ensure Supabase table has this session registered
            syncVaultSessionToSupabase()
        }

        btnStartOnboarding.setOnClickListener {
            val userName = etUserName.text.toString().trim()
            if (userName.isEmpty()) {
                Toast.makeText(this, "Please enter your name", Toast.LENGTH_SHORT).show()
            } else {
                sharedPref.edit().putString("USER_NAME", userName).apply()
                Toast.makeText(this, "Welcome $userName! Syncing Vault to Cloud...", Toast.LENGTH_SHORT).show()
                syncVaultSessionToSupabase()
                updateStatus()
            }
        }

        btnPermissionOverlay.setOnClickListener {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(this)) {
                val intent = Intent(
                    Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    Uri.parse("package:$packageName")
                )
                startActivity(intent)
            } else {
                Toast.makeText(this, "Overlay Permission already granted!", Toast.LENGTH_SHORT).show()
            }
        }

        btnPermissionNotification.setOnClickListener {
            if (isNotificationListenerGranted()) {
                Toast.makeText(this, "Notification Listener already enabled!", Toast.LENGTH_SHORT).show()
            } else {
                val intent = Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS)
                startActivity(intent)
            }
        }
    }

    override fun onResume() {
        super.onResume()
        updateStatus()
        syncVaultSessionToSupabase()
    }

    private fun syncVaultSessionToSupabase() {
        val sharedPref = getSharedPreferences("AutoTrackPrefs", Context.MODE_PRIVATE)
        val vaultCode = sharedPref.getString("VAULT_CODE", null)
        val userName = sharedPref.getString("USER_NAME", "User") ?: "User"

        if (!vaultCode.isNull_or_empty()) {
            val formattedCode = if (vaultCode.startsWith("SP-")) vaultCode else "SP-$vaultCode"
            CoroutineScope(Dispatchers.IO).launch {
                SupabaseSyncEngine.registerVaultSession(formattedCode, userName)
            }
        }
    }

    private fun isNotificationListenerGranted(): Boolean {
        val packageName = packageName
        val flat = Settings.Secure.getString(contentResolver, "enabled_notification_listeners")
        if (!TextUtils.isEmpty(flat)) {
            val names = flat.split(":")
            for (name in names) {
                val cn = ComponentName.unflattenFromString(name)
                if (cn != null && TextUtils.equals(packageName, cn.packageName)) {
                    return true
                }
            }
        }
        return false
    }

    private fun updateStatus() {
        val hasOverlay = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) Settings.canDrawOverlays(this) else true
        val hasNotification = isNotificationListenerGranted()
        val sharedPref = getSharedPreferences("AutoTrackPrefs", Context.MODE_PRIVATE)
        val userName = sharedPref.getString("USER_NAME", "User") ?: "User"
        val rawVaultCode = sharedPref.getString("VAULT_CODE", "Not Generated") ?: "Not Generated"
        val vaultCode = if (rawVaultCode.startsWith("SP-")) rawVaultCode else "SP-$rawVaultCode"

        val engineStatus = if (hasOverlay && hasNotification) {
            "⚡ STATUS: ACTIVE & RUNNING 🟢\nReady to intercept UPI payments!"
        } else {
            "⚠️ STATUS: ACTION REQUIRED 🔴\nPlease grant both permissions below."
        }

        tvStatus.text = "Hello $userName!\n🔑 Web Vault Sync Code: $vaultCode\n\n$engineStatus\n\n• Floating Card Overlay: ${if (hasOverlay) "GRANTED ✅" else "PENDING ❌"}\n• Payment Interceptor: ${if (hasNotification) "ENABLED ✅" else "DISABLED ❌"}"
    }

    private fun String?.isNull_or_empty(): Boolean = this == null || this.isEmpty()
}
