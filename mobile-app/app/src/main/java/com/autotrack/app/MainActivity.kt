package com.autotrack.app

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.autotrack.app.service.NotificationInterceptorService
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
            // Generate Unique Vault Code once
            val randomNum = 100000 + Random().nextInt(900000)
            val generatedCode = "SP-$randomNum"
            sharedPref.edit().putString("VAULT_CODE", generatedCode).apply()
        }

        btnStartOnboarding.setOnClickListener {
            val userName = etUserName.text.toString().trim()
            if (userName.isEmpty()) {
                Toast.makeText(this, "Please enter your name", Toast.LENGTH_SHORT).show()
            } else {
                sharedPref.edit().putString("USER_NAME", userName).apply()
                Toast.makeText(this, "Welcome $userName! Setup completed.", Toast.LENGTH_LONG).show()
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
            val intent = Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS)
            startActivity(intent)
        }
    }

    override fun onResume() {
        super.onResume()
        updateStatus()
    }

    private fun updateStatus() {
        val hasOverlay = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) Settings.canDrawOverlays(this) else true
        val sharedPref = getSharedPreferences("AutoTrackPrefs", Context.MODE_PRIVATE)
        val userName = sharedPref.getString("USER_NAME", "User") ?: "User"

        tvStatus.text = "Hello $userName!\nOverlay Permission: ${if (hasOverlay) "GRANTED ✅" else "PENDING ❌"}"
    }
}
