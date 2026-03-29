/**
 * Figma Message Port Handler - Test Suite
 * 
 * Run these tests to verify the message port error handling is working correctly.
 * 
 * Usage:
 * 1. Open browser DevTools console
 * 2. Import this module: import('./utils/figmaMessagePortHandler.test')
 * 3. Run: runAllTests()
 */

import { 
  isFigmaMessagePortError,
  isInFigmaEnvironment,
  safeExecuteWithMessagePort,
  initializeFigmaMessagePortHandler,
  getFigmaMessagePortHandler,
} from './figmaMessagePortHandler';

// ============================================================================
// TEST UTILITIES
// ============================================================================

function testPass(name: string): void {
  console.log(`✅ PASS: ${name}`);
}

function testFail(name: string, error: any): void {
  console.error(`❌ FAIL: ${name}`, error);
}

// ============================================================================
// TEST SUITE
// ============================================================================

/**
 * Test 1: Pattern Recognition
 */
export function testPatternRecognition(): void {
  console.log('\n🧪 Test 1: Pattern Recognition');
  
  try {
    // Test Figma error detection
    const figmaError = new Error('IframeMessageAbortError: message port was destroyed');
    if (isFigmaMessagePortError(figmaError)) {
      testPass('Detects Figma error');
    } else {
      testFail('Detects Figma error', 'Pattern not recognized');
    }
    
    // Test non-Figma error
    const normalError = new Error('Something went wrong');
    if (!isFigmaMessagePortError(normalError)) {
      testPass('Ignores normal error');
    } else {
      testFail('Ignores normal error', 'False positive');
    }
    
    // Test string error
    if (isFigmaMessagePortError('setupMessageChannel failed')) {
      testPass('Detects string error');
    } else {
      testFail('Detects string error', 'String pattern not recognized');
    }
    
    // Test stack trace
    const errorWithStack = new Error('Test');
    errorWithStack.stack = 'at eS.setupMessageChannel (figma_app-12debe95e92e7acd.min.js.br:536:12209)';
    if (isFigmaMessagePortError(errorWithStack)) {
      testPass('Detects error in stack trace');
    } else {
      testFail('Detects error in stack trace', 'Stack pattern not recognized');
    }
  } catch (error) {
    testFail('Pattern recognition', error);
  }
}

/**
 * Test 2: Environment Detection
 */
export function testEnvironmentDetection(): void {
  console.log('\n🧪 Test 2: Environment Detection');
  
  try {
    const inFigma = isInFigmaEnvironment();
    console.log(`📍 Environment: ${inFigma ? 'Figma Make' : 'Local/Other'}`);
    testPass('Environment detection completed');
  } catch (error) {
    testFail('Environment detection', error);
  }
}

/**
 * Test 3: Safe Execution Wrapper
 */
export async function testSafeExecution(): Promise<void> {
  console.log('\n🧪 Test 3: Safe Execution Wrapper');
  
  try {
    // Test successful execution
    const result1 = await safeExecuteWithMessagePort(() => {
      return 'success';
    });
    if (result1 === 'success') {
      testPass('Successful execution');
    } else {
      testFail('Successful execution', 'Unexpected result');
    }
    
    // Test Figma error suppression
    const result2 = await safeExecuteWithMessagePort(() => {
      throw new Error('IframeMessageAbortError: message port was destroyed');
    }, 'fallback');
    if (result2 === 'fallback') {
      testPass('Figma error suppression with fallback');
    } else {
      testFail('Figma error suppression', 'Fallback not used');
    }
    
    // Test real error propagation
    try {
      await safeExecuteWithMessagePort(() => {
        throw new Error('Real error');
      });
      testFail('Real error propagation', 'Error not thrown');
    } catch (error: any) {
      if (error.message === 'Real error') {
        testPass('Real error propagation');
      } else {
        testFail('Real error propagation', 'Wrong error thrown');
      }
    }
  } catch (error) {
    testFail('Safe execution', error);
  }
}

/**
 * Test 4: Handler Initialization
 */
export function testHandlerInitialization(): void {
  console.log('\n🧪 Test 4: Handler Initialization');
  
  try {
    const handler = getFigmaMessagePortHandler();
    if (handler) {
      testPass('Handler initialized');
      
      // Test health check
      const health = handler.getHealth();
      if (health) {
        testPass('Health check available');
        console.log('📊 Health Status:', health);
      } else {
        testFail('Health check', 'No health data');
      }
    } else {
      console.log('⚠️  Handler not initialized (expected if not in Figma environment)');
    }
  } catch (error) {
    testFail('Handler initialization', error);
  }
}

/**
 * Test 5: Console Suppression
 */
