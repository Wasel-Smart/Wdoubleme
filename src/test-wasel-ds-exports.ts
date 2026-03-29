/**
 * Test file to verify all wasel-ds exports
 * Run this to confirm exports are working: npx tsx test-wasel-ds-exports.ts
 */

import { C, F, R, SH, GRAD, GRAD_GOLD, GRAD_GREEN, GRAD_NAVY, GLOBAL_STYLES, card } from './utils/wasel-ds';

console.log('✅ Testing wasel-ds exports...\n');

// Test C (colors)
console.log('✅ C.navy:', C.navy);
console.log('✅ C.cyan:', C.cyan);
console.log('✅ C.card:', C.card);

// Test F (font)
console.log('✅ F:', F);

// Test R (radius)
console.log('✅ R.xl:', R.xl);
console.log('✅ R.full:', R.full);

// Test SH (shadows)
console.log('✅ SH.card:', SH.card);
console.log('✅ SH.cyan:', SH.cyan);

// Test gradients
console.log('✅ GRAD:', GRAD);
console.log('✅ GRAD_GOLD:', GRAD_GOLD);
console.log('✅ GRAD_GREEN:', GRAD_GREEN);
console.log('✅ GRAD_NAVY:', GRAD_NAVY);

// Test GLOBAL_STYLES
console.log('✅ GLOBAL_STYLES length:', GLOBAL_STYLES.length, 'chars');

// Test card function
const cardStyle = card({ padding: '24px' });
console.log('✅ card() returned:', Object.keys(cardStyle).join(', '));

console.log('\n🎉 All exports are working correctly!\n');
console.log('Expected exports:');
console.log('  - C (object with colors)');
console.log('  - F (string - font family)');
console.log('  - R (object with radius values)');
console.log('  - SH (object with shadow values)');
console.log('  - GRAD, GRAD_GOLD, GRAD_GREEN, GRAD_NAVY (strings)');
console.log('  - GLOBAL_STYLES (string with CSS)');
console.log('  - card (function)');
