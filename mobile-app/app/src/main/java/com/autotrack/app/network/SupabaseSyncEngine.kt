package com.autotrack.app.network

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.util.concurrent.TimeUnit

object SupabaseSyncEngine {

    private const val SUPABASE_URL = "https://kdiefrqgmoahpfcstbzc.supabase.co"
    private const val SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkaWVmcnFnbW9haHBmY3N0YnpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1ODE0OTEsImV4cCI6MjEwNDE1NzQ5MX0.chEhUh4KKaTQGL4beE6ZSf6V65aiWBHvW3cLXMmmQhE"

    private val client = OkHttpClient.Builder()
        .connectTimeout(10, TimeUnit.SECONDS)
        .readTimeout(10, TimeUnit.SECONDS)
        .build()

    private val JSON_MEDIA_TYPE = "application/json; charset=utf-8".toMediaType()

    suspend fun pushTransaction(
        id: String,
        vaultCode: String,
        title: String,
        amount: Double,
        category: String,
        date: String,
        time: String,
        paymentMethod: String,
        merchant: String,
        notes: String
    ): Boolean = withContext(Dispatchers.IO) {
        try {
            val jsonPayload = JSONObject().apply {
                put("id", id)
                put("vault_code", vaultCode)
                put("title", title)
                put("amount", amount)
                put("type", "expense")
                put("category", category)
                put("date", date)
                put("time", time)
                put("payment_method", paymentMethod)
                put("merchant", merchant)
                put("notes", notes)
                put("is_auto_captured", true)
            }.toString()

            val request = Request.Builder()
                .url("$SUPABASE_URL/rest/v1/transactions")
                .addHeader("apikey", SUPABASE_ANON_KEY)
                .addHeader("Authorization", "Bearer $SUPABASE_ANON_KEY")
                .addHeader("Content-Type", "application/json")
                .addHeader("Prefer", "return=minimal")
                .post(jsonPayload.toRequestBody(JSON_MEDIA_TYPE))
                .build()

            client.newCall(request).execute().use { response ->
                response.isSuccessful
            }
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }
}
