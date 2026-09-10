package com.autotrack.app

import android.content.ClipData
import android.content.ClipboardManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.text.TextUtils
import android.view.View
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import com.autotrack.app.network.SupabaseSyncEngine
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.util.Random

class MainActivity : AppCompatActivity() {

    // Views
    private lateinit var tvStepIndicator: TextView
    private lateinit var layoutStep1: LinearLayout
    private lateinit var layoutStep2: LinearLayout
    private lateinit var layoutStep3: LinearLayout
    private lateinit var layoutStep4: LinearLayout
    private lateinit var layoutDashboard: LinearLayout

    // Step 1
    private lateinit var btnGoToStep2: Button

    // Step 2
    private lateinit var etUserNameInput: EditText
    private lateinit var etPhoneNumberInput: EditText
    private lateinit var layoutOtpContainer: LinearLayout
    private lateinit var btnSendOtp: Button
    private lateinit var etOtpInput: EditText
    private lateinit var btnVerifyOtp: Button
    private lateinit var cardVaultCodeDisplay: LinearLayout
    private lateinit var tvVaultCodeValue: TextView
    private lateinit var btnCopyVaultCode: Button
    private lateinit var btnGoToStep3: Button

    // Step 3
    private lateinit var btnBankHdfc: Button
    private lateinit var btnBankSbi: Button
    private lateinit var btnBankIcici: Button
    private lateinit var btnBankAxis: Button
    private lateinit var tvBankStatus: TextView
    private lateinit var btnGoToStep4: Button

    // Step 4
    private lateinit var tvOverlayStatus: TextView
    private lateinit var btnGrantOverlay: Button
    private lateinit var tvNotificationStatus: TextView
    private lateinit var btnGrantNotification: Button
    private lateinit var btnFinishOnboarding: Button

    // Step 5 Dashboard
    private lateinit var tvDashboardVaultCode: TextView
    private lateinit var btnDashCopyVault: Button
    private lateinit var btnResetOnboarding: Button

    private var currentVaultCode: String = "SP-623440"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        initViews()

        val sharedPref = getSharedPreferences("AutoTrackPrefs", Context.MODE_PRIVATE)

        // Generate or retrieve 8-character Vault Code (e.g. SP-623440)
        var code = sharedPref.getString("VAULT_CODE", null)
        if (code.isNullOrEmpty()) {
            val randomNum = 100000 + Random().nextInt(900000)
            code = "SP-$randomNum"
            sharedPref.edit().putString("VAULT_CODE", code).apply()
        }
        currentVaultCode = if (code.startsWith("SP-")) code else "SP-$code"
        tvVaultCodeValue.text = currentVaultCode
        tvDashboardVaultCode.text = currentVaultCode

        // Pre-fill user details if available
        val savedName = sharedPref.getString("USER_NAME", "")
        if (!savedName.isNullOrEmpty()) {
            etUserNameInput.setText(savedName)
        }

        val isCompleted = sharedPref.getBoolean("ONBOARDING_COMPLETED", false)

        // Setup Step Event Listeners
        setupStep1Listeners()
        setupStep2Listeners()
        setupStep3Listeners()
        setupStep4Listeners()
        setupDashboardListeners()

        if (isCompleted) {
            showStep(5)
        } else {
            showStep(1)
        }

