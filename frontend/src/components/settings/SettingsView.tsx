"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useAppStore } from "@/lib/store";
import {
  SignalPersonUserIcon,
  SignalPencilEditIcon,
  SignalAtUsernameIcon,
  SignalSettingsAppearanceIcon,
  SignalSettingsLockIcon,
  SignalSettingsBellIcon,
  SignalSettingsGeneralIcon,
  SignalSettingsChatIcon,
  SignalSettingsCallIcon,
  SignalSettingsDataIcon,
  SignalSettingsBackupIcon,
  SignalSettingsHeartIcon,
  SignalGlobeIcon,
  SignalThemeHalfCircleIcon,
  SignalPaletteIcon,
  SignalZoomIcon,
} from "@/components/SignalIcons";

function SignalToggle({
  checked,
  onChange,
  disabled,
  "data-testid": testId,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  "data-testid"?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      data-testid={testId}
      onClick={() => onChange(!checked)}
      disabled={disabled}
      style={{
        backgroundColor: checked ? "#596ff5" : "#3e3e42",
        width: "38px",
        height: "22px",
      }}
      className="flex items-center rounded-full p-0.5 transition-colors cursor-pointer shrink-0 border-0 outline-hidden"
    >
      <div
        style={{
          transform: checked ? "translateX(16px)" : "translateX(0px)",
        }}
        className="bg-white w-4 h-4 rounded-full shadow-md transition-transform duration-200"
      />
    </button>
  );
}

