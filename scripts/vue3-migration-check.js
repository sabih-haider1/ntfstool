#!/usr/bin/env node

/**
 * Vue 3 Migration Helper Script
 * 
 * This script helps identify Vue 2 patterns in your codebase that need
 * to be updated for Vue 3 compatibility.
 */

const fs = require('fs');
const path = require('path');

const issues = [];

function scanDirectory(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
      scanDirectory(fullPath);
    } else if (file.isFile() && (file.name.endsWith('.vue') || file.name.endsWith('.js'))) {
      scanFile(fullPath);
    }
  }
}

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    
    // Check for Vue 2 patterns
    if (line.includes('new Vue(')) {
      issues.push({
        file: filePath,
        line: lineNum,
        type: 'CRITICAL',
        pattern: 'new Vue()',
        message: 'Replace with createApp() from Vue 3',
        suggestion: "import { createApp } from 'vue'\nconst app = createApp(App)"
      });
    }
    
    if (line.includes('Vue.use(')) {
      issues.push({
        file: filePath,
        line: lineNum,
        type: 'CRITICAL',
        pattern: 'Vue.use()',
        message: 'Use app.use() instead',
        suggestion: 'app.use(plugin)'
      });
    }
    
    if (line.includes('new VueRouter(')) {
      issues.push({
        file: filePath,
        line: lineNum,
        type: 'CRITICAL',
        pattern: 'new VueRouter()',
        message: 'Replace with createRouter()',
        suggestion: "import { createRouter, createWebHistory } from 'vue-router'"
      });
    }
    
    if (line.includes('new Vuex.Store(')) {
      issues.push({
        file: filePath,
        line: lineNum,
        type: 'CRITICAL',
        pattern: 'new Vuex.Store()',
        message: 'Replace with createStore()',
        suggestion: "import { createStore } from 'vuex'"
      });
    }
    
    if (line.includes('new VueI18n(')) {
      issues.push({
        file: filePath,
        line: lineNum,
        type: 'CRITICAL',
        pattern: 'new VueI18n()',
        message: 'Replace with createI18n()',
        suggestion: "import { createI18n } from 'vue-i18n'"
      });
    }
    
    if (line.includes('element-ui') || line.includes('ElementUI')) {
      issues.push({
        file: filePath,
        line: lineNum,
        type: 'CRITICAL',
        pattern: 'element-ui',
        message: 'Replace with Element Plus',
        suggestion: "import ElementPlus from 'element-plus'\nimport 'element-plus/dist/index.css'"
      });
    }
    
    if (line.includes('$listeners')) {
      issues.push({
        file: filePath,
        line: lineNum,
        type: 'MAJOR',
        pattern: '$listeners',
        message: '$listeners has been removed. Use $attrs instead',
        suggestion: '$attrs now includes both attributes and event listeners'
      });
    }
    
    if (line.includes('$scopedSlots')) {
      issues.push({
        file: filePath,
        line: lineNum,
        type: 'MAJOR',
        pattern: '$scopedSlots',
        message: '$scopedSlots removed. Use $slots instead',
        suggestion: 'All slots are now functions in $slots'
      });
    }
    
    if (line.match(/destroyed\s*\(/)) {
      issues.push({
        file: filePath,
        line: lineNum,
        type: 'MAJOR',
        pattern: 'destroyed()',
        message: 'Lifecycle hook renamed',
        suggestion: 'Use unmounted() instead of destroyed()'
      });
    }
    
    if (line.match(/beforeDestroy\s*\(/)) {
      issues.push({
        file: filePath,
        line: lineNum,
        type: 'MAJOR',
        pattern: 'beforeDestroy()',
        message: 'Lifecycle hook renamed',
        suggestion: 'Use beforeUnmount() instead of beforeDestroy()'
      });
    }
    
    if (line.match(/v-model\s*=.*\w+\.sync/)) {
      issues.push({
        file: filePath,
        line: lineNum,
        type: 'MAJOR',
        pattern: '.sync modifier',
        message: '.sync modifier removed',
        suggestion: 'Use v-model:propName instead of :propName.sync'
      });
    }
    
    if (line.includes('filters:')) {
      issues.push({
        file: filePath,
        line: lineNum,
        type: 'MAJOR',
        pattern: 'filters',
        message: 'Filters have been removed',
        suggestion: 'Use computed properties or methods instead'
      });
    }
    
    if (line.match(/\|\s*\w+/)) {
      issues.push({
        file: filePath,
        line: lineNum,
        type: 'MINOR',
        pattern: 'filter in template',
        message: 'Template filters removed',
        suggestion: 'Replace {{ value | filter }} with {{ filterMethod(value) }}'
      });
    }
    
    if (line.includes('$on') || line.includes('$off') || line.includes('$once')) {
      issues.push({
        file: filePath,
        line: lineNum,
        type: 'MAJOR',
        pattern: 'Event bus API',
        message: '$on/$off/$once removed from Vue instance',
        suggestion: 'Use mitt or tiny-emitter for event bus functionality'
      });
    }
  });
}

function generateReport() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║          Vue 3 Migration Analysis Report                      ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');
  
  if (issues.length === 0) {
    console.log('✓ No Vue 2 patterns detected! Your code looks Vue 3 ready.\n');
    return;
  }
  
  const criticalIssues = issues.filter(i => i.type === 'CRITICAL');
  const majorIssues = issues.filter(i => i.type === 'MAJOR');
  const minorIssues = issues.filter(i => i.type === 'MINOR');
  
  console.log(`Found ${issues.length} potential issues:\n`);
  console.log(`  🔴 CRITICAL: ${criticalIssues.length} (must fix)`);
  console.log(`  🟡 MAJOR:    ${majorIssues.length} (should fix)`);
  console.log(`  🟢 MINOR:    ${minorIssues.length} (review)\n`);
  
  // Group by file
  const byFile = {};
  issues.forEach(issue => {
    if (!byFile[issue.file]) {
      byFile[issue.file] = [];
    }
    byFile[issue.file].push(issue);
  });
  
  Object.keys(byFile).forEach(file => {
    console.log(`\n📄 ${path.relative(process.cwd(), file)}`);
    console.log('─'.repeat(70));
    
    byFile[file].forEach(issue => {
      const icon = issue.type === 'CRITICAL' ? '🔴' : issue.type === 'MAJOR' ? '🟡' : '🟢';
      console.log(`\n  ${icon} Line ${issue.line}: ${issue.pattern}`);
      console.log(`     ${issue.message}`);
      console.log(`     💡 ${issue.suggestion}`);
    });
  });
  
  console.log('\n\n' + '═'.repeat(70));
  console.log('\n📚 Next Steps:\n');
  console.log('1. Fix all CRITICAL issues (these will break your app)');
  console.log('2. Address MAJOR issues (may cause unexpected behavior)');
  console.log('3. Review MINOR issues (nice to have)');
  console.log('\n4. Update src/renderer/main.js with Vue 3 initialization');
  console.log('5. Update router configuration');
  console.log('6. Update store configuration');
  console.log('7. Replace Element UI with Element Plus');
  console.log('8. Test thoroughly!\n');
  console.log('📖 Full migration guide: https://v3-migration.vuejs.org/\n');
}

// Run the scan
const srcDir = path.join(process.cwd(), 'src');
if (fs.existsSync(srcDir)) {
  scanDirectory(srcDir);
  generateReport();
} else {
  console.error('Error: src directory not found. Run this script from the project root.');
  process.exit(1);
}
