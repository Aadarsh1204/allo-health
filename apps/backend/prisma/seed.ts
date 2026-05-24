import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {

  const warehouse1 = await prisma.warehouse.upsert({
    where: { id: 'warehouse-1' },
    update: {},
    create: {
      id: 'warehouse-1',
      name: 'Mumbai Central',
      location: 'Mumbai, India',
    },
  });

  const warehouse2 = await prisma.warehouse.upsert({
    where: { id: 'warehouse-2' },
    update: {},
    create: {
      id: 'warehouse-2',
      name: 'Delhi North',
      location: 'Delhi, India',
    },
  });


  const product1 = await prisma.product.upsert({
    where: { sku: 'MED-001' },
    update: {},
    create: {
      id: 'product-1',
      name: 'Paracetamol 500mg',
      sku: 'MED-001',
      price: 50.00,
    },
  });

  const product2 = await prisma.product.upsert({
    where: { sku: 'MED-002' },
    update: {},
    create: {
      id: 'product-2',
      name: 'Amoxicillin 250mg',
      sku: 'MED-002',
      price: 120.00,
    },
  });

  const product3 = await prisma.product.upsert({
    where: { sku: 'MED-003' },
    update: {},
    create: {
      id: 'product-3',
      name: 'Vitamin D3 1000IU',
      sku: 'MED-003',
      price: 299.00,
    },
  });


  const stockEntries = [
    { productId: product1.id, warehouseId: warehouse1.id, total: 100 },
    { productId: product1.id, warehouseId: warehouse2.id, total: 50 },
    { productId: product2.id, warehouseId: warehouse1.id, total: 30 },
    { productId: product2.id, warehouseId: warehouse2.id, total: 75 },
    { productId: product3.id, warehouseId: warehouse1.id, total: 200 },
    { productId: product3.id, warehouseId: warehouse2.id, total: 150 },
  ];

  for (const entry of stockEntries) {
    await prisma.stock.upsert({
      where: {
        productId_warehouseId: {
          productId: entry.productId,
          warehouseId: entry.warehouseId,
        },
      },
      update: {},
      create: {
        productId: entry.productId,
        warehouseId: entry.warehouseId,
        total: entry.total,
        reserved: 0,
      },
    });
  }

  console.log('Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });