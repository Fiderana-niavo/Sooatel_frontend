const fs = require('fs');
const path = require('path');

const basePath = 'f:/Stage/Sooatel/Projet_de_stage/Sooatel_backend/src/modules';

const entities = [
  { moduleName: 'events', entity: 'Event', id: 'idEvent', routeName: 'event', label: 'event', searchField: 'eventName', dtos: 'eventName: string; startDate: string | Date; endDate?: string | Date;' },
  { moduleName: 'rooms', entity: 'Room', id: 'idRoom', routeName: 'room', label: 'room', searchField: 'roomNumber', dtos: 'roomNumber: string; idRoomType: string; description?: string;' },
  { moduleName: 'room-types', entity: 'RoomType', id: 'idRoomType', routeName: 'roomType', label: 'room type', searchField: 'label', dtos: 'label: string; Description?: string;' },
  { moduleName: 'product-prices', entity: 'ProductPrice', id: 'idProductPrice', routeName: 'productPrice', label: 'product price', searchField: 'idMenu', dtos: 'idMenu: string; specialPrice?: number; idRoomType?: string; idEvent?: string;' },
  { moduleName: 'items', entity: 'Item', id: 'idItem', routeName: 'item', label: 'item', searchField: 'label', dtos: 'ref: string; label: string; isProduced?: boolean; quantity?: number; minimumStockLevel: number; reorderQuantity?: number; isPerishable: boolean; status: number; idProductType: string; idUnit: string; description?: string;' },
  { moduleName: 'units-of-measure', entity: 'UnitOfMeasure', id: 'idUnit', routeName: 'unitOfMeasure', label: 'unit of measure', searchField: 'label', dtos: 'label?: string; symbol?: string;' },
  { moduleName: 'menu-items', entity: 'MenuItem', id: 'idMenu', routeName: 'menuItem', label: 'menu item', searchField: 'ref', dtos: 'ref: string; idItem: string; salePrice: number; recipeCost?: number; idCategory: string;' },
  { moduleName: 'item-types', entity: 'ItemType', id: 'idProductType', routeName: 'itemType', label: 'item type', searchField: 'label', dtos: 'label?: string; description?: string;' },
  { moduleName: 'menu-categories', entity: 'MenuCategory', id: 'idCategory', routeName: 'menuCategory', label: 'menu category', searchField: 'label', dtos: 'label: string; description?: string;' }
];

entities.forEach(config => {
  const dir = path.join(basePath, config.moduleName);
  fs.mkdirSync(path.join(dir, 'controllers'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'services'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'routes'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'type'), { recursive: true });

  const upperModuleName = config.entity;
  const camelModuleName = config.routeName;

  // dto
  fs.writeFileSync(path.join(dir, 'type', `${config.moduleName}.type.ts`), `export interface ${upperModuleName}Dto {
  ${config.dtos}
}

export interface ${upperModuleName}SearchOptions {
  page?: number;
  limit?: number;
  search?: string;
}
`);

  // service
  fs.writeFileSync(path.join(dir, 'services', `${config.moduleName}.service.ts`), `import { Repository } from "typeorm";
import AppDataSource from "../../../database/data-source";
import { ${upperModuleName} } from "../../../database/Entities/${upperModuleName}";
import { CrudService } from "../../../shared/crud/services/CrudService";
import { Paginated } from "../../../shared/types/Paginated";
import { ${upperModuleName}Dto, ${upperModuleName}SearchOptions } from "../type/${config.moduleName}.type";

export class ${upperModuleName}Service extends CrudService<${upperModuleName}, ${upperModuleName}Dto, ${upperModuleName}Dto> {
  constructor(repository: Repository<${upperModuleName}> = AppDataSource.getRepository(${upperModuleName})) {
    super(repository);
  }

  async findAll(options: ${upperModuleName}SearchOptions = {}): Promise<Paginated<${upperModuleName}>> {
    const pageNum = options.page ?? 1;
    const limitNum = options.limit ?? 10;
    const search = options.search ?? "";

    const qb = this.repository
      .createQueryBuilder("entity")
      .skip((pageNum - 1) * limitNum)
      .take(limitNum);

    if (search) {
      qb.andWhere("entity.${config.searchField} ILIKE :s", { s: \`%\${search}%\` });
    }

    const [records, total] = await qb.getManyAndCount();
    return new Paginated<${upperModuleName}>(records, total, pageNum, limitNum);
  }

  async findOne(id: string): Promise<${upperModuleName} | null> {
    return this.repository.findOne({
      where: { ${config.id}: id } as any,
    });
  }

  async create(dto: ${upperModuleName}Dto): Promise<${upperModuleName}> {
    const entity = this.repository.create(dto as any);
    return this.repository.save(entity);
  }

  async update(id: string, dto: ${upperModuleName}Dto): Promise<void> {
    await this.repository.update(id, dto as any);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
`);

  // controller
  fs.writeFileSync(path.join(dir, 'controllers', `${config.moduleName}.controller.ts`), `import { NextFunction, Request, Response } from "express";
import { ${upperModuleName} } from "../../../database/Entities/${upperModuleName}";
import { CrudController } from "../../../shared/crud/controllers/CrudController";
import { ApiResponse } from "../../../shared/types/ApiResponse";
import { ${upperModuleName}Dto } from "../type/${config.moduleName}.type";
import { ${upperModuleName}Service } from "../services/${config.moduleName}.service";

export class ${upperModuleName}Controller extends CrudController<${upperModuleName}, ${upperModuleName}Dto, ${upperModuleName}Dto> {
  constructor(service: ${upperModuleName}Service) {
    super(service);
  }

  findAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await (this.service as ${upperModuleName}Service).findAll({
        page: Number(req.query.page ?? 1),
        limit: Number(req.query.limit ?? 10),
        search: req.query.search as string | undefined,
      });

      res.json(ApiResponse.success(result));
    } catch (err: unknown) {
      next(err);
    }
  };
}

export const ${camelModuleName}Controller = new ${upperModuleName}Controller(new ${upperModuleName}Service());
`);

  // route
  fs.writeFileSync(path.join(dir, 'routes', `${config.moduleName}.router.ts`), `import { Router } from "express";
import { generateCrudRoutes } from "../../../shared/crud/routes/crudRoutes";
import { ${camelModuleName}Controller } from "../controllers/${config.moduleName}.controller";
import { authMiddleware } from "../../../shared/middlewares/auth.middleware";

const ${camelModuleName}Router = Router();

${camelModuleName}Router.use(authMiddleware);
generateCrudRoutes(${camelModuleName}Router, ${camelModuleName}Controller);

export default ${camelModuleName}Router;
`);
});

console.log('Backend scaffolding complete');
