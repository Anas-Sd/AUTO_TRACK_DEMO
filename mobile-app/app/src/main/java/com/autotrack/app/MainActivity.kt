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

    // General Views
    private lateinit var tvStepIndicator: TextView
    private lateinit var layoutStep1: LinearLayout
    private lateinit var layoutStep2: LinearLayout
    private lateinit var layoutStep3: LinearLayout
    private lateinit var layoutStep4: LinearLayout
    private lateinit var layoutDashboard: LinearLayout
    private lateinit var mobileBottomNav: LinearLayout

    // Step 1
    private lateinit var btnGoToStep2: Button

    // Step 2
    private lateinit var etUserNameInput: EditText
    private lateinit var etPhoneNumberInput: EditText
    private lateinit var btnSendOtp: Button
    private lateinit var layoutOtpSection: LinearLayout
    private lateinit var etOtpInput: EditText
    private lateinit var btnVerifyOtp: Button
    private lateinit var cardVaultCodeDisplay: LinearLayout
    private lateinit var tvVaultCodeValue: TextView
    private lateinit var btnCopyVaultCode: Button
    private lateinit var btnGoToStep3: Button
    private var isMobileVerified: Boolean = false

    // Step 3 (Setu AA Consent)
    private lateinit var btnBankHdfc: Button
    private lateinit var btnBankSbi: Button
    private lateinit var btnBankIcici: Button
    private lateinit var btnBankAxis: Button
    private lateinit var btnRequestAaConsent: Button
    private lateinit var layoutAaOtpSection: LinearLayout
    private lateinit var etAaOtpInput: EditText
    private lateinit var btnConfirmAaConsent: Button
    private lateinit var tvBankStatus: TextView
    private lateinit var btnGoToStep4: Button
    private var selectedBank: String = ""
    private var isAaConsentApproved: Boolean = false

    // Step 4 (Strict Permissions)
    private lateinit var tvOverlayStatus: TextView
    private lateinit var btnGrantOverlay: Button
    private lateinit var tvNotificationStatus: TextView
    private lateinit var btnGrantNotification: Button
    private lateinit var btnFinishOnboarding: Button

    // Step 5 Dashboard Tabs
    private lateinit var dashTabOverview: LinearLayout
    private lateinit var dashTabLedger: LinearLayout
    private lateinit var dashTabBudgets: LinearLayout
    private lateinit var dashTabEmis: LinearLayout
    private lateinit var dashTabSettings: LinearLayout

    private lateinit var navTabOverview: Button
    private lateinit var navTabLedger: Button
    private lateinit var navTabBudgets: Button
    private lateinit var navTabEmis: Button
    private lateinit var navTabSettings: Button

    private lateinit var tvDashboardVaultCode: TextView
    private lateinit var btnDashCopyVault: Button
    private lateinit var btnResetOnboarding: Button

    private var currentVaultCode: String = ""

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        initViews()

        val sharedPref = getSharedPreferences("AutoTrackPrefs", Context.MODE_PRIVATE)

        // Retrieve or initialize Vault Code
        var code = sharedPref.getString("VAULT_CODE", null)
        if (code.isNullOrEmpty()) {
            val randomNum = 100000 + Random().nextInt(900000)
            code = "SP-$randomNum"
            sharedPref.edit().putString("VAULT_CODE", code).apply()
        }
        currentVaultCode = if (code.startsWith("SP-")) code else "SP-$code"
        tvVaultCodeValue.text = currentVaultCode
        tvDashboardVaultCode.text = currentVaultCode

        // Pre-fill user name if saved
        val savedName = sharedPref.getString("USER_NAME", "")
        if (!savedName.isNullOrEmpty()) {
            etUserNameInput.setText(savedName)
        }

        val isCompleted = sharedPref.getBoolean("ONBOARDING_COMPLETED", false)

        setupStep1Listeners()
        setupStep2Listeners()
        setupStep3Listeners()
        setupStep4Listeners()
        setupDashboardNavigation()

        if (isCompleted) {
            showStep(5)
        } else {
            showStep(1)
        }

        // Always register/sync vault session to Supabase
        syncVaultSessionToSupabase()
    }

    private fun initViews() {
        tvStepIndicator = findViewById(R.id.tvStepIndicator)
        layoutStep1 = findViewById(R.id.layoutStep1)
        layoutStep2 = findViewById(R.id.layoutStep2)
        layoutStep3 = findViewById(R.id.layoutStep3)
        layoutStep4 = findViewById(R.id.layoutStep4)
        layoutDashboard = findViewById(R.id.layoutDashboard)
        mobileBottomNav = findViewById(R.id.mobileBottomNav)

        btnGoToStep2 = findViewById(R.id.btnGoToStep2)

        etUserNameInput = findViewById(R.id.etUserNameInput)
        etPhoneNumberInput = findViewById(R.id.etPhoneNumberInput)
        btnSendOtp = findViewById(R.id.btnSendOtp)
        layoutOtpSection = findViewById(R.id.layoutOtpSection)
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
        btnRequestAaConsent = findViewById(R.id.btnRequestAaConsent)
        layoutAaOtpSection = findViewById(R.id.layoutAaOtpSection)
        etAaOtpInput = findViewById(R.id.etAaOtpInput)
        btnConfirmAaConsent = findViewById(R.id.btnConfirmAaConsent)
        tvBankStatus = findViewById(R.id.tvBankStatus)
        btnGoToStep4 = findViewById(R.id.btnGoToStep4)

        tvOverlayStatus = findViewById(R.id.tvOverlayStatus)
        btnGrantOverlay = findViewById(R.id.btnGrantOverlay)
        tvNotificationStatus = findViewById(R.id.tvNotificationStatus)
        btnGrantNotification = findViewById(R.id.btnGrantNotification)
        btnFinishOnboarding = findViewById(R.id.btnFinishOnboarding)

        dashTabOverview = findViewById(R.id.dashTabOverview)
        dashTabLedger = findViewById(R.id.dashTabLedger)
        dashTabBudgets = findViewById(R.id.dashTabBudgets)
        dashTabEmis = findViewById(R.id.dashTabEmis)
        dashTabSettings = findViewById(R.id.dashTabSettings)

        navTabOverview = findViewById(R.id.navTabOverview)
        navTabLedger = findViewById(R.id.navTabLedger)
        navTabBudgets = findViewById(R.id.navTabBudgets)
        navTabEmis = findViewById(R.id.navTabEmis)
        navTabSettings = findViewById(R.id.navTabSettings)

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
        mobileBottomNav.visibility = View.GONE

        when (step) {
            1 -> {
                tvStepIndicator.text = "Step 1 of 4"
                layoutStep1.visibility = View.VISIBLE
            }
            2 -> {
                tvStepIndicator.text = "Step 2 of 4"
                layoutStep2.visibility = View.VISIBLE
            }
            3 -> {
                tvStepIndicator.text = "Step 3 of 4"
                layoutStep3.visibility = View.VISIBLE
            }
            4 -> {
                tvStepIndicator.text = "Step 4 of 4"
                layoutStep4.visibility = View.VISIBLE
                updatePermissionStatus()
            }
            5 -> {
                tvStepIndicator.text = "Active Dashboard 🟢"
                layoutDashboard.visibility = View.VISIBLE
                mobileBottomNav.visibility = View.VISIBLE
                switchDashboardTab(1)
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
                layoutOtpSection.visibility = View.VISIBLE
            }
        }

        btnVerifyOtp.setOnClickListener {
            val name = etUserNameInput.text.toString().trim()
            val userName = if (name.isNotEmpty()) name else "User"
            val sharedPref = getSharedPreferences("AutoTrackPrefs", Context.MODE_PRIVATE)
            sharedPref.edit().putString("USER_NAME", userName).apply()

            isMobileVerified = true
            Toast.makeText(this, "OTP Verified! Vault Code Generated & Registered.", Toast.LENGTH_SHORT).show()

            // Reveal Vault Code Card and Step 3 Next Button
            cardVaultCodeDisplay.visibility = View.VISIBLE
            btnGoToStep3.visibility = View.VISIBLE

            syncVaultSessionToSupabase()
        }

        btnCopyVaultCode.setOnClickListener {
            val clipboard = getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
            val clip = ClipData.newPlainText("Vault Code", currentVaultCode)
            clipboard.setPrimaryClip(clip)
            Toast.makeText(this, "Vault Code $currentVaultCode copied to clipboard!", Toast.LENGTH_SHORT).show()
        }

        btnGoToStep3.setOnClickListener {
            if (!isMobileVerified) {
                Toast.makeText(this, "Please verify your mobile number & OTP first!", Toast.LENGTH_SHORT).show()
            } else {
                showStep(3)
            }
        }
    }

    private fun setupStep3Listeners() {
        val selectBank = { bankName: String ->
            selectedBank = bankName
            tvBankStatus.text = "Selected Bank: $bankName. Click below to request Setu AA Consent."
            Toast.makeText(this, "Selected $bankName!", Toast.LENGTH_SHORT).show()
        }

        btnBankHdfc.setOnClickListener { selectBank("HDFC Bank") }
        btnBankSbi.setOnClickListener { selectBank("SBI Bank") }
        btnBankIcici.setOnClickListener { selectBank("ICICI Bank") }
        btnBankAxis.setOnClickListener { selectBank("Axis Bank") }

        btnRequestAaConsent.setOnClickListener {
            if (selectedBank.isEmpty()) {
                Toast.makeText(this, "Please select your primary bank first!", Toast.LENGTH_SHORT).show()
            } else {
                Toast.makeText(this, "Setu AA Consent SMS Sent! Enter OTP: 772200", Toast.LENGTH_LONG).show()
                etAaOtpInput.setText("772200")
                layoutAaOtpSection.visibility = View.VISIBLE
            }
        }

        btnConfirmAaConsent.setOnClickListener {
            isAaConsentApproved = true
            tvBankStatus.text = "✅ RBI AA Consent Approved: $selectedBank (Ref ID: AA-SETU-2026)"
            btnGoToStep4.visibility = View.VISIBLE
            Toast.makeText(this, "RBI Account Aggregator Consent Granted!", Toast.LENGTH_SHORT).show()
        }

        btnGoToStep4.setOnClickListener {
            if (!isAaConsentApproved) {
                Toast.makeText(this, "Please approve RBI AA Consent first!", Toast.LENGTH_SHORT).show()
            } else {
                showStep(4)
            }
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
            val hasOverlay = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) Settings.canDrawOverlays(this) else true
            val hasNotification = isNotificationListenerGranted()

            if (!hasOverlay || !hasNotification) {
                Toast.makeText(this, "⚠️ Please grant BOTH permissions above to activate dashboard!", Toast.LENGTH_LONG).show()
            } else {
                val sharedPref = getSharedPreferences("AutoTrackPrefs", Context.MODE_PRIVATE)
                sharedPref.edit().putBoolean("ONBOARDING_COMPLETED", true).apply()
                showStep(5)
                Toast.makeText(this, "SpendPulse Mobile Dashboard Activated!", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun setupDashboardNavigation() {
        navTabOverview.setOnClickListener { switchDashboardTab(1) }
        navTabLedger.setOnClickListener { switchDashboardTab(2) }
        navTabBudgets.setOnClickListener { switchDashboardTab(3) }
        navTabEmis.setOnClickListener { switchDashboardTab(4) }
        navTabSettings.setOnClickListener { switchDashboardTab(5) }

        btnDashCopyVault.setOnClickListener {
            val clipboard = getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
            val clip = ClipData.newPlainText("Vault Code", currentVaultCode)
            clipboard.setPrimaryClip(clip)
            Toast.makeText(this, "Vault Code $currentVaultCode copied!", Toast.LENGTH_SHORT).show()
        }

        btnResetOnboarding.setOnClickListener {
            val sharedPref = getSharedPreferences("AutoTrackPrefs", Context.MODE_PRIVATE)
            sharedPref.edit().putBoolean("ONBOARDING_COMPLETED", false).apply()
            isMobileVerified = false
            isAaConsentApproved = false
            showStep(1)
        }
    }

    private fun switchDashboardTab(tabIndex: Int) {
        dashTabOverview.visibility = View.GONE
        dashTabLedger.visibility = View.GONE
        dashTabBudgets.visibility = View.GONE
        dashTabEmis.visibility = View.GONE
        dashTabSettings.visibility = View.GONE

        // Reset colors
        navTabOverview.setTextColor(0xFF94A3B8.toInt())
        navTabLedger.setTextColor(0xFF94A3B8.toInt())
        navTabBudgets.setTextColor(0xFF94A3B8.toInt())
        navTabEmis.setTextColor(0xFF94A3B8.toInt())
        navTabSettings.setTextColor(0xFF94A3B8.toInt())

        when (tabIndex) {
            1 -> {
                dashTabOverview.visibility = View.VISIBLE
                navTabOverview.setTextColor(0xFF10B981.toInt())
            }
            2 -> {
                dashTabLedger.visibility = View.VISIBLE
                navTabLedger.setTextColor(0xFF10B981.toInt())
            }
            3 -> {
                dashTabBudgets.visibility = View.VISIBLE
                navTabBudgets.setTextColor(0xFF10B981.toInt())
            }
            4 -> {
                dashTabEmis.visibility = View.VISIBLE
                navTabEmis.setTextColor(0xFF10B981.toInt())
            }
            5 -> {
                dashTabSettings.visibility = View.VISIBLE
                navTabSettings.setTextColor(0xFF10B981.toInt())
            }
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
