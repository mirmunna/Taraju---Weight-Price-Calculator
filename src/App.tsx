/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppSettings, AppTab, CalculationHistoryItem, SavedRate } from './types';
import { storage, DEFAULT_SETTINGS } from './services/storage';
import { Header } from './components/Header';
import { Navbar } from './components/Navbar';
import { CalculatorHome } from './components/CalculatorHome';
import { HistoryScreen } from './components/HistoryScreen';
import { SavedRatesScreen } from './components/SavedRatesScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { OfflineIndicator } from './components/OfflineIndicator';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('HOME');
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [history, setHistory] = useState<CalculationHistoryItem[]>([]);
  const [savedRates, setSavedRates] = useState<SavedRate[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Rate selected from rates tab or saved items to be passed to calculator
  const [quickRateSelect, setQuickRateSelect] = useState<SavedRate | null>(null);
  const [reusedCalculation, setReusedCalculation] = useState<CalculationHistoryItem | null>(null);

  // Initialize storage
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [loadedSettings, loadedHistory, loadedRates] = await Promise.all([
          storage.getSettings(),
          storage.getHistory(),
          storage.getSavedRates(),
        ]);
        setSettings(loadedSettings);
        setHistory(loadedHistory);
        setSavedRates(loadedRates);
      } catch (err) {
        console.error('Failed to load initial data from storage', err);
      } finally {
        setIsLoaded(true);
      }
    }

    loadInitialData();
  }, []);

  // Theme application
  useEffect(() => {
    const root = document.documentElement;
    const isDark =
      settings.theme === 'dark' ||
      (settings.theme === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  // Handlers
  const handleUpdateSettings = async (newSettings: AppSettings) => {
    setSettings(newSettings);
    await storage.saveSettings(newSettings);
  };

  const handleAddHistory = async (item: CalculationHistoryItem) => {
    await storage.addHistory(item);
    setHistory((prev) => [item, ...prev]);
  };

  const handleDeleteHistoryItem = async (id: string) => {
    await storage.deleteHistoryItem(id);
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearHistory = async () => {
    await storage.clearHistory();
    setHistory([]);
  };

  const handleSaveRate = async (rate: SavedRate) => {
    await storage.saveRate(rate);
    const updated = await storage.getSavedRates();
    setSavedRates(updated);
  };

  const handleDeleteRate = async (id: string) => {
    await storage.deleteSavedRate(id);
    setSavedRates((prev) => prev.filter((r) => r.id !== id));
  };

  const handleUseRateInCalculator = (rate: SavedRate) => {
    setQuickRateSelect(rate);
    setActiveTab('HOME');
  };

  const handleReuseCalculation = (item: CalculationHistoryItem) => {
    setReusedCalculation(item);
    setActiveTab('HOME');
  };

  const refreshAllData = async () => {
    const [loadedSettings, loadedHistory, loadedRates] = await Promise.all([
      storage.getSettings(),
      storage.getHistory(),
      storage.getSavedRates(),
    ]);
    setSettings(loadedSettings);
    setHistory(loadedHistory);
    setSavedRates(loadedRates);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold uppercase tracking-wider">Loading Taraju...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Offline Alert */}
      <OfflineIndicator />

      {/* Main App Header */}
      <Header
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onOpenRates={() => setActiveTab('RATES')}
        savedRates={savedRates}
        onSelectSavedRate={(rate) => {
          setQuickRateSelect(rate);
          setActiveTab('HOME');
        }}
      />

      {/* Main Screen Content */}
      <main className="flex-1 w-full max-w-2xl mx-auto">
        {activeTab === 'HOME' && (
          <CalculatorHome
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            savedRates={savedRates}
            onAddHistory={handleAddHistory}
            onNavigateToRates={() => setActiveTab('RATES')}
            onNavigateToHistory={() => setActiveTab('HISTORY')}
            externalRateSelection={quickRateSelect}
            externalReusedCalculation={reusedCalculation}
          />
        )}

        {activeTab === 'HISTORY' && (
          <HistoryScreen
            history={history}
            onDeleteHistoryItem={handleDeleteHistoryItem}
            onClearHistory={handleClearHistory}
            onReuseCalculation={handleReuseCalculation}
            settings={settings}
          />
        )}

        {activeTab === 'RATES' && (
          <SavedRatesScreen
            savedRates={savedRates}
            onSaveRate={handleSaveRate}
            onDeleteRate={handleDeleteRate}
            onUseRateInCalculator={handleUseRateInCalculator}
            settings={settings}
          />
        )}

        {activeTab === 'SETTINGS' && (
          <SettingsScreen
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onClearHistory={handleClearHistory}
            onDataImported={refreshAllData}
            historyCount={history.length}
            ratesCount={savedRates.length}
          />
        )}
      </main>

      {/* Persistent Bottom Tab Navigation */}
      <Navbar
        activeTab={activeTab}
        onChangeTab={(tab) => setActiveTab(tab)}
        historyCount={history.length}
        ratesCount={savedRates.length}
      />
    </div>
  );
}
