package com.autotrack.app.service

import android.content.Intent
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log
import java.util.regex.Pattern

class NotificationInterceptorService : NotificationListenerService() {

    companion object {
        private const val TAG = "AutoTrackInterceptor"
        
        // Target UPI & Financial App Package Names
        private val TARGET_PACKAGES = setOf(
            "com.google.android.apps.nfc.phone", // GPay
            "com.phonepe.app",                   // PhonePe
            "net.one97.paytm",                  // Paytm
            "com.dreamplug.android.cred",       // CRED
            "in.org.npci.upiapp",               // BHIM
            "com.mhop"                           // Banking SMS / Aggregator
        )
    }

    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        super.onNotificationPosted(sbn)
        if (sbn == null) return

        val packageName = sbn.packageName ?: ""
        val extras = sbn.notification?.extras ?: return
        val title = extras.getCharSequence("android.title")?.toString() ?: ""
        val text = extras.getCharSequence("android.text")?.toString() ?: ""

        val combinedText = "$title $text".lowercase()

        // Check if package or text indicates financial debit
        val isFinancialApp = TARGET_PACKAGES.contains(packageName) || combinedText.contains("debited") || combinedText.contains("paid") || combinedText.contains("sent to")

        if (!isFinancialApp) return
        if (!combinedText.contains("debited") && !combinedText.contains("paid") && !combinedText.contains("sent")) return

        Log.d(TAG, "Financial Notification Intercepted: $title | $text")

        // Parse Amount using regex
        val amountPattern = Pattern.compile("(?:rs\\.?|inr|₹)\\s*([\\d,]+(?:\\.\\d{1,2})?)", Pattern.CASE_INSENSITIVE)
        val amountMatcher = amountPattern.matcher(combinedText)
        
        var parsedAmount = 0.0
        if (amountMatcher.find()) {
            val amountStr = amountMatcher.group(1)?.replace(",", "") ?: "0"
            parsedAmount = amountStr.toDoubleOrNull() ?: 0.0
        }

        if (parsedAmount <= 0.0) return

        // Parse Merchant / Recipient
        val merchantPattern = Pattern.compile("(?:to|at|paid to|sent to)\\s+([a-zA-Z0-9\\s\\.]+?)(?:\\s+on|\\s+ref|\\s+via|\\.|\\,|$|\\b)", Pattern.CASE_INSENSITIVE)
        val merchantMatcher = merchantPattern.matcher(combinedText)
        var merchant = "UPI Merchant"
        if (merchantMatcher.find()) {
            merchant = merchantMatcher.group(1)?.trim()?.take(30) ?: "UPI Merchant"
        }

        // Determine Payment Source
        val paymentMethod = when {
            packageName.contains("phonepe") -> "PhonePe"
            packageName.contains("nfc.phone") || packageName.contains("gpay") -> "Google Pay"
            packageName.contains("paytm") -> "Paytm"
            packageName.contains("cred") -> "CRED"
            else -> "UPI / Bank"
        }

        // Launch Floating Confirmation Overlay Window
        val intent = Intent(this, OverlayService::class.java).apply {
            putExtra("AMOUNT", parsedAmount)
            putExtra("MERCHANT", merchant)
            putExtra("PAYMENT_METHOD", paymentMethod)
        }
        startService(intent)
    }
}