export function SettingsView() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const {
    activeSettingsTab,
    theme,
    setTheme,
    soundEnabled,
    setSoundEnabled,
    userAbout,
    setUserAbout,
    blockedUserIds,
    toggleBlockUser,
    contacts,
    themePreference,
    setThemePreference,
    chatColor,
    setChatColor,
    zoomLevel,
    setZoomLevel,
    language,
    setLanguage,
  } = useAppStore();

  // Local state for editing fields
  const [isEditingDisplayName, setIsEditingDisplayName] = useState(false);
  const [displayNameInput, setDisplayNameInput] = useState(user?.display_name || "");
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [aboutInput, setAboutInput] = useState(userAbout);
  const [readReceipts, setReadReceipts] = useState(true);
  const [typingIndicators, setTypingIndicators] = useState(true);
  const [enterToSend, setEnterToSend] = useState(true);
  const [isPhotoPickerOpen, setIsPhotoPickerOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(user?.avatar_color || "#2c6bed");

  // General Tab States (Matching Signal Desktop screenshot)
  const [openAtLogin, setOpenAtLogin] = useState(true);
  const [hideMenuBar, setHideMenuBar] = useState(false);
  const [minimizeToTray, setMinimizeToTray] = useState(true);
  const [allowMic, setAllowMic] = useState(true);
  const [allowCamera, setAllowCamera] = useState(true);
  const [autoDownloadUpdates, setAutoDownloadUpdates] = useState(true);
  const [isDeleteDataModalOpen, setIsDeleteDataModalOpen] = useState(false);

  // Appearance Dropdowns
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const [isColorDropdownOpen, setIsColorDropdownOpen] = useState(false);
  const [isZoomDropdownOpen, setIsZoomDropdownOpen] = useState(false);
  const [backupStatus, setBackupStatus] = useState<string | null>(null);
  const [donateStatus, setDonateStatus] = useState<string | null>(null);

  const colorPalette = [
    "#2c6bed", "#128c7e", "#e542a3", "#8a3ffc", "#fa4d56", "#007d79", "#f1c21b", "#edd0c9"
  ];

  const handleSaveAbout = () => {
    setUserAbout(aboutInput.trim() || "Hey there! I am using Signal.");
    setIsEditingAbout(false);
  };

  const handleConfirmDeleteAllData = () => {
    setIsDeleteDataModalOpen(false);
    if (typeof window !== "undefined") {
      localStorage.clear();
      sessionStorage.clear();
    }
    logout();
    router.push("/login");
  };

  useEffect(() => {
    if (!isDeleteDataModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setIsDeleteDataModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDeleteDataModalOpen]);

  if (!user) return null;

  const tabTitles: Record<string, string> = {
    profile: "Profile",
    general: "General",
    appearance: "Appearance",
    chats: "Chats",
    calls: "Calls",
    notifications: "Notifications",
    privacy: "Privacy",
    data_usage: "Data usage",
    backups: "Backups",
    donate: "Donate to Signal",
  };

  return (
    <main
      aria-label="Settings panel"
      className="flex-1 h-full bg-[var(--bg-primary)] flex flex-col overflow-hidden select-none"
    >
      {/* Centered Top Header Bar */}
      <header className="h-14 border-b border-[var(--border-primary)] flex items-center justify-center relative px-6 shrink-0 bg-[var(--bg-primary)]">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">
          {tabTitles[activeSettingsTab] || "Settings"}
        </h2>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-[520px]">
          {/* ========================================================================= */}
          {/* TAB 1: PROFILE (Pixel-matched to user's screenshot)                        */}
          {/* ========================================================================= */}
          {activeSettingsTab === "profile" && (
            <div className="space-y-7">
              {/* Profile Avatar & Edit Photo */}
              <div className="flex flex-col items-center">
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-md select-none transition-transform hover:scale-105"
                  style={{ backgroundColor: selectedColor }}
                >
                  {user.initials || user.display_name.slice(0, 2).toUpperCase()}
                </div>

                <button
                  type="button"
                  onClick={() => setIsPhotoPickerOpen(!isPhotoPickerOpen)}
                  className="mt-3 px-4 py-1.5 rounded-full bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--border-primary)] text-xs font-semibold transition-colors cursor-pointer"
                >
                  Edit photo
                </button>

                {isPhotoPickerOpen && (
                  <div className="mt-4 p-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] flex items-center gap-2 animate-in zoom-in-95 shadow-sm">
                    {colorPalette.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => {
                          setSelectedColor(color);
                          setIsPhotoPickerOpen(false);
                        }}
                        className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                        style={{
                          backgroundColor: color,
                          borderColor: selectedColor === color ? "var(--text-primary)" : "transparent",
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Profile Details List */}
              <div className="space-y-5 pt-2">
                {/* 1. Display Name */}
                <div className="space-y-1">
                  <div className="flex items-center gap-3.5">
                    <SignalPersonUserIcon className="w-5 h-5 text-[var(--text-secondary)] shrink-0" />
                    {isEditingDisplayName ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={displayNameInput}
                          onChange={(e) => setDisplayNameInput(e.target.value)}
                          className="flex-1 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg px-3 py-1.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--signal-ultramarine)]"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditingDisplayName(false);
                          }}
                          className="px-3 py-1 bg-[var(--signal-ultramarine)] text-white text-xs font-semibold rounded-lg hover:brightness-110"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => setIsEditingDisplayName(true)}
                        className="flex-1 text-sm font-medium text-[var(--text-primary)] cursor-pointer hover:underline"
                        title="Click to edit name"
                      >
                        {displayNameInput || user.display_name}
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. About Status */}
                <div className="space-y-1">
                  <div className="flex items-center gap-3.5">
                    <SignalPencilEditIcon className="w-5 h-5 text-[var(--text-secondary)] shrink-0" />
                    {isEditingAbout ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={aboutInput}
                          onChange={(e) => setAboutInput(e.target.value)}
                          className="flex-1 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg px-3 py-1.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--signal-ultramarine)]"
                          autoFocus
                          onKeyDown={(e) => e.key === "Enter" && handleSaveAbout()}
                        />
                        <button
                          type="button"
                          onClick={handleSaveAbout}
                          className="px-3 py-1 bg-[var(--signal-ultramarine)] text-white text-xs font-semibold rounded-lg hover:brightness-110"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => setIsEditingAbout(true)}
                        className="flex-1 text-sm font-medium text-[var(--text-primary)] cursor-pointer hover:underline"
                        title="Click to edit About status"
                      >
                        {userAbout || "About"}
                      </div>
                    )}
                  </div>
                  {/* Explanatory Subtitle from screenshot */}
                  <p className="text-xs text-[var(--text-secondary)] pl-8 leading-relaxed">
                    Your profile and changes to it will be visible to people you message, contacts and groups.
                  </p>
                </div>

                {/* Divider Line */}
                <hr className="border-[var(--border-primary)] my-5" />

                {/* 3. Username */}
                <div className="space-y-1">
                  <div className="flex items-center gap-3.5">
                    <SignalAtUsernameIcon className="w-5 h-5 text-[var(--text-secondary)] shrink-0" />
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                      {user.username ? `@${user.username}` : "Username"}
                    </span>
                  </div>
                  {/* Explanatory Subtitle from screenshot */}
                  <p className="text-xs text-[var(--text-secondary)] pl-8 leading-relaxed">
                    People can now message you using your optional username so you don&apos;t have to give out your phone number.
                  </p>
                </div>

                {/* Account Log Out Section (Profile only) */}
                <div className="pt-6 border-t border-[var(--border-primary)] mt-8 flex justify-between items-center">
                  <div>
                    <div className="text-xs text-[var(--text-secondary)]">Signed in as {user.display_name}</div>
                    <div className="text-[11px] text-[var(--text-muted)]">{user.phone || `@${user.username}`}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Are you sure you want to log out of Signal?")) {
                        logout();
                      }
                    }}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: GENERAL (Pixel-matched to user's screenshot)                        */}
          {/* ========================================================================= */}
          {activeSettingsTab === "general" && (
            <div className="space-y-7 pb-6" data-testid="settings-general-pane">
              {/* 1. Account / Device Info Card */}
              <div>
                <div
                  style={{ backgroundColor: "#242426", borderColor: "#343438" }}
                  className="border rounded-2xl overflow-hidden"
                >
                  <div
                    style={{ borderColor: "#323236" }}
                    className="px-4 py-4 flex items-center justify-between border-b"
                  >
                    <span className="text-[13.5px] text-[#e0e0e0] font-normal">Phone Number</span>
                    <span className="text-[13px] text-[#919196] font-normal">
                      {user.phone || "+91 79828 41202"}
                    </span>
                  </div>
                  <div className="px-4 py-4 flex items-center justify-between">
                    <span className="text-[13.5px] text-[#e0e0e0] font-normal">Device Name</span>
                    <span className="text-[13px] text-[#919196] font-normal">Windows</span>
                  </div>
                </div>
                <p className="text-[11.5px] text-[#8e8e93] px-1 mt-2.5 leading-relaxed">
                  To change the name of this device, open Signal on your phone and navigate to Settings &gt; Linked devices
                </p>
              </div>

              {/* 2. System Section */}
              <div>
                <h3 className="text-[13px] font-semibold text-[#8e8e93] mb-2.5 px-1">
                  System
                </h3>
                <div
                  style={{ backgroundColor: "#242426", borderColor: "#343438" }}
                  className="border rounded-2xl overflow-hidden"
                >
                  <div
                    style={{ borderColor: "#323236" }}
                    className="px-4 py-4 flex items-center justify-between border-b"
                  >
                    <span className="text-[13.5px] text-[#e0e0e0] font-normal">Open at computer login</span>
                    <SignalToggle
                      checked={openAtLogin}
                      onChange={setOpenAtLogin}
                      data-testid="toggle-open-at-login"
                    />
                  </div>
                  <div
                    style={{ borderColor: "#323236" }}
                    className="px-4 py-4 flex items-center justify-between border-b"
                  >
                    <span className="text-[13.5px] text-[#e0e0e0] font-normal">Hide menu bar</span>
                    <SignalToggle
                      checked={hideMenuBar}
                      onChange={setHideMenuBar}
                      data-testid="toggle-hide-menu-bar"
                    />
                  </div>
                  <div className="px-4 py-4 flex items-center justify-between">
                    <span className="text-[13.5px] text-[#e0e0e0] font-normal">Minimize to system tray</span>
                    <SignalToggle
                      checked={minimizeToTray}
                      onChange={setMinimizeToTray}
                      data-testid="toggle-minimize-to-tray"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Permissions Section */}
              <div>
                <h3 className="text-[13px] font-semibold text-[#8e8e93] mb-2.5 px-1">
                  Permissions
                </h3>
                <div
                  style={{ backgroundColor: "#242426", borderColor: "#343438" }}
                  className="border rounded-2xl overflow-hidden"
                >
                  <div
                    style={{ borderColor: "#323236" }}
                    className="px-4 py-4 flex items-center justify-between border-b"
                  >
                    <span className="text-[13.5px] text-[#e0e0e0] font-normal">Allow access to the microphone</span>
                    <SignalToggle
                      checked={allowMic}
                      onChange={setAllowMic}
                      data-testid="toggle-allow-mic"
                    />
                  </div>
                  <div className="px-4 py-4 flex items-center justify-between">
                    <span className="text-[13.5px] text-[#e0e0e0] font-normal">Allow access to the camera</span>
                    <SignalToggle
                      checked={allowCamera}
                      onChange={setAllowCamera}
                      data-testid="toggle-allow-camera"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Updates Section */}
              <div>
                <h3 className="text-[13px] font-semibold text-[#8e8e93] mb-2.5 px-1">
                  Updates
                </h3>
                <div
                  style={{ backgroundColor: "#242426", borderColor: "#343438" }}
                  className="border rounded-2xl overflow-hidden"
                >
                  <div className="px-4 py-4 flex items-center justify-between">
                    <span className="text-[13.5px] text-[#e0e0e0] font-normal">Automatically download updates</span>
                    <SignalToggle
                      checked={autoDownloadUpdates}
                      onChange={setAutoDownloadUpdates}
                      data-testid="toggle-auto-updates"
                    />
                  </div>
                </div>
              </div>

              {/* 5. Delete Application Data Card */}
              <div
                style={{ backgroundColor: "#242426", borderColor: "#343438" }}
                className="border rounded-2xl px-4 py-4 flex items-center justify-between gap-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] font-medium text-white">
                    Delete application data
                  </div>
                  <div className="text-[12px] text-[#8e8e93] mt-0.5 leading-normal">
                    This will delete all data in the application, removing all messages and saved account information.
                  </div>
                </div>
                <button
                  type="button"
                  data-testid="delete-application-data-btn"
                  onClick={() => setIsDeleteDataModalOpen(true)}
                  style={{
                    backgroundColor: "#351e1e",
                    color: "#f25c54",
                    borderColor: "#522929",
                  }}
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer shrink-0 border hover:brightness-110"
                >
                  Delete data
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: APPEARANCE (Pixel-matched to user's screenshot)                    */}
          {/* ========================================================================= */}
          {activeSettingsTab === "appearance" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] shadow-xs space-y-5">
                {/* 1. Language */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <SignalGlobeIcon className="w-5 h-5 text-[var(--text-secondary)] shrink-0" />
                    <span className="text-sm font-medium text-[var(--text-primary)]">Language</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors">
                    <span>{language}</span>
                    <span className="text-sm font-light leading-none">›</span>
                  </div>
                </div>

                {/* 2. Theme */}
                <div className="flex items-center justify-between relative">
                  <div className="flex items-center gap-3.5">
                    <SignalThemeHalfCircleIcon className="w-5 h-5 text-[var(--text-secondary)] shrink-0" />
                    <span className="text-sm font-medium text-[var(--text-primary)]">Theme</span>
                  </div>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
                      className="bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--border-primary)] text-xs font-medium px-3.5 py-1.5 rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <span className="capitalize">{themePreference}</span>
                      <span className="text-[10px] text-[var(--text-muted)]">⌵</span>
                    </button>

                    {isThemeDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setIsThemeDropdownOpen(false)}
                        />
                        <div className="absolute right-0 top-full mt-1.5 w-32 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95">
                          {(["system", "dark", "light"] as const).map((mode) => (
                            <button
                              key={mode}
                              type="button"
                              onClick={() => {
                                setThemePreference(mode);
                                setIsThemeDropdownOpen(false);
                              }}
                              className={`w-full px-3 py-1.5 text-xs text-left capitalize flex items-center justify-between hover:bg-[var(--bg-hover)] transition-colors ${
                                themePreference === mode
                                  ? "text-[var(--signal-ultramarine)] font-semibold"
                                  : "text-[var(--text-primary)]"
                              }`}
                            >
                              <span>{mode}</span>
                              {themePreference === mode && <span>✓</span>}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* 3. Chat color */}
                <div className="flex items-center justify-between relative">
                  <div className="flex items-center gap-3.5">
                    <SignalPaletteIcon className="w-5 h-5 text-[var(--text-secondary)] shrink-0" />
                    <span className="text-sm font-medium text-[var(--text-primary)]">Chat color</span>
                  </div>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsColorDropdownOpen(!isColorDropdownOpen)}
                      title="Choose chat color"
                      className="w-4 h-4 rounded-full shadow-xs cursor-pointer hover:scale-125 transition-transform border border-black/10 dark:border-white/20"
                      style={{ backgroundColor: chatColor }}
                    />

                    {isColorDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setIsColorDropdownOpen(false)}
                        />
                        <div className="absolute right-0 top-full mt-2 p-2.5 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl shadow-xl z-50 flex items-center gap-2 animate-in fade-in zoom-in-95">
                          {colorPalette.map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => {
                                setChatColor(color);
                                setIsColorDropdownOpen(false);
                              }}
                              className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-125"
                              style={{
                                backgroundColor: color,
                                borderColor: chatColor === color ? "var(--text-primary)" : "transparent",
                              }}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* 4. Zoom level */}
                <div className="flex items-center justify-between relative">
                  <div className="flex items-center gap-3.5">
                    <SignalZoomIcon className="w-5 h-5 text-[var(--text-secondary)] shrink-0" />
                    <span className="text-sm font-medium text-[var(--text-primary)]">Zoom level</span>
                  </div>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsZoomDropdownOpen(!isZoomDropdownOpen)}
                      className="bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--border-primary)] text-xs font-medium px-3.5 py-1.5 rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <span>{zoomLevel}</span>
                      <span className="text-[10px] text-[var(--text-muted)]">⌵</span>
                    </button>

                    {isZoomDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setIsZoomDropdownOpen(false)}
                        />
                        <div className="absolute right-0 top-full mt-1.5 w-24 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95">
                          {["80%", "90%", "100%", "110%", "125%"].map((lvl) => (
                            <button
                              key={lvl}
                              type="button"
                              onClick={() => {
                                setZoomLevel(lvl);
                                setIsZoomDropdownOpen(false);
                              }}
                              className={`w-full px-3 py-1.5 text-xs text-left flex items-center justify-between hover:bg-[var(--bg-hover)] transition-colors ${
                                zoomLevel === lvl
                                  ? "text-[var(--signal-ultramarine)] font-semibold"
                                  : "text-[var(--text-primary)]"
                              }`}
                            >
                              <span>{lvl}</span>
                              {zoomLevel === lvl && <span>✓</span>}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: CHATS                                                              */}
          {/* ========================================================================= */}
          {activeSettingsTab === "chats" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-[var(--text-primary)]">Press Enter to send</div>
                    <div className="text-xs text-[var(--text-secondary)]">Use Shift+Enter for a new line</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={enterToSend}
                    onChange={(e) => setEnterToSend(e.target.checked)}
                    className="w-4 h-4 accent-[var(--signal-ultramarine)] cursor-pointer"
                  />
                </div>
                <hr className="border-[var(--border-primary)]" />
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-[var(--text-primary)]">Media auto-download</div>
                    <div className="text-xs text-[var(--text-secondary)]">Automatically download images and voice notes</div>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-[var(--signal-ultramarine)] cursor-pointer" />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: CALLS                                                              */}
          {/* ========================================================================= */}
          {activeSettingsTab === "calls" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-[var(--text-primary)]">Always relay calls</div>
                    <div className="text-xs text-[var(--text-secondary)]">Relay all calls through Signal servers to avoid revealing IP address</div>
                  </div>
                  <input type="checkbox" className="w-4 h-4 accent-[var(--signal-ultramarine)] cursor-pointer" />
                </div>
                <hr className="border-[var(--border-primary)]" />
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-[var(--text-primary)]">Microphone & Camera</div>
                    <div className="text-xs text-[var(--text-secondary)]">Permissions granted</div>
                  </div>
                  <span className="text-xs text-emerald-500 font-medium">Ready</span>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 6: NOTIFICATIONS                                                      */}
          {/* ========================================================================= */}
          {activeSettingsTab === "notifications" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-[var(--text-primary)]">Play notification sound</div>
                    <div className="text-xs text-[var(--text-secondary)]">Play authentic Signal notification chime on incoming messages</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={soundEnabled}
                    onChange={(e) => setSoundEnabled(e.target.checked)}
                    className="w-4 h-4 accent-[var(--signal-ultramarine)] cursor-pointer"
                  />
                </div>
                <hr className="border-[var(--border-primary)]" />
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-[var(--text-primary)]">Notification Content</div>
                    <div className="text-xs text-[var(--text-secondary)]">Show sender name and message preview</div>
                  </div>
                  <span className="text-xs text-[var(--text-muted)]">Name & Message</span>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 7: PRIVACY                                                            */}
          {/* ========================================================================= */}
          {activeSettingsTab === "privacy" && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-[var(--text-primary)]">Read receipts</div>
                    <div className="text-xs text-[var(--text-secondary)]">If disabled, you won&apos;t be able to see read receipts from others.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={readReceipts}
                    onChange={(e) => setReadReceipts(e.target.checked)}
                    className="w-4 h-4 accent-[var(--signal-ultramarine)] cursor-pointer"
                  />
                </div>
                <hr className="border-[var(--border-primary)]" />
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-[var(--text-primary)]">Typing indicators</div>
                    <div className="text-xs text-[var(--text-secondary)]">If disabled, you won&apos;t be able to see typing indicators from others.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={typingIndicators}
                    onChange={(e) => setTypingIndicators(e.target.checked)}
                    className="w-4 h-4 accent-[var(--signal-ultramarine)] cursor-pointer"
                  />
                </div>
              </div>

              {/* Blocked Contacts */}
              <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] shadow-xs space-y-3">
                <div className="text-sm font-semibold text-[var(--text-primary)]">Blocked contacts ({blockedUserIds.length})</div>
                {blockedUserIds.length === 0 ? (
                  <div className="text-xs text-[var(--text-secondary)]">No blocked contacts.</div>
                ) : (
                  <div className="space-y-2">
                    {blockedUserIds.map((id) => {
                      const contact = contacts.find((c) => c.id === id);
                      return (
                        <div key={id} className="flex items-center justify-between py-1">
                          <span className="text-sm text-[var(--text-primary)]">{contact?.display_name || id}</span>
                          <button
                            type="button"
                            onClick={() => toggleBlockUser(id)}
                            className="px-2.5 py-1 text-xs rounded-md bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--border-primary)] transition-colors cursor-pointer"
                          >
                            Unblock
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 8: DATA USAGE                                                         */}
          {/* ========================================================================= */}
          {activeSettingsTab === "data_usage" && (
            <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] shadow-xs space-y-3">
              <div className="text-sm font-semibold text-[var(--text-primary)]">Network Activity</div>
              <div className="flex justify-between text-xs text-[var(--text-secondary)]">
                <span>Sent messages</span>
                <span className="text-[var(--text-primary)] font-medium">Real-time WebSocket</span>
              </div>
              <div className="flex justify-between text-xs text-[var(--text-secondary)]">
                <span>Data encryption</span>
                <span className="text-emerald-500 font-medium">Simulated E2EE active</span>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 9: BACKUPS                                                            */}
          {/* ========================================================================= */}
          {activeSettingsTab === "backups" && (
            <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] shadow-xs space-y-3">
              <div className="text-sm font-semibold text-[var(--text-primary)]">Chat Backups</div>
              <p className="text-xs text-[var(--text-secondary)]">
                Export an encrypted local backup archive of your conversations and media.
              </p>
              <button
                type="button"
                onClick={() => {
                  setBackupStatus("Backup saved to local storage");
                  setTimeout(() => setBackupStatus(null), 3000);
                }}
                className="px-4 py-2 rounded-xl bg-[var(--signal-ultramarine)] text-white text-xs font-semibold hover:brightness-110 cursor-pointer"
              >
                {backupStatus ? "Backup Created ✓" : "Create Backup Now"}
              </button>
              {backupStatus && (
                <p className="text-xs text-emerald-500 font-medium">{backupStatus}</p>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 10: DONATE TO SIGNAL                                                  */}
          {/* ========================================================================= */}
          {activeSettingsTab === "donate" && (
            <div className="p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] shadow-xs text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-pink-500/10 text-pink-500 flex items-center justify-center mx-auto">
                <SignalSettingsHeartIcon className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <div className="text-base font-bold text-[var(--text-primary)]">Donate to Signal</div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Signal is a nonprofit. There are no ads, no trackers, and no investors. Privacy isn&apos;t an optional mode — it&apos;s just the way Signal works.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setDonateStatus("Thank you for supporting Signal! ❤️");
                  setTimeout(() => setDonateStatus(null), 3000);
                }}
                className="px-6 py-2 rounded-full bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                {donateStatus || "Become a Sustainer"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete All Data Confirmation Modal (Pixel-matched to user's screenshot) */}
      {isDeleteDataModalOpen && (
        <div
          data-testid="delete-all-data-modal"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.65)" }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setIsDeleteDataModalOpen(false)}
        >
          <div
            data-testid="delete-all-data-dialog"
            style={{
              maxWidth: "410px",
              width: "100%",
              backgroundColor: "#2c2c2e",
              borderColor: "#3c3c3e",
            }}
            className="border rounded-[24px] p-6 text-center shadow-2xl animate-in zoom-in-95 duration-150 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-[17px] font-bold text-white mb-2.5">
              Delete all data?
            </h3>
            <p
              style={{ color: "#a5a5ab" }}
              className="text-[13.5px] leading-relaxed mb-6 px-1"
            >
              Delete all data and messages from this version of Signal Desktop? Your Signal account and data on your phone or other linked devices will not be deleted.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                data-testid="cancel-delete-data-btn"
                onClick={() => setIsDeleteDataModalOpen(false)}
                style={{ backgroundColor: "#424244" }}
                className="flex-1 py-2.5 rounded-full text-white text-sm font-semibold transition-all hover:brightness-110 cursor-pointer border-0"
              >
                Cancel
              </button>
              <button
                type="button"
                data-testid="confirm-delete-data-btn"
                onClick={handleConfirmDeleteAllData}
                style={{ backgroundColor: "#d64933" }}
                className="flex-1 py-2.5 rounded-full text-white text-sm font-semibold transition-all hover:brightness-110 cursor-pointer border-0"
              >
                Delete data
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
