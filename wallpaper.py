#!/usr/bin/env python3
"""
Sky Wallpaper - Cross-Platform Live Wallpaper
Platforms: Linux, macOS, Windows

Install dependencies:
  pip install pywebview

Linux only (wmctrl for Z-ordering):
  sudo apt install wmctrl
"""

import os
import sys
import threading
import subprocess

WINDOW_TITLE = 'SkyWallpaperBackend'


# ── Work Area (screen minus panels/taskbars/dock) ─────────────────────────────

def get_work_area():
    """Returns (x, y, width, height) excluding OS panels and taskbars."""

    if sys.platform.startswith('linux'):
        try:
            import gi
            gi.require_version('Gdk', '3.0')
            from gi.repository import Gdk
            monitor = Gdk.Display.get_default().get_primary_monitor()
            wa = monitor.get_workarea()
            return wa.x, wa.y, wa.width, wa.height
        except Exception:
            pass

    elif sys.platform == 'darwin':
        try:
            from AppKit import NSScreen
            screen = NSScreen.mainScreen()
            vf = screen.visibleFrame()          # excludes menu bar + Dock
            total_h = screen.frame().size.height
            # AppKit origin is bottom-left; convert to top-left for pywebview
            return (int(vf.origin.x),
                    int(total_h - vf.origin.y - vf.size.height),
                    int(vf.size.width),
                    int(vf.size.height))
        except ImportError:
            pass

    elif sys.platform == 'win32':
        try:
            import ctypes
            from ctypes import wintypes
            rect = wintypes.RECT()
            # SPI_GETWORKAREA returns the screen area excluding the taskbar
            ctypes.windll.user32.SystemParametersInfoW(0x0030, 0, ctypes.byref(rect), 0)
            return rect.left, rect.top, rect.right - rect.left, rect.bottom - rect.top
        except Exception:
            pass

    return 0, 0, 1920, 1080     # fallback


# ── Z-Order: push window behind everything ────────────────────────────────────

def _linux_below(window):
    """Sends the GTK window to the background layer natively without wmctrl."""
    import time
    for _ in range(10):  # Retry a few times to ensure the window has been fully realized/mapped by the WM
        time.sleep(0.5)
        try:
            gtk_window = window.native
            gdk_win = gtk_window.get_window()
            if gdk_win:
                gdk_win.set_keep_below(True)
            gtk_window.set_skip_taskbar_hint(True)
            gtk_window.set_skip_pager_hint(True)
        except Exception as e:
            print(f'[wallpaper] Linux GTK Z-order failed: {e}')
            break


def _macos_below():
    """Uses pyobjc to set the NSWindow level below desktop icons."""
    try:
        import time
        time.sleep(0.5)
        from AppKit import NSApp, NSDesktopWindowLevel
        for win in NSApp.windows():
            if win.title() == WINDOW_TITLE:
                win.setLevel_(NSDesktopWindowLevel)
                win.setCollectionBehavior_(1 << 5)
                break
    except Exception as e:
        print(f'[wallpaper] macOS Z-order failed: {e}')


def _windows_below():
    """Uses Win32 SetWindowPos(HWND_BOTTOM) to keep window behind all others."""
    try:
        import ctypes
        import time
        time.sleep(0.5)
        hwnd = ctypes.windll.user32.FindWindowW(None, WINDOW_TITLE)
        if hwnd:
            HWND_BOTTOM    = 1
            SWP_NOMOVE     = 0x0002
            SWP_NOSIZE     = 0x0001
            SWP_NOACTIVATE = 0x0010
            ctypes.windll.user32.SetWindowPos(
                hwnd, HWND_BOTTOM, 0, 0, 0, 0,
                SWP_NOMOVE | SWP_NOSIZE | SWP_NOACTIVATE
            )
    except Exception as e:
        print(f'[wallpaper] Windows SetWindowPos failed: {e}')


class WallpaperAPI:
    def __init__(self):
        self.window = None

    def log_message(self, message):
        """Prints log messages sent from the JavaScript application."""
        print(f"[JS-Debug] {message}")

    def set_interactive_mode(self, is_open, rects=None):
        """Dynamically toggles the interactive (clickable) region of the window.
        """
        if not self.window:
            return

        if sys.platform.startswith('linux'):
            try:
                import cairo
                import time
                
                # Wait for window.native to become realized (non-None)
                gtk_window = None
                for _ in range(10):
                    gtk_window = self.window.native
                    if gtk_window:
                        break
                    time.sleep(0.2)
                
                if not gtk_window:
                    print("[wallpaper] Native GTK window not ready yet.")
                    return
                
                if is_open:
                    # Make the entire window interactive so clicks outside the panel can close it
                    win_w = int(self.window.width)
                    win_h = int(self.window.height)
                    rect = cairo.RectangleInt(0, 0, win_w, win_h)
                    region = cairo.Region(rect)
                else:
                    # Make only the specified rectangles interactive, scaled by GTK's scaling factor
                    scale = gtk_window.get_scale_factor()
                    region = cairo.Region()
                    if rects:
                        for r in rects:
                            rect = cairo.RectangleInt(
                                int(r['x'] * scale),
                                int(r['y'] * scale),
                                int(r['w'] * scale),
                                int(r['h'] * scale)
                            )
                            region.union(cairo.Region(rect))
                
                gtk_window.input_shape_combine_region(region)
                print(f"[wallpaper] Interactive region updated (is_open: {is_open}, rects={rects})")
            except Exception as e:
                print(f"[wallpaper] Failed to update interactive shape: {e}")


def send_to_background(window):
    if sys.platform.startswith('linux'):
        _linux_below(window)
    elif sys.platform == 'darwin':
        _macos_below()
    elif sys.platform == 'win32':
        _windows_below()


# ── Entry Point ───────────────────────────────────────────────────────────────

def main():
    import webview

    x, y, width, height = get_work_area()
    html_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'index.html')

    api = WallpaperAPI()

    window = webview.create_window(
        title       = WINDOW_TITLE,
        url         = html_path,  # Load local file path (will be served via localhost)
        width       = width,
        height      = height,
        x           = x,
        y           = y,
        frameless   = True,
        transparent = True,
        shadow      = False,
        focus       = False,
        on_top      = False,
        js_api      = api
    )

    api.window = window

    def started():
        # Send window to background
        threading.Thread(target=send_to_background, args=(window,), daemon=True).start()

    webview.start(started, http_server=True, debug=False)


if __name__ == '__main__':
    main()