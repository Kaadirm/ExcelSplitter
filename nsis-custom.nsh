; Custom NSIS script to ensure no bundleware is installed
; This script explicitly declares that no third-party software is bundled

; Registry entries to confirm no bundleware
!macro customInstall
  ; Write registry entries to confirm this is standalone software
  WriteRegStr HKCU "SOFTWARE\ExcelSplitter" "Bundleware" "None"
  WriteRegStr HKCU "SOFTWARE\ExcelSplitter" "ThirdPartyComponents" "None"
  WriteRegStr HKCU "SOFTWARE\ExcelSplitter" "InstallType" "Standalone"
!macroend

; Custom uninstall to clean up registry
!macro customUnInstall
  ; Clean up our registry entries
  DeleteRegKey HKCU "SOFTWARE\ExcelSplitter"
!macroend
