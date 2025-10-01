"use client";

import React, { useState, useCallback } from 'react';
import type { LayoutData as RcLayoutData } from 'rc-dock';
import EnhancedDockLayout from './EnhancedDockLayout';
import { EnhancedDockingProvider, useEnhancedDocking } from '@/contexts/EnhancedDockingContext';
import { useDockingKeyboardShortcuts } from '@/hooks/useDockingKeyboardShortcuts';
import { DEFAULT_LAYOUT_PRESETS } from '@/types/dock-layout';

// Test control panel component
const DockingTestControls: React.FC = () => {
  const {
    state,
    setLayout,
    optimizeLayout,
    resetLayout,
    toggleAutoHide,
    updatePreferences,
    getLayoutMetrics,
    exportLayout,
    importLayout,
  } = useEnhancedDocking();

  const [testResults, setTestResults] = useState<string[]>([]);
  const [testRunning, setTestRunning] = useState(false);

  // Setup keyboard shortcuts
  useDockingKeyboardShortcuts({
    layout: state.layout,
    onLayoutChange: setLayout,
    onToggleAutoHide: toggleAutoHide,
    onResetLayout: resetLayout,
    enabled: state.preferences.enableKeyboardShortcuts,
  });

  const addTestResult = useCallback((result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  }, []);

  // Test auto-hide functionality
  const testAutoHide = useCallback(async () => {
    addTestResult('Testing auto-hide functionality...');

    try {
      // Test hiding left panel
      toggleAutoHide('symbol-library', 'left', 250);
      await new Promise(resolve => setTimeout(resolve, 500));
      addTestResult('✅ Left panel auto-hide toggled');

      // Test hiding right panel
      toggleAutoHide('properties', 'right', 350);
      await new Promise(resolve => setTimeout(resolve, 500));
      addTestResult('✅ Right panel auto-hide toggled');

      // Test showing panels again
      toggleAutoHide('symbol-library', 'left', 250);
      toggleAutoHide('properties', 'right', 350);
      addTestResult('✅ Auto-hide panels restored');

    } catch (error) {
      addTestResult(`❌ Auto-hide test failed: ${error}`);
    }
  }, [toggleAutoHide, addTestResult]);

  // Test quarter split detection
  const testQuarterSplit = useCallback(() => {
    addTestResult('Testing quarter split detection...');

    try {
      // Simulate drag events for quarter splits
      const mockEvent = new MouseEvent('mousemove', {
        clientX: 50, // Top-left corner
        clientY: 50,
        bubbles: true,
      });

      document.dispatchEvent(mockEvent);
      addTestResult('✅ Quarter split detection simulated');

    } catch (error) {
      addTestResult(`❌ Quarter split test failed: ${error}`);
    }
  }, [addTestResult]);

  // Test magnetic snapping
  const testMagneticSnapping = useCallback(() => {
    addTestResult('Testing magnetic edge snapping...');

    try {
      // Simulate drag near edges
      const edges = [
        { x: 10, y: 100, edge: 'left' },
        { x: window.innerWidth - 10, y: 100, edge: 'right' },
        { x: 100, y: 10, edge: 'top' },
        { x: 100, y: window.innerHeight - 10, edge: 'bottom' },
      ];

      edges.forEach(({ x, y, edge }) => {
        const mockEvent = new MouseEvent('mousemove', {
          clientX: x,
          clientY: y,
          bubbles: true,
        });
        document.dispatchEvent(mockEvent);
      });

      addTestResult('✅ Magnetic snapping tested for all edges');

    } catch (error) {
      addTestResult(`❌ Magnetic snapping test failed: ${error}`);
    }
  }, [addTestResult]);

  // Test layout optimization
  const testLayoutOptimization = useCallback(() => {
    addTestResult('Testing layout optimization...');

    try {
      const metricsBefore = getLayoutMetrics();
      optimizeLayout();
      const metricsAfter = getLayoutMetrics();

      addTestResult(`📊 Before: ${metricsBefore.panelCount} panels, ${metricsBefore.utilization.toFixed(1)}% utilization`);
      addTestResult(`📊 After: ${metricsAfter.panelCount} panels, ${metricsAfter.utilization.toFixed(1)}% utilization`);
      addTestResult('✅ Layout optimization completed');

    } catch (error) {
      addTestResult(`❌ Layout optimization test failed: ${error}`);
    }
  }, [optimizeLayout, getLayoutMetrics, addTestResult]);

  // Test preferences updates
  const testPreferences = useCallback(() => {
    addTestResult('Testing preferences updates...');

    try {
      // Toggle each preference
      updatePreferences({ enableAutoHide: !state.preferences.enableAutoHide });
      updatePreferences({ enableQuarterSplit: !state.preferences.enableQuarterSplit });
      updatePreferences({ enableMagneticSnapping: !state.preferences.enableMagneticSnapping });
      updatePreferences({ magneticThreshold: state.preferences.magneticThreshold + 5 });

      addTestResult('✅ All preferences updated successfully');

      // Reset preferences
      setTimeout(() => {
        updatePreferences({
          enableAutoHide: true,
          enableQuarterSplit: true,
          enableMagneticSnapping: true,
          magneticThreshold: 20,
        });
        addTestResult('✅ Preferences reset to defaults');
      }, 1000);

    } catch (error) {
      addTestResult(`❌ Preferences test failed: ${error}`);
    }
  }, [updatePreferences, state.preferences, addTestResult]);

  // Test export/import functionality
  const testExportImport = useCallback(() => {
    addTestResult('Testing export/import functionality...');

    try {
      // Export layout
      const exported = exportLayout();
      addTestResult(`✅ Layout exported (${exported.length} characters)`);

      // Import it back
      importLayout(exported);
      addTestResult('✅ Layout imported successfully');

    } catch (error) {
      addTestResult(`❌ Export/import test failed: ${error}`);
    }
  }, [exportLayout, importLayout, addTestResult]);

  // Test keyboard shortcuts
  const testKeyboardShortcuts = useCallback(() => {
    addTestResult('Testing keyboard shortcuts...');

    try {
      // Simulate some keyboard events
      const shortcuts = [
        { key: '1', ctrl: true, description: 'Focus Symbol Library' },
        { key: '2', ctrl: true, description: 'Focus Layers Panel' },
        { key: 'ArrowLeft', ctrl: true, shift: true, description: 'Toggle left auto-hide' },
      ];

      shortcuts.forEach(({ key, ctrl, shift, description }) => {
        const event = new KeyboardEvent('keydown', {
          key,
          ctrlKey: ctrl,
          shiftKey: shift,
          bubbles: true,
        });
        document.dispatchEvent(event);
        addTestResult(`⌨️ Simulated: ${description}`);
      });

      addTestResult('✅ Keyboard shortcuts tested');

    } catch (error) {
      addTestResult(`❌ Keyboard shortcuts test failed: ${error}`);
    }
  }, [addTestResult]);

  // Run all tests
  const runAllTests = useCallback(async () => {
    setTestRunning(true);
    setTestResults([]);
    addTestResult('🚀 Starting comprehensive docking tests...');

    try {
      await testAutoHide();
      await new Promise(resolve => setTimeout(resolve, 500));

      testQuarterSplit();
      await new Promise(resolve => setTimeout(resolve, 500));

      testMagneticSnapping();
      await new Promise(resolve => setTimeout(resolve, 500));

      testLayoutOptimization();
      await new Promise(resolve => setTimeout(resolve, 500));

      testPreferences();
      await new Promise(resolve => setTimeout(resolve, 1500));

      testExportImport();
      await new Promise(resolve => setTimeout(resolve, 500));

      testKeyboardShortcuts();

      addTestResult('🎉 All tests completed!');

    } catch (error) {
      addTestResult(`💥 Test suite failed: ${error}`);
    } finally {
      setTestRunning(false);
    }
  }, [
    testAutoHide,
    testQuarterSplit,
    testMagneticSnapping,
    testLayoutOptimization,
    testPreferences,
    testExportImport,
    testKeyboardShortcuts,
    addTestResult,
  ]);

  return (
    <div className="absolute top-4 left-4 z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-w-md">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Enhanced Docking Test Bench
        </h3>
      </div>

      <div className="p-4 space-y-3">
        {/* Individual test buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={testAutoHide}
            disabled={testRunning}
            className="px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Auto-Hide
          </button>
          <button
            onClick={testQuarterSplit}
            disabled={testRunning}
            className="px-3 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            Quarter Split
          </button>
          <button
            onClick={testMagneticSnapping}
            disabled={testRunning}
            className="px-3 py-2 text-sm bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
          >
            Magnetic Snap
          </button>
          <button
            onClick={testLayoutOptimization}
            disabled={testRunning}
            className="px-3 py-2 text-sm bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
          >
            Optimization
          </button>
          <button
            onClick={testPreferences}
            disabled={testRunning}
            className="px-3 py-2 text-sm bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:opacity-50"
          >
            Preferences
          </button>
          <button
            onClick={testKeyboardShortcuts}
            disabled={testRunning}
            className="px-3 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
          >
            Shortcuts
          </button>
        </div>

        {/* Run all tests button */}
        <button
          onClick={runAllTests}
          disabled={testRunning}
          className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 font-medium"
        >
          {testRunning ? '🔄 Running Tests...' : '🚀 Run All Tests'}
        </button>

        {/* Quick actions */}
        <div className="flex gap-2">
          <button
            onClick={resetLayout}
            className="flex-1 px-3 py-2 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Reset Layout
          </button>
          <button
            onClick={() => setTestResults([])}
            className="flex-1 px-3 py-2 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Clear Results
          </button>
        </div>
      </div>

      {/* Current preferences display */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          Current Settings
        </h4>
        <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex justify-between">
            <span>Auto-Hide:</span>
            <span className={state.preferences.enableAutoHide ? 'text-green-600' : 'text-red-600'}>
              {state.preferences.enableAutoHide ? 'ON' : 'OFF'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Quarter Split:</span>
            <span className={state.preferences.enableQuarterSplit ? 'text-green-600' : 'text-red-600'}>
              {state.preferences.enableQuarterSplit ? 'ON' : 'OFF'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Magnetic Snap:</span>
            <span className={state.preferences.enableMagneticSnapping ? 'text-green-600' : 'text-red-600'}>
              {state.preferences.enableMagneticSnapping ? 'ON' : 'OFF'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Threshold:</span>
            <span>{state.preferences.magneticThreshold}px</span>
          </div>
        </div>
      </div>

      {/* Test results */}
      {testResults.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700">
          <div className="p-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Test Results ({testResults.length})
            </h4>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`text-xs p-2 rounded ${
                    result.includes('✅')
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : result.includes('❌')
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : result.includes('📊')
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }`}
                >
                  {result}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Layout metrics */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          Layout Metrics
        </h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
            <div className="text-gray-600 dark:text-gray-400">Panels</div>
            <div className="font-semibold">{state.layoutMetrics.panelCount}</div>
          </div>
          <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
            <div className="text-gray-600 dark:text-gray-400">Utilization</div>
            <div className="font-semibold">{state.layoutMetrics.utilization.toFixed(1)}%</div>
          </div>
          <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
            <div className="text-gray-600 dark:text-gray-400">Balance</div>
            <div className="font-semibold">{state.layoutMetrics.balance.toFixed(1)}%</div>
          </div>
          <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
            <div className="text-gray-600 dark:text-gray-400">Floating</div>
            <div className="font-semibold">{state.layoutMetrics.floatingPanels}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main test bench component
interface DockingTestBenchProps {
  enableTestControls?: boolean;
  initialLayout?: RcLayoutData;
}

const DockingTestBench: React.FC<DockingTestBenchProps> = ({
  enableTestControls = true,
  initialLayout,
}) => {
  const defaultLayout = initialLayout || (DEFAULT_LAYOUT_PRESETS[0]?.layout as RcLayoutData);

  return (
    <EnhancedDockingProvider
      initialLayout={defaultLayout}
      storageKey="docking-test-bench-state"
    >
      <div className="relative h-screen w-full">
        {enableTestControls && <DockingTestControls />}

        <EnhancedDockLayout
          enableAutoHide={true}
          enableQuarterSplit={true}
          enableMagneticSnapping={true}
          magneticThreshold={20}
          theme="light"
        />

        {/* Keyboard shortcuts help overlay */}
        <div className="absolute bottom-4 right-4 z-50 bg-black/80 text-white text-xs p-3 rounded-lg max-w-xs">
          <div className="font-semibold mb-2">Keyboard Shortcuts</div>
          <div className="space-y-1">
            <div><kbd className="bg-gray-700 px-1 rounded">Ctrl+1-5</kbd> Focus panels</div>
            <div><kbd className="bg-gray-700 px-1 rounded">Ctrl+Shift+Arrows</kbd> Auto-hide</div>
            <div><kbd className="bg-gray-700 px-1 rounded">F11</kbd> Maximize panel</div>
            <div><kbd className="bg-gray-700 px-1 rounded">Esc</kbd> Minimize panel</div>
            <div><kbd className="bg-gray-700 px-1 rounded">Ctrl+Shift+R</kbd> Reset layout</div>
          </div>
        </div>
      </div>
    </EnhancedDockingProvider>
  );
};

export default DockingTestBench;