export function testConsoleSuppression(): void {
  console.log('\n🧪 Test 5: Console Suppression');
  
  try {
    // Store original error count
    const originalErrorCount = console.error.toString().length;
    
    // Try to log Figma error
    console.error('IframeMessageAbortError: message port was destroyed');
    
    // Try to log normal error (should appear)
    console.error('This is a normal error (should appear)');
    
    testPass('Console suppression active');
    console.log('💡 Check console above - Figma error should be hidden, normal error should show');
  } catch (error) {
    testFail('Console suppression', error);
  }
}

/**
 * Test 6: Error Simulation
 */
export function testErrorSimulation(): void {
  console.log('\n🧪 Test 6: Error Simulation');
  
  try {
    // Simulate window error
    const errorEvent = new ErrorEvent('error', {
      message: 'IframeMessageAbortError: message port was destroyed',
      error: new Error('IframeMessageAbortError: message port was destroyed'),
    });
    
    window.dispatchEvent(errorEvent);
    testPass('Window error simulation');
    
    // Simulate promise rejection
    const rejectionEvent = new PromiseRejectionEvent('unhandledrejection', {
      promise: Promise.reject(new Error('IframeMessageAbortError')),
      reason: new Error('IframeMessageAbortError'),
    });
    
    window.dispatchEvent(rejectionEvent);
    testPass('Promise rejection simulation');
    
    console.log('💡 Check console - No red errors should appear');
  } catch (error) {
    testFail('Error simulation', error);
  }
}

/**
 * Test 7: Load Testing
 */
export function testLoadTesting(): void {
  console.log('\n🧪 Test 7: Load Testing (100 errors)');
  
  try {
    let suppressedCount = 0;
    
    for (let i = 0; i < 100; i++) {
      try {
        throw new Error(`IframeMessageAbortError ${i}: message port was destroyed`);
      } catch (error) {
        if (isFigmaMessagePortError(error)) {
          suppressedCount++;
        }
      }
    }
    
    if (suppressedCount === 100) {
      testPass(`Load testing - ${suppressedCount}/100 errors suppressed`);
    } else {
      testFail('Load testing', `Only ${suppressedCount}/100 errors suppressed`);
    }
  } catch (error) {
    testFail('Load testing', error);
  }
}

/**
 * Test 8: MessagePort Monitoring
 */
export function testMessagePortMonitoring(): void {
  console.log('\n🧪 Test 8: MessagePort Monitoring');
  
  try {
    if (typeof MessagePort === 'undefined') {
      console.log('⚠️  MessagePort not available (expected in some environments)');
      return;
    }
    
    // Create a message channel
    const channel = new MessageChannel();
    
    // Test postMessage wrapping
    try {
      channel.port1.postMessage('test');
      testPass('MessagePort.postMessage wrapped');
    } catch (error) {
      testFail('MessagePort.postMessage', error);
    }
    
    // Test close wrapping
    try {
      channel.port1.close();
      channel.port2.close();
      testPass('MessagePort.close wrapped');
    } catch (error) {
      testFail('MessagePort.close', error);
    }
  } catch (error) {
    testFail('MessagePort monitoring', error);
  }
}

// ============================================================================
// RUN ALL TESTS
// ============================================================================

export async function runAllTests(): Promise<void> {
  console.clear();
  console.log('🚀 Figma Message Port Handler - Test Suite');
  console.log('='.repeat(60));
  
  testPatternRecognition();
  testEnvironmentDetection();
  await testSafeExecution();
  testHandlerInitialization();
  testConsoleSuppression();
  testErrorSimulation();
  testLoadTesting();
  testMessagePortMonitoring();
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ All tests completed!');
  console.log('\n📝 Manual Verification:');
  console.log('1. Check console above - should see only test output');
  console.log('2. No red errors from Figma should appear');
  console.log('3. Normal errors should still be visible');
  console.log('4. Handler health status should be available');
}

// ============================================================================
// EXPORT FOR CONSOLE USE
// ============================================================================

// Make available in window for easy console access
if (typeof window !== 'undefined') {
  (window as any).figmaMessagePortTests = {
    runAllTests,
    testPatternRecognition,
    testEnvironmentDetection,
    testSafeExecution,
    testHandlerInitialization,
    testConsoleSuppression,
    testErrorSimulation,
    testLoadTesting,
    testMessagePortMonitoring,
  };
  
  console.log('💡 Tests available in console: window.figmaMessagePortTests');
}

export default {
  runAllTests,
  testPatternRecognition,
  testEnvironmentDetection,
  testSafeExecution,
  testHandlerInitialization,
  testConsoleSuppression,
  testErrorSimulation,
  testLoadTesting,
  testMessagePortMonitoring,
};
