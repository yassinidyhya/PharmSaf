/**
 * Mock Prisma Client Implementation for Pharmacie Provinciale Essaouira
 * Implements Prisma interface for full offline/mock-data operation.
 */

import { mockStore } from "./mock-data";

function evaluateCondition(itemValue: any, condition: any): boolean {
  if (condition === undefined) return true;
  if (condition === null) return itemValue === null;

  if (typeof condition === "object" && !(condition instanceof Date)) {
    if ("equals" in condition) {
      if (itemValue !== condition.equals) return false;
    }
    if ("contains" in condition) {
      const searchStr = String(condition.contains).toLowerCase();
      const valStr = String(itemValue || "").toLowerCase();
      if (!valStr.includes(searchStr)) return false;
    }
    if ("in" in condition && Array.isArray(condition.in)) {
      if (!condition.in.includes(itemValue)) return false;
    }
    if ("notIn" in condition && Array.isArray(condition.notIn)) {
      if (condition.notIn.includes(itemValue)) return false;
    }
    if ("gte" in condition) {
      const compVal = condition.gte instanceof Date ? condition.gte.getTime() : condition.gte;
      const itemVal = itemValue instanceof Date ? itemValue.getTime() : itemValue;
      if (itemVal < compVal) return false;
    }
    if ("lte" in condition) {
      const compVal = condition.lte instanceof Date ? condition.lte.getTime() : condition.lte;
      const itemVal = itemValue instanceof Date ? itemValue.getTime() : itemValue;
      if (itemVal > compVal) return false;
    }
    if ("gt" in condition) {
      const compVal = condition.gt instanceof Date ? condition.gt.getTime() : condition.gt;
      const itemVal = itemValue instanceof Date ? itemValue.getTime() : itemValue;
      if (itemVal <= compVal) return false;
    }
    if ("lt" in condition) {
      const compVal = condition.lt instanceof Date ? condition.lt.getTime() : condition.lt;
      const itemVal = itemValue instanceof Date ? itemValue.getTime() : itemValue;
      if (itemVal >= compVal) return false;
    }
    if ("not" in condition) {
      if (itemValue === condition.not) return false;
    }
    return true;
  }

  return itemValue === condition;
}

function matchWhere(item: any, where?: any, modelName?: string): boolean {
  if (!where || Object.keys(where).length === 0) return true;

  for (const key of Object.keys(where)) {
    if (key === "AND") {
      const conditions = Array.isArray(where.AND) ? where.AND : [where.AND];
      if (!conditions.every((cond: any) => matchWhere(item, cond, modelName))) return false;
      continue;
    }

    if (key === "OR") {
      const conditions = Array.isArray(where.OR) ? where.OR : [where.OR];
      if (!conditions.some((cond: any) => matchWhere(item, cond, modelName))) return false;
      continue;
    }

    if (key === "NOT") {
      const conditions = Array.isArray(where.NOT) ? where.NOT : [where.NOT];
      if (conditions.some((cond: any) => matchWhere(item, cond, modelName))) return false;
      continue;
    }

    // Relation filters (e.g. where: { product: { category: "INSULINE" } })
    if (key === "product" && item.productId) {
      const prod = mockStore.product.find((p) => p.id === item.productId);
      if (!prod || !matchWhere(prod, where.product, "product")) return false;
      continue;
    }
    if (key === "hospital" && item.hospitalId) {
      const hosp = mockStore.hospital.find((h) => h.id === item.hospitalId);
      if (!hosp || !matchWhere(hosp, where.hospital, "hospital")) return false;
      continue;
    }
    if (key === "batch" && item.batchId) {
      const bat = mockStore.batch.find((b) => b.id === item.batchId);
      if (!bat || !matchWhere(bat, where.batch, "batch")) return false;
      continue;
    }

    // Direct property filter
    const val = item[key];
    const cond = where[key];

    if (!evaluateCondition(val, cond)) {
      return false;
    }
  }

  return true;
}

