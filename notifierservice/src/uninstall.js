var Service = require('node-windows').Service;
// Create a new service object
var svc = new Service({
     name: 'NotifierService',
     script: require('path').join(__dirname, 'notifier.js')
});

svc.on('uninstall', function () {
     console.log('Uninstall complete.');
     console.log('The service exists: ', svc.exists);
});

// Uninstall the service.
svc.uninstall();
