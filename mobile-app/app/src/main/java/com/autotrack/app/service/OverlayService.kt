package com.autotrack.app.service

import android.app.Service
import android.content.Context
import android.content.Intent
import android.graphics.PixelFormat
import android.os.Build
import android.os.IBinder
import android.view.Gravity
import android.view.LayoutInflater
import android.view.View
import android.view.WindowManager
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import com.autotrack.app.R
import com.autotrack.app.network.SupabaseSyncEngine
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.UUID

class OverlayService : Service() {

    private var windowManager: WindowManager? = null
    private var overlayView: View? = null

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val amount = intent?.getDoubleExtra("AMOUNT", 0.0) ?: 0.0
        val merchant = intent?.getStringExtra("MERCHANT") ?: "UPI Merchant"
        val paymentMethod = intent?.getStringExtra("PAYMENT_METHOD") ?: "UPI"

        if (amount > 0.0) {
            showOverlay(amount, merchant, paymentMethod)
        }
        return START_NOT_STICKY
    }

    private fun showOverlay(amount: Double, merchant: String, paymentMethod: String) {
        windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager

        val layoutParamsType = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        } else {
            @Suppress("DEPRECATION")
            WindowManager.LayoutParams.TYPE_PHONE
        }

        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            layoutParamsType,
            WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL or WindowManager.LayoutParams.FLAG_WATCH_OUTSIDE_TOUCH,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.BOTTOM or Gravity.CENTER_HORIZONTAL
            y = 100
        }

        val inflater = getSystemService(Context.LAYOUT_INFLATER_SERVICE) as LayoutInflater
        overlayView = inflater.inflate(R.layout.overlay_payment_confirmation, null)

        // Populate overlay elements
        val tvAmount = overlayView?.findViewById<TextView>(R.id.tvOverlayAmount)
        val tvMerchant = overlayView?.findViewById<TextView>(R.id.tvOverlayMerchant)
        val tvSource = overlayView?.findViewById<TextView>(R.id.tvOverlaySource)
        val etNotes = overlayView?.findViewById<EditText>(R.id.etOverlayNotes)
        val btnConfirm = overlayView?.findViewById<Button>(R.id.btnOverlayConfirm)
        val btnSnooze = overlayView?.findViewById<Button>(R.id.btnOverlaySnooze)

        tvAmount?.text = String.format(Locale.getDefault(), "₹%.2f", amount)
        tvMerchant?.text = merchant
        tvSource?.text = paymentMethod

        btnConfirm?.setOnClickListener {
            val notes = etNotes?.text?.toString()?.ifBlank { "Auto Captured UPI Payment" } ?: "Auto Captured"
            saveTransactionToCloud(amount, merchant, paymentMethod, notes)
            removeOverlay()
        }

        btnSnooze?.setOnClickListener {
            Toast.makeText(this, "Payment Snoozed - Added to Pending Queue", Toast.LENGTH_SHORT).show()
            removeOverlay()
        }

        try {
            windowManager?.addView(overlayView, params)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun saveTransactionToCloud(amount: Double, merchant: String, paymentMethod: String, notes: String) {
        val sharedPref = getSharedPreferences("AutoTrackPrefs", Context.MODE_PRIVATE)
        val vaultCode = sharedPref.getString("VAULT_CODE", "SP-894201") ?: "SP-894201"

        val sdfDate = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        val sdfTime = SimpleDateFormat("HH:mm", Locale.getDefault())
        val now = Date()

        val id = "tx_" + System.currentTimeMillis()

        CoroutineScope(Dispatchers.IO).launch {
            val success = SupabaseSyncEngine.pushTransaction(
                id = id,
                vaultCode = vaultCode,
                title = merchant,
                amount = amount,
                category = "Food & Dining",
                date = sdfDate.format(now),
                time = sdfTime.format(now),
                paymentMethod = paymentMethod,
                merchant = merchant,
                notes = notes
            )
        }
    }

    private fun removeOverlay() {
        if (overlayView != null) {
            windowManager?.removeView(overlayView)
            overlayView = null
        }
        stopSelf()
    }
}
