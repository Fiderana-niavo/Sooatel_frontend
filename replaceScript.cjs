const fs = require('fs');
let file = 'src/features/sales/components/SalesPosPage/SalesPosPage.tsx';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(/deliveryDate: ""(\r?\n)\s*\}/, 'deliveryDate: "",    isDelivered: false  }');

c = c.replace(/if \(saleToEdit\) \{(\r?\n)\s*const payload = \{(\r?\n)\s*\.\.\.formData,/, 'const payloadToSubmit = {        ...formData,        deliveryDate: formData.isDelivered ? formData.saleDate : formData.deliveryDate,      };      if (saleToEdit) {        const payload = {          ...payloadToSubmit,');

c = c.replace(/await SaleService\.createSale\(formData\);/, 'await SaleService.createSale(payloadToSubmit);');

c = c.replace(/deliveryDate: ""(\r?\n)\s*\}\);/, 'deliveryDate: "",        isDelivered: false      });');

c = c.replace(/deliveryDate=\{formData\.deliveryDate \|\| ""\}(\r?\n)\s*onLocationChange=/, 'deliveryDate={formData.deliveryDate || ""}            isDelivered={formData.isDelivered}            onLocationChange=');

fs.writeFileSync(file, c);
