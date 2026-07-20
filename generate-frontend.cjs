const fs = require('fs');
const path = require('path');

const basePath = 'f:/Stage/Sooatel/Projet_de_stage/Sooatel_frontend/src/features';

const entities = [
  { moduleName: 'events', entity: 'Event', id: 'idEvent', routeName: 'events', dtos: 'eventName: string; startDate: string; endDate?: string;' },
  { moduleName: 'rooms', entity: 'Room', id: 'idRoom', routeName: 'rooms', dtos: 'roomNumber: string; idRoomType: string; description?: string;' },
  { moduleName: 'room-types', entity: 'RoomType', id: 'idRoomType', routeName: 'room-types', dtos: 'label: string; Description?: string;' },
  { moduleName: 'product-prices', entity: 'ProductPrice', id: 'idProductPrice', routeName: 'product-prices', dtos: 'idMenu: string; specialPrice?: number; idRoomType?: string; idEvent?: string;' },
  { moduleName: 'items', entity: 'Item', id: 'idItem', routeName: 'items', dtos: 'ref: string; label: string; isProduced?: boolean; quantity?: number; minimumStockLevel: number; reorderQuantity?: number; isPerishable: boolean; status: number; idProductType: string; idUnit: string; description?: string;' },
  { moduleName: 'unit-of-measures', entity: 'UnitOfMeasure', id: 'idUnit', routeName: 'unit-of-measures', dtos: 'label?: string; symbol?: string;' },
  { moduleName: 'menu-items', entity: 'MenuItem', id: 'idMenu', routeName: 'menu-items', dtos: 'ref: string; idItem: string; salePrice: number; recipeCost?: number; idCategory: string;' },
  { moduleName: 'item-types', entity: 'ItemType', id: 'idProductType', routeName: 'item-types', dtos: 'label?: string; description?: string;' },
  { moduleName: 'menu-categories', entity: 'MenuCategory', id: 'idCategory', routeName: 'menu-categories', dtos: 'label: string; description?: string;' }
];

entities.forEach(config => {
  const dir = path.join(basePath, config.moduleName);
  fs.mkdirSync(path.join(dir, 'services'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'types'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'components'), { recursive: true });

  const upperModuleName = config.entity;
  
  // type
  fs.writeFileSync(path.join(dir, 'types', `index.ts`), `export interface ${upperModuleName} {
  ${config.id}: string;
  ${config.dtos}
  createdAt?: string;
  updatedAt?: string;
}

export interface Create${upperModuleName}Dto {
  ${config.dtos}
}
`);

  // service
  fs.writeFileSync(path.join(dir, 'services', `index.ts`), `import api from "@/services/api";
import type { ${upperModuleName}, Create${upperModuleName}Dto } from "../types";

export class ${upperModuleName}Service {
  static async getAll(params?: { page?: number; limit?: number; search?: string }): Promise<${upperModuleName}[]> {
    const response = await api.get("/${config.routeName}", { params });
    // Handle paginated response if backend returns it
    return response.data.data?.data || response.data.data || [];
  }

  static async getById(id: string): Promise<${upperModuleName}> {
    const response = await api.get(\`/${config.routeName}/\${id}\`);
    return response.data.data;
  }

  static async create(data: Create${upperModuleName}Dto): Promise<${upperModuleName}> {
    const response = await api.post("/${config.routeName}", data);
    return response.data.data;
  }

  static async update(id: string, data: Partial<Create${upperModuleName}Dto>): Promise<${upperModuleName}> {
    const response = await api.put(\`/${config.routeName}/\${id}\`, data);
    return response.data.data;
  }

  static async delete(id: string): Promise<void> {
    await api.delete(\`/${config.routeName}/\${id}\`);
  }
}
`);

  // index
  fs.writeFileSync(path.join(dir, 'index.ts'), `export * from './types';
export * from './services';
`);
});

console.log('Frontend scaffolding complete');
