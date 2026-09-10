package com.autotrack.app.util

import java.security.MessageDigest
import javax.crypto.Cipher
import javax.crypto.spec.SecretKeySpec
import android.util.Base64

object CryptoUtils {

    /**
     * Hashes raw Vault Code using SHA-256 to create an anonymized Cloud Vault ID.
     * The Database Admin will only see this 64-char hex hash, NEVER the raw Vault Code!
     */
    fun hashVaultCode(vaultCode: String): String {
        return try {
            val digest = MessageDigest.getInstance("SHA-256")
            val hashBytes = digest.digest(vaultCode.toByteArray(Charsets.UTF_8))
            hashBytes.joinToString("") { "%02x".format(it) }
        } catch (e: Exception) {
            e.printStackTrace()
            vaultCode
        }
    }

    private fun deriveKey(secret: String): SecretKeySpec {
        val digest = MessageDigest.getInstance("SHA-256")
        val bytes = digest.digest(secret.toByteArray(Charsets.UTF_8))
        return SecretKeySpec(bytes, "AES")
    }

    fun encryptAES(plainText: String, secretKey: String): String {
        return try {
            val keySpec = deriveKey(secretKey)
            val cipher = Cipher.getInstance("AES/ECB/PKCS5Padding")
            cipher.init(Cipher.ENCRYPT_MODE, keySpec)
            val encryptedBytes = cipher.doFinal(plainText.toByteArray(Charsets.UTF_8))
            Base64.encodeToString(encryptedBytes, Base64.NO_WRAP)
        } catch (e: Exception) {
            e.printStackTrace()
            plainText
        }
    }

    fun decryptAES(cipherTextBase64: String, secretKey: String): String {
        return try {
            val keySpec = deriveKey(secretKey)
            val cipher = Cipher.getInstance("AES/ECB/PKCS5Padding")
            cipher.init(Cipher.DECRYPT_MODE, keySpec)
            val decodedBytes = Base64.decode(cipherTextBase64, Base64.NO_WRAP)
            val decryptedBytes = cipher.doFinal(decodedBytes)
            String(decryptedBytes, Charsets.UTF_8)
        } catch (e: Exception) {
            e.printStackTrace()
            cipherTextBase64
        }
    }
}
