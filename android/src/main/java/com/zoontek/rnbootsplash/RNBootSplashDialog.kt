package com.zoontek.rnbootsplash

import android.app.Activity
import android.app.Dialog
import android.os.Bundle
import android.view.WindowManager

import androidx.annotation.StyleRes

class RNBootSplashDialog(
  activity: Activity,
  @StyleRes themeResId: Int,
  private val fade: Boolean
) : Dialog(activity, themeResId) {

  init {
    setOwnerActivity(activity)
    setCancelable(false)
    setCanceledOnTouchOutside(false)
  }

  @Deprecated("Deprecated in favor of OnBackPressedCallback")
  override fun onBackPressed() {
    val activity = ownerActivity
    activity?.moveTaskToBack(true)
  }

  override fun dismiss() {
    if (isShowing) {
      runCatching { super.dismiss() }
    }
  }

  fun dismiss(callback: () -> Unit) {
    if (isShowing) {
      setOnDismissListener { callback() }
      runCatching { super.dismiss() }.onFailure { callback() }
    } else {
      callback()
    }
  }

  override fun show() {
    if (!isShowing) {
      runCatching { super.show() }
    }
  }

  fun show(callback: () -> Unit) {
    if (!isShowing) {
      setOnShowListener { callback() }
      runCatching { super.show() }.onFailure { callback() }
    } else {
      callback()
    }
  }

  override fun onCreate(savedInstanceState: Bundle?) {
    if (isFullscreen) {
      setContentView(R.layout.bootsplash_view)
    }

    window?.apply {
      setLayout(
        WindowManager.LayoutParams.MATCH_PARENT,
        WindowManager.LayoutParams.MATCH_PARENT
      )
      setWindowAnimations(
        when {
          fade -> R.style.BootSplashFadeOutAnimation
          else -> R.style.BootSplashNoAnimation
        }
      )

      if (RNBootSplashModuleImpl.isSamsungOneUI4()) {
        setBackgroundDrawableResource(R.drawable.compat_splash_screen_oneui_4)
      }
    }

    super.onCreate(savedInstanceState)

    // Si el tema/activity está configurado como fullscreen (`isFullscreen == true`),
    // aquí se aplican ajustes para ocultar las barras del sistema y manejar
    // áreas de recorte (notch) según la versión de Android.
    if (isFullscreen) {
      // Android P (API 28) introdujo la gestión de 'display cutouts' (notches).
      // `layoutInDisplayCutoutMode = LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES`
      // permite que el contenido se extienda detrás del recorte en los bordes cortos
      // de la pantalla (ej. zona superior en portrait), aprovechando el área útil.
      if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.P) {
        window?.attributes?.layoutInDisplayCutoutMode =
          android.view.WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES
      }

      // A partir de Android R (API 30) se usa `WindowInsetsController` para controlar
      // la visibilidad de las barras del sistema de forma moderna.
      // - `insetsController.hide(...)` oculta tipos de insets indicados.
      //   Aquí se ocultan `statusBars()` (barra de estado) y `navigationBars()` (barra de navegación).
      // - `systemBarsBehavior = BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE`
      //   permite mostrar temporalmente las barras cuando el usuario hace swipe,
      //   en lugar de restaurarlas permanentemente.
      if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.R) {
        window?.insetsController?.let { controller ->
          controller.hide(
            android.view.WindowInsets.Type.statusBars() or
              android.view.WindowInsets.Type.navigationBars()
          )
          controller.systemBarsBehavior =
            android.view.WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        }
      } else {
        // Para versiones anteriores a R se usan flags de `systemUiVisibility` (obsoletos).
        // Explicación de los flags usados:
        // - SYSTEM_UI_FLAG_IMMERSIVE_STICKY: modo inmersivo; las barras aparecen temporalmente
        //   con gestos pero desaparecen automáticamente después de unos instantes.
        // - SYSTEM_UI_FLAG_HIDE_NAVIGATION: oculta la barra de navegación (botones virtuales).
        // - SYSTEM_UI_FLAG_FULLSCREEN: oculta la barra de estado (hora, iconos, etc.).
        // Se combinan con `or` para aplicar todos los comportamientos simultáneamente.
        @Suppress("DEPRECATION")
        window?.decorView?.systemUiVisibility = (
          android.view.View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
            or android.view.View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
            or android.view.View.SYSTEM_UI_FLAG_FULLSCREEN
          )
      }
    }
  }

  private val isFullscreen: Boolean
    get() {
      val typedValue = android.util.TypedValue()
      context.theme.resolveAttribute(android.R.attr.windowFullscreen, typedValue, true)
      return typedValue.data != 0
    }
}