function resolveRelations(item: any, modelName: string, include?: any): any {
  if (!include) return { ...item };

  const result = { ...item };

  if (modelName === "product") {
    if (include.batches) {
      const bInclude = typeof include.batches === "object" ? include.batches.include : undefined;
      const batches = mockStore.batch.filter((b) => b.productId === item.id);
      result.batches = batches.map((b) => resolveRelations(b, "batch", bInclude));
    }
    if (include.stockEntries) {
      result.stockEntries = mockStore.stockEntry.filter((se) => se.productId === item.id);
    }
    if (include.stockExits) {
      result.stockExits = mockStore.stockExit.filter((se) => se.productId === item.id);
    }
  } else if (modelName === "batch") {
    if (include.product) {
      const prod = mockStore.product.find((p) => p.id === item.productId);
      result.product = prod ? { ...prod } : null;
    }
    if (include.stockEntries) {
      result.stockEntries = mockStore.stockEntry.filter((se) => se.batchId === item.id);
    }
    if (include.stockExits) {
      result.stockExits = mockStore.stockExit.filter((se) => se.batchId === item.id);
    }
  } else if (modelName === "stockEntry") {
    if (include.product) {
      const prod = mockStore.product.find((p) => p.id === item.productId);
      result.product = prod ? { ...prod } : null;
    }
    if (include.batch) {
      const bat = item.batchId ? mockStore.batch.find((b) => b.id === item.batchId) : null;
      result.batch = bat ? { ...bat } : null;
    }
  } else if (modelName === "stockExit") {
    if (include.product) {
      const prod = mockStore.product.find((p) => p.id === item.productId);
      result.product = prod ? { ...prod } : null;
    }
    if (include.batch) {
      const bat = item.batchId ? mockStore.batch.find((b) => b.id === item.batchId) : null;
      result.batch = bat ? { ...bat } : null;
    }
    if (include.hospital) {
      const hosp = mockStore.hospital.find((h) => h.id === item.hospitalId);
      result.hospital = hosp ? { ...hosp } : null;
    }
    if (include.deliveryNote) {
      const dn = item.deliveryNoteId ? mockStore.deliveryNote.find((d) => d.id === item.deliveryNoteId) : null;
      result.deliveryNote = dn ? { ...dn } : null;
    }
  } else if (modelName === "hospital") {
    if (include.allocations) {
      result.allocations = mockStore.annualAllocation.filter((a) => a.hospitalId === item.id);
    }
    if (include.deliveryNotes) {
      result.deliveryNotes = mockStore.deliveryNote.filter((d) => d.hospitalId === item.id);
    }
  } else if (modelName === "deliveryNote") {
    if (include.hospital) {
      const hosp = mockStore.hospital.find((h) => h.id === item.hospitalId);
      result.hospital = hosp ? { ...hosp } : null;
    }
    if (include.items) {
      const iInclude = typeof include.items === "object" ? include.items.include : undefined;
      const items = mockStore.deliveryNoteItem.filter((dni) => dni.deliveryNoteId === item.id);
      result.items = items.map((dni) => resolveRelations(dni, "deliveryNoteItem", iInclude));
    }
    if (include.stockExits) {
      result.stockExits = mockStore.stockExit.filter((se) => se.deliveryNoteId === item.id);
    }
  } else if (modelName === "deliveryNoteItem") {
    if (include.batch) {
      const bat = mockStore.batch.find((b) => b.id === item.batchId);
      const bInclude = typeof include.batch === "object" ? include.batch.include : undefined;
      result.batch = bat ? resolveRelations(bat, "batch", bInclude) : null;
    }
  } else if (modelName === "birthKit") {
    if (include.components) {
      const cInclude = typeof include.components === "object" ? include.components.include : undefined;
      const comps = mockStore.kitComponent.filter((kc) => kc.kitId === item.id);
      result.components = comps.map((kc) => resolveRelations(kc, "kitComponent", cInclude));
    }
  } else if (modelName === "kitComponent") {
    if (include.product) {
      const prod = mockStore.product.find((p) => p.id === item.productId);
      result.product = prod ? { ...prod } : null;
    }
  }

  if (include._count) {
    const counts: Record<string, number> = {};
    if (modelName === "product") {
      counts.batches = mockStore.batch.filter((b) => b.productId === item.id).length;
      counts.stockEntries = mockStore.stockEntry.filter((se) => se.productId === item.id).length;
      counts.stockExits = mockStore.stockExit.filter((se) => se.productId === item.id).length;
    } else if (modelName === "hospital") {
      counts.stockExits = mockStore.stockExit.filter((se) => se.hospitalId === item.id).length;
      counts.allocations = mockStore.annualAllocation.filter((a) => a.hospitalId === item.id).length;
      counts.deliveryNotes = mockStore.deliveryNote.filter((d) => d.hospitalId === item.id).length;
    } else if (modelName === "deliveryNote") {
      counts.items = mockStore.deliveryNoteItem.filter((dni) => dni.deliveryNoteId === item.id).length;
    } else if (modelName === "birthKit") {
      counts.components = mockStore.kitComponent.filter((kc) => kc.kitId === item.id).length;
    }
    result._count = counts;
  }

  return result;
}

