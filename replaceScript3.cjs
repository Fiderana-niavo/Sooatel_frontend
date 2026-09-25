const fs = require('fs');
let file = 'src/features/sales/components/SalesPosPage/SalesPosPage.tsx';
let c = fs.readFileSync(file, 'utf8');

c = c.replace('deliveryDate: ""\r\n  });', 'deliveryDate: "",\r\n    isDelivered: false\r\n  });');

c = c.replace('if (saleToEdit) {\r\n        const payload = {\r\n          ...formData,', 'const payloadToSubmit = {\r\n        ...formData,\r\n        deliveryDate: formData.isDelivered ? formData.saleDate : formData.deliveryDate,\r\n      };\r\n\r\n      if (saleToEdit) {\r\n        const payload = {\r\n          ...payloadToSubmit,');

c = c.replace('await SaleService.createSale(formData);', 'await SaleService.createSale(payloadToSubmit);');

c = c.replace('deliveryDate: ""\r\n      });', 'deliveryDate: "",\r\n        isDelivered: false\r\n      });');

c = c.replace('deliveryDate={formData.deliveryDate || ""}\r\n            onLocationChange=', 'deliveryDate={formData.deliveryDate || ""}\r\n            isDelivered={formData.isDelivered}\r\n            onLocationChange=');

fs.writeFileSync(file, c);