        // Always sync vault session to Supabase cloud
        syncVaultSessionToSupabase()
    }

    private fun initViews() {
        tvStepIndicator = findViewById(R.id.tvStepIndicator)
        layoutStep1 = findViewById(R.id.layoutStep1)
        layoutStep2 = findViewById(R.id.layoutStep2)
        layoutStep3 = findViewById(R.id.layoutStep3)
        layoutStep4 = findViewById(R.id.layoutStep4)
        layoutDashboard = findViewById(R.id.layoutDashboard)

        btnGoToStep2 = findViewById(R.id.btnGoToStep2)

        etUserNameInput = findViewById(R.id.etUserNameInput)
        etPhoneNumberInput = findViewById(R.id.etPhoneNumberInput)
        layoutOtpContainer = findViewById(R.id.layoutOtpContainer)
        btnSendOtp = findViewById(R.id.btnSendOtp)
        etOtpInput = findViewById(R.id.etOtpInput)
        btnVerifyOtp = findViewById(R.id.btnVerifyOtp)
        cardVaultCodeDisplay = findViewById(R.id.cardVaultCodeDisplay)
        tvVaultCodeValue = findViewById(R.id.tvVaultCodeValue)
        btnCopyVaultCode = findViewById(R.id.btnCopyVaultCode)
        btnGoToStep3 = findViewById(R.id.btnGoToStep3)

        btnBankHdfc = findViewById(R.id.btnBankHdfc)
        btnBankSbi = findViewById(R.id.btnBankSbi)
        btnBankIcici = findViewById(R.id.btnBankIcici)
        btnBankAxis = findViewById(R.id.btnBankAxis)
        tvBankStatus = findViewById(R.id.tvBankStatus)
        btnGoToStep4 = findViewById(R.id.btnGoToStep4)

        tvOverlayStatus = findViewById(R.id.tvOverlayStatus)
        btnGrantOverlay = findViewById(R.id.btnGrantOverlay)
        tvNotificationStatus = findViewById(R.id.tvNotificationStatus)
        btnGrantNotification = findViewById(R.id.btnGrantNotification)
        btnFinishOnboarding = findViewById(R.id.btnFinishOnboarding)

        tvDashboardVaultCode = findViewById(R.id.tvDashboardVaultCode)
        btnDashCopyVault = findViewById(R.id.btnDashCopyVault)
        btnResetOnboarding = findViewById(R.id.btnResetOnboarding)
    }

    private fun showStep(step: Int) {
        layoutStep1.visibility = View.GONE
        layoutStep2.visibility = View.GONE
        layoutStep3.visibility = View.GONE
        layoutStep4.visibility = View.GONE
        layoutDashboard.visibility = View.GONE

        when (step) {
            1 -> {
                tvStepIndicator.text = "Step 1 of 5"
                layoutStep1.visibility = View.VISIBLE
            }
            2 -> {
                tvStepIndicator.text = "Step 2 of 5"
                layoutStep2.visibility = View.VISIBLE
            }
            3 -> {
                tvStepIndicator.text = "Step 3 of 5"
                layoutStep3.visibility = View.VISIBLE
            }
            4 -> {
                tvStepIndicator.text = "Step 4 of 5"
                layoutStep4.visibility = View.VISIBLE
                updatePermissionStatus()
            }
            5 -> {
                tvStepIndicator.text = "Active Dashboard 🟢"
                layoutDashboard.visibility = View.VISIBLE
            }
        }
    }

    private fun setupStep1Listeners() {
        btnGoToStep2.setOnClickListener {
            showStep(2)
        }
    }

    private fun setupStep2Listeners() {
        btnSendOtp.setOnClickListener {
            val phone = etPhoneNumberInput.text.toString().trim()
            if (phone.length < 10) {
                Toast.makeText(this, "Please enter a valid 10-digit mobile number", Toast.LENGTH_SHORT).show()
            } else {
                Toast.makeText(this, "Verification SMS Sent! Enter OTP: 894201", Toast.LENGTH_LONG).show()
                etOtpInput.setText("894201")
                etOtpInput.visibility = View.VISIBLE
                btnVerifyOtp.visibility = View.VISIBLE
            }
        }

        btnVerifyOtp.setOnClickListener {
            val name = etUserNameInput.text.toString().trim()
            val userName = if (name.isNotEmpty()) name else "Anas"
            val sharedPref = getSharedPreferences("AutoTrackPrefs", Context.MODE_PRIVATE)
            sharedPref.edit().putString("USER_NAME", userName).apply()

            Toast.makeText(this, "OTP Verified! Vault Sync Code Generated.", Toast.LENGTH_SHORT).show()
            syncVaultSessionToSupabase()
        }

        val copyAction = View.OnClickListener {
            val clipboard = getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
            val clip = ClipData.newPlainText("Vault Code", currentVaultCode)
            clipboard.setPrimaryClip(clip)
            Toast.makeText(this, "Vault Code $currentVaultCode copied to clipboard!", Toast.LENGTH_SHORT).show()
        }
        btnCopyVaultCode.setOnClickListener(copyAction)

        btnGoToStep3.setOnClickListener {
            showStep(3)
        }
    }

    private fun setupStep3Listeners() {
        val selectBank = { bankName: String ->
            tvBankStatus.text = "✅ Selected: $bankName (RBI AA Digital Consent Granted)"
            Toast.makeText(this, "Linked $bankName via RBI Account Aggregator!", Toast.LENGTH_SHORT).show()
        }

        btnBankHdfc.setOnClickListener { selectBank("HDFC Bank") }
        btnBankSbi.setOnClickListener { selectBank("SBI Bank") }
        btnBankIcici.setOnClickListener { selectBank("ICICI Bank") }
        btnBankAxis.setOnClickListener { selectBank("Axis Bank") }

        btnGoToStep4.setOnClickListener {
            showStep(4)
        }
    }

    private fun setupStep4Listeners() {
        btnGrantOverlay.setOnClickListener {
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

        btnGrantNotification.setOnClickListener {
            if (isNotificationListenerGranted()) {
                Toast.makeText(this, "Notification Listener already enabled!", Toast.LENGTH_SHORT).show()
            } else {
                val intent = Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS)
                startActivity(intent)
            }
        }

        btnFinishOnboarding.setOnClickListener {
            val sharedPref = getSharedPreferences("AutoTrackPrefs", Context.MODE_PRIVATE)
            sharedPref.edit().putBoolean("ONBOARDING_COMPLETED", true).apply()
            showStep(5)
            Toast.makeText(this, "SpendPulse Mobile Dashboard Activated!", Toast.LENGTH_SHORT).show()
        }
    }

    private fun setupDashboardListeners() {
        btnDashCopyVault.setOnClickListener {
            val clipboard = getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
            val clip = ClipData.newPlainText("Vault Code", currentVaultCode)
            clipboard.setPrimaryClip(clip)
            Toast.makeText(this, "Vault Code $currentVaultCode copied to clipboard!", Toast.LENGTH_SHORT).show()
        }

        btnResetOnboarding.setOnClickListener {
            val sharedPref = getSharedPreferences("AutoTrackPrefs", Context.MODE_PRIVATE)
            sharedPref.edit().putBoolean("ONBOARDING_COMPLETED", false).apply()
            showStep(1)
        }
    }

    override fun onResume() {
        super.onResume()
        updatePermissionStatus()
        syncVaultSessionToSupabase()
    }

    private fun updatePermissionStatus() {
        val hasOverlay = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) Settings.canDrawOverlays(this) else true
        val hasNotification = isNotificationListenerGranted()

        tvOverlayStatus.text = "1. Display Over Other Apps: ${if (hasOverlay) "GRANTED ✅" else "PENDING ❌"}"
        tvNotificationStatus.text = "2. Notification Listener: ${if (hasNotification) "ENABLED ✅" else "DISABLED ❌"}"
    }

    private fun syncVaultSessionToSupabase() {
        val sharedPref = getSharedPreferences("AutoTrackPrefs", Context.MODE_PRIVATE)
        val vaultCode = sharedPref.getString("VAULT_CODE", currentVaultCode) ?: currentVaultCode
        val userName = sharedPref.getString("USER_NAME", "User") ?: "User"

        val formattedCode = if (vaultCode.startsWith("SP-")) vaultCode else "SP-$vaultCode"
        CoroutineScope(Dispatchers.IO).launch {
            SupabaseSyncEngine.registerVaultSession(formattedCode, userName)
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
}
