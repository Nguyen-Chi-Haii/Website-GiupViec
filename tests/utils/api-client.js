/**
 * API Client Utility
 * Shared functions for making API calls
 */

const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:5217/api';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function apiCall(method, endpoint, data = null, token = null) {
  try {
    const config = {
      method,
      url: `${API_URL}${endpoint}`,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      validateStatus: () => true // Don't throw on any status
    };
    
    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    
    // Extract error message from various possible formats
    let errorMessage = null;
    if (response.status >= 400) {
      if (typeof response.data === 'string') {
        errorMessage = response.data;
      } else if (response.data?.message) {
        errorMessage = response.data.message;
      } else if (response.data?.error) {
        errorMessage = response.data.error;
      } else if (response.data?.title) {
        errorMessage = response.data.title;
      } else {
        errorMessage = response.statusText || `HTTP ${response.status}`;
      }
    }

    // Debug logging (enable with DEBUG=1 environment variable)
    if (process.env.DEBUG) {
      console.log(`[DEBUG] ${method} ${endpoint} -> ${response.status}`);
      if (errorMessage) console.log(`[DEBUG] Error: ${errorMessage}`);
    }
    
    return { 
      success: response.status >= 200 && response.status < 300,
      status: response.status,
      data: response.data,
      error: errorMessage
    };
  } catch (error) {
    // Network or other errors
    if (process.env.DEBUG) {
      console.log(`[DEBUG] Request failed: ${error.message}`);
    }
    
    return { 
      success: false,
      status: 0,
      data: null,
      error: `Network error: ${error.message}`
    };
  }
}

// Test result tracking
class TestRunner {
  constructor(suiteName) {
    this.suiteName = suiteName;
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  async run(testName, testFn) {
    log(`\n📝 ${testName}`, 'blue');
    try {
      const result = await testFn();
      if (result) {
        this.passed++;
        log(`✅ PASS`, 'green');
        return true;
      } else {
        this.failed++;
        log(`❌ FAIL`, 'red');
        return false;
      }
    } catch (error) {
      this.failed++;
      log(`❌ FAIL: ${error.message}`, 'red');
      console.error(error.stack);
      return false;
    }
  }

  printSummary() {
    const total = this.passed + this.failed;
    log('\n' + '='.repeat(60), 'blue');
    log(`📊 ${this.suiteName} - KẾT QUẢ`, 'blue');
    log('='.repeat(60), 'blue');
    log(`✅ Passed: ${this.passed}/${total}`, this.passed === total ? 'green' : 'yellow');
    log(`❌ Failed: ${this.failed}/${total}`, this.failed > 0 ? 'red' : 'green');
    log(`📈 Success Rate: ${((this.passed / total) * 100).toFixed(1)}%`, 'cyan');
    log('='.repeat(60), 'blue');
  }

  exitCode() {
    return this.failed > 0 ? 1 : 0;
  }
}

// Assertion helpers
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected}, got ${actual}`);
  }
}

function assertNotNull(value, message) {
  if (value === null || value === undefined) {
    throw new Error(message || 'Value is null or undefined');
  }
}

function assertArrayLength(array, length, message) {
  if (!Array.isArray(array) || array.length !== length) {
    throw new Error(message || `Expected array of length ${length}, got ${array?.length}`);
  }
}

module.exports = {
  apiCall,
  log,
  colors,
  TestRunner,
  assert,
  assertEqual,
  assertNotNull,
  assertArrayLength,
  API_URL
};
