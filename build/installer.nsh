; Custom NSIS script for Excel Splitter
; This ensures proper silent installation support

; Pre-installation setup
!macro preInit
  ; If running silently, skip all user interaction
  ${If} ${Silent}
    ; Set default installation directory
    StrCpy $InstDir "$LOCALAPPDATA\Excel Splitter"
    ; Set installation type to silent
    Var /GLOBAL InstallationType
    StrCpy $InstallationType "silent"
  ${EndIf}
!macroend

; Custom installation logic
!macro customInstall
  ; Handle silent installation
  ${If} ${Silent}
    ; Skip all dialogs and prompts
    SetDetailsView hide
    ; Ensure installation completes without user interaction
    SetAutoClose true
    ; Set error level to 0 (success)
    SetErrorLevel 0
  ${EndIf}
!macroend

; Post-installation cleanup
!macro customFinish
  ${If} ${Silent}
    ; Ensure proper exit code for silent installation
    SetErrorLevel 0
    ; Don't show finish dialog
    SetAutoClose true
  ${EndIf}
!macroend
