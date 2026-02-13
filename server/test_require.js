const mongoose = require('mongoose');
console.log('Mongoose loaded:', !!mongoose);
const Need = require('./models/Need');
console.log('Need loaded:', !!Need);
const Claim = require('./models/Claim');
console.log('Claim loaded:', !!Claim);
try {
    const ctrl = require('./controllers/marketplaceController');
    console.log('Controller loaded:', !!ctrl);
} catch (e) {
    console.error('Controller load failed:', e);
}