function sortItems(items: any[], orderBy?: any): any[] {
  if (!orderBy) return items;
  const orderList = Array.isArray(orderBy) ? orderBy : [orderBy];

  return [...items].sort((a, b) => {
    for (const order of orderList) {
      const key = Object.keys(order)[0];
      const dir = order[key] === "desc" ? -1 : 1;
      const valA = a[key];
      const valB = b[key];

      if (valA === valB) continue;
      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;

      if (valA instanceof Date && valB instanceof Date) {
        return (valA.getTime() - valB.getTime()) * dir;
      }
      if (valA < valB) return -1 * dir;
      if (valA > valB) return 1 * dir;
    }
    return 0;
  });
}

function createModelHandler(modelName: keyof typeof mockStore) {
  return {
    async findMany(args: any = {}) {
      let items = (mockStore[modelName] as any[]).filter((item) => matchWhere(item, args.where, String(modelName)));
      items = sortItems(items, args.orderBy);

      if (args.skip) {
        items = items.slice(args.skip);
      }
      if (args.take) {
        items = items.slice(0, args.take);
      }

      return items.map((item) => resolveRelations(item, String(modelName), args.include));
    },

    async findFirst(args: any = {}) {
      const items = await this.findMany(args);
      return items[0] || null;
    },

    async findUnique(args: any = {}) {
      return this.findFirst(args);
    },

    async count(args: any = {}) {
      const items = (mockStore[modelName] as any[]).filter((item) => matchWhere(item, args.where, String(modelName)));
      return items.length;
    },

    async create(args: any = {}) {
      const now = new Date();
      const id = `${String(modelName)}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const newItem = {
        id,
        ...args.data,
        createdAt: now,
        updatedAt: now,
      };

      (mockStore[modelName] as any[]).unshift(newItem);
      return resolveRelations(newItem, String(modelName), args.include);
    },

    async createMany(args: any = {}) {
      const dataArray = Array.isArray(args.data) ? args.data : [args.data];
      let count = 0;
      for (const d of dataArray) {
        await this.create({ data: d });
        count++;
      }
      return { count };
    },

    async update(args: any = {}) {
      const items = (mockStore[modelName] as any[]).filter((item) => matchWhere(item, args.where, String(modelName)));
      if (items.length === 0) return null;

      const target = items[0];
      const data = args.data;

      for (const key of Object.keys(data)) {
        const val = data[key];
        if (typeof val === "object" && val !== null && !(val instanceof Date)) {
          if ("increment" in val) {
            target[key] = (target[key] || 0) + val.increment;
          } else if ("decrement" in val) {
            target[key] = (target[key] || 0) - val.decrement;
          } else if ("set" in val) {
            target[key] = val.set;
          }
        } else {
          target[key] = val;
        }
      }
      target.updatedAt = new Date();
      return resolveRelations(target, String(modelName), args.include);
    },

    async updateMany(args: any = {}) {
      const items = (mockStore[modelName] as any[]).filter((item) => matchWhere(item, args.where, String(modelName)));
      let count = 0;
      for (const item of items) {
        await this.update({ where: { id: item.id }, data: args.data });
        count++;
      }
      return { count };
    },

    async delete(args: any = {}) {
      const list = mockStore[modelName] as any[];
      const idx = list.findIndex((item) => matchWhere(item, args.where, String(modelName)));
      if (idx !== -1) {
        const [removed] = list.splice(idx, 1);
        return removed;
      }
      return null;
    },

    async deleteMany(args: any = {}) {
      const list = mockStore[modelName] as any[];
      const initialLen = list.length;
      mockStore[modelName] = list.filter((item) => !matchWhere(item, args.where, String(modelName))) as any;
      return { count: initialLen - (mockStore[modelName] as any[]).length };
    },

    async aggregate(args: any = {}) {
      const items = await this.findMany({ where: args.where });
      const _sum: any = {};
      const _avg: any = {};
      const _min: any = {};
      const _max: any = {};
      const _count = items.length;

      if (args._sum) {
        for (const key of Object.keys(args._sum)) {
          _sum[key] = items.reduce((acc, curr) => acc + (Number(curr[key]) || 0), 0);
        }
      }
      if (args._avg) {
        for (const key of Object.keys(args._avg)) {
          const sum = items.reduce((acc, curr) => acc + (Number(curr[key]) || 0), 0);
          _avg[key] = items.length > 0 ? sum / items.length : 0;
        }
      }

      return { _sum, _avg, _min, _max, _count };
    },

    async groupBy(args: any = {}) {
      const items = await this.findMany({ where: args.where });
      const byFields: string[] = Array.isArray(args.by) ? args.by : [args.by];
      const groups: Map<string, any[]> = new Map();

      for (const item of items) {
        const groupKey = byFields.map((f) => String(item[f])).join("|");
        if (!groups.has(groupKey)) {
          groups.set(groupKey, []);
        }
        groups.get(groupKey)!.push(item);
      }

      const results = [];
      for (const [key, groupItems] of groups.entries()) {
        const groupObj: any = {};
        byFields.forEach((f, idx) => {
          groupObj[f] = groupItems[0][f];
        });

        if (args._sum) {
          groupObj._sum = {};
          for (const k of Object.keys(args._sum)) {
            groupObj._sum[k] = groupItems.reduce((acc, curr) => acc + (Number(curr[k]) || 0), 0);
          }
        }
        if (args._count) {
          if (typeof args._count === "object") {
            groupObj._count = {};
            for (const k of Object.keys(args._count)) {
              groupObj._count[k] = groupItems.length;
            }
            groupObj._count._all = groupItems.length;
          } else {
            groupObj._count = groupItems.length;
          }
        }
        results.push(groupObj);
      }

      return results;
    },
  };
}

export const createMockPrismaClient = () => {
  const models = [
    "product",
    "hospital",
    "batch",
    "stockEntry",
    "stockExit",
    "annualAllocation",
    "deliveryNote",
    "deliveryNoteItem",
    "birthKit",
    "kitComponent",
    "activityLog",
    "user",
  ];

  const client: any = {
    $transaction: async (arg: any) => {
      if (typeof arg === "function") {
        return await arg(client);
      }
      if (Array.isArray(arg)) {
        return Promise.all(arg);
      }
      return null;
    },
    $queryRaw: async (query: any) => {
      return [{ test: 1, time: new Date(), db: "mock_pharmacy_db" }];
    },
    $executeRaw: async () => 1,
    $disconnect: async () => {},
    $connect: async () => {},
  };

  for (const model of models) {
    client[model] = createModelHandler(model as keyof typeof mockStore);
  }

  return client;
};

export const mockPrisma = createMockPrismaClient();
