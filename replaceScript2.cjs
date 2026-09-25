const fs = require('fs');
let file = 'src/features/sales/components/SalesPosPage/SalesPosPage.tsx';
let c = fs.readFileSync(file, 'utf8');

c = c.replace('deliveryDate: ""', 'deliveryDate: "",\n    isDelivered: false');
c = c.replace('const payload = {', 'const payloadToSubmit = {\n        ...formData,\n        deliveryDate: formData.isDelivered ? formData.saleDate : formData.deliveryDate,\n      };\n\n      if (saleToEdit) {\n        const payload = {\n          ...payloadToSubmit,');
c = c.replace('await SaleService.createSale(formData);', 'await SaleService.createSale(payloadToSubmit);');
c = c.replace('deliveryDate: ""\n      });', 'deliveryDate: "",\n        isDelivered: false\n      });');
c = c.replace('deliveryDate={formData.deliveryDate || ""}', 'deliveryDate={formData.deliveryDate || ""}\n            isDelivered={formData.isDelivered}');

fs.writeFileSync(file, c);
