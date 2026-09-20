#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Delete all data
  await prisma.outboxEvent.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.task.deleteMany();
  await prisma.documentExtraction.deleteMany();
  await prisma.document.deleteMany();
  await prisma.importRow.deleteMany();
  await prisma.import.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.complianceSignal.deleteMany();
  await prisma.charge.deleteMany();
  await prisma.containerEvent.deleteMany();
  await prisma.container.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.client.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.carrier.deleteMany();
  await prisma.customs.deleteMany();
  await prisma.cFS.deleteMany();
  await prisma.port.deleteMany();
  await prisma.tariff.deleteMany();

  console.log('Creating organizations...');
  const org = await prisma.organization.create({
    data: {
      name: 'Demo CHA Logistics',
      type: 'CHA',
    },
  });

  console.log('Creating users...');
  const admin = await prisma.user.create({
    data: {
      organizationId: org.id,
      email: 'admin@demurrageos.local',
      name: 'Admin User',
      role: 'ADMIN',
    },
  });

  const operations = await prisma.user.create({
    data: {
      organizationId: org.id,
      email: 'ops@demurrageos.local',
      name: 'Operations User',
      role: 'OPERATIONS',
    },
  });

  const finance = await prisma.user.create({
    data: {
      organizationId: org.id,
      email: 'finance@demurrageos.local',
      name: 'Finance User',
      role: 'FINANCE',
    },
  });

  console.log('Creating clients...');
  const clients = await Promise.all([
    prisma.client.create({
      data: {
        organizationId: org.id,
        name: 'Acme Imports Ltd',
        iecCode: 'IEC001234567',
        gstin: '18AABCT1234H1Z0',
        contactName: 'John Smith',
        contactEmail: 'john@acmeimports.com',
        aeoStatus: 'CERTIFIED',
        acpStatus: 'CERTIFIED',
      },
    }),
    prisma.client.create({
      data: {
        organizationId: org.id,
        name: 'Global Trade Corp',
        iecCode: 'IEC007654321',
        gstin: '18AABCU1234H1Z0',
        contactName: 'Jane Doe',
        contactEmail: 'jane@globaltrade.com',
        aeoStatus: 'CERTIFIED',
      },
    }),
    prisma.client.create({
      data: {
        organizationId: org.id,
        name: 'TechWorld Distributors',
        iecCode: 'IEC009876543',
        contactName: 'Bob Wilson',
        contactEmail: 'bob@techworld.com',
      },
    }),
  ]);

  console.log('Creating ports and CFS...');
  const portKochi = await prisma.port.create({
    data: {
      code: 'INCKC',
      name: 'Port of Kochi',
      country: 'India',
    },
  });

  const portChennai = await prisma.port.create({
    data: {
      code: 'INMAA2',
      name: 'Port of Chennai',
      country: 'India',
    },
  });

  const cfsKochi = await prisma.cFS.create({
    data: {
      portId: portKochi.id,
      name: 'Kochi Container Freight Station',
      address: 'Cochin Port, Kochi',
      contactPhone: '+91-484-2381234',
    },
  });

  const cfsChennai = await prisma.cFS.create({
    data: {
      portId: portChennai.id,
      name: 'Chennai Container Freight Station',
      address: 'Chennai Port, Chennai',
      contactPhone: '+91-44-2516789',
    },
  });

  console.log('Creating carriers...');
  const carriers = await Promise.all([
    prisma.carrier.create({
      data: {
        code: 'MSC',
        name: 'Mediterranean Shipping Company',
      },
    }),
    prisma.carrier.create({
      data: {
        code: 'MAEU',
        name: 'Maersk Line',
      },
    }),
    prisma.carrier.create({
      data: {
        code: 'CMA',
        name: 'CMA CGM',
      },
    }),
  ]);

  console.log('Creating tariffs...');
  const now = new Date();
  const tariffCurrent = await prisma.tariff.create({
    data: {
      code: 'TARIFF_2025_Q1',
      name: 'Standard Tariff Q1 2025',
      version: 1,
      effectiveFrom: new Date('2025-01-01'),
      effectiveTo: new Date('2025-03-31'),
      demurrageRate: 500,
      detentionRate: 300,
      storageRate: 200,
      groundRentRate: 1000,
      freeDays: 5,
      currency: 'INR',
    },
  });

  console.log('Creating shipments...');
  const shipments = [];
  for (let i = 0; i < 20; i++) {
    const shipment = await prisma.shipment.create({
      data: {
        clientId: clients[i % clients.length].id,
        referenceNo: `SHP-2025-${String(i + 1).padStart(5, '0')}`,
        poNo: `PO-${String(i + 1).padStart(4, '0')}`,
        invoiceNo: `INV-${String(i + 1).padStart(4, '0')}`,
      },
    });
    shipments.push(shipment);
  }

  console.log('Creating containers and events...');
  for (let i = 0; i < 100; i++) {
    const shipment = shipments[i % shipments.length];
    const carrier = carriers[i % carriers.length];
    const cfs = i % 2 === 0 ? cfsKochi : cfsChennai;
    const deliveryMode = i % 10 === 0 ? 'DPD_DIRECT' : i % 10 === 1 ? 'DPD_CFS' : 'CFS';

    const dischargeDate = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);

    const container = await prisma.container.create({
      data: {
        clientId: shipment.clientId,
        shipmentId: shipment.id,
        containerNo: `CONT${String(i + 1).padStart(8, '0')}`,
        containerType: i % 3 === 0 ? '40FT' : i % 3 === 1 ? '40HC' : '20FT',
        deliveryMode,
        carrierId: carrier.id,
        cfsId: deliveryMode !== 'DPD_DIRECT' ? cfs.id : null,
        dischargeDate,
        dischargePort: cfs.port.code,
        hsCode: `${8400 + (i % 100).toString().padStart(3, '0')}`,
        goodsDescription: ['Electronics', 'Textiles', 'Machinery', 'Chemicals'][i % 4],
        quantity: Math.floor(Math.random() * 100) + 10,
        uom: 'NOS',
        declaredValue: Math.floor(Math.random() * 100000) + 10000,
        currency: 'USD',
      },
    });

    // Create events based on delivery mode
    if (deliveryMode === 'DPD_DIRECT') {
      await prisma.containerEvent.create({
        data: {
          containerId: container.id,
          eventType: 'DISCHARGE',
          source: 'SYSTEM',
          eventTimestamp: dischargeDate,
        },
      });
    } else if (deliveryMode === 'DPD_CFS') {
      // Fallback scenario
      const fallbackDay = Math.floor(Math.random() * 5) + 1;
      const fallbackDate = new Date(dischargeDate.getTime() + fallbackDay * 24 * 60 * 60 * 1000);

      await prisma.containerEvent.create({
        data: {
          containerId: container.id,
          eventType: 'DISCHARGE',
          source: 'SYSTEM',
          eventTimestamp: dischargeDate,
        },
      });

      await prisma.containerEvent.create({
        data: {
          containerId: container.id,
          eventType: 'DPD_TO_CFS_FALLBACK',
          source: 'SYSTEM',
          eventTimestamp: fallbackDate,
        },
      });

      // CFS gate-in after fallback
      const cfsGateInDate = new Date(fallbackDate.getTime() + Math.random() * 5 * 24 * 60 * 60 * 1000);
      await prisma.containerEvent.create({
        data: {
          containerId: container.id,
          eventType: 'CFS_GATE_IN',
          source: 'SYSTEM',
          eventTimestamp: cfsGateInDate,
        },
      });
    } else {
      // Direct CFS
      await prisma.containerEvent.create({
        data: {
          containerId: container.id,
          eventType: 'CFS_GATE_IN',
          source: 'SYSTEM',
          eventTimestamp: new Date(dischargeDate.getTime() + 2 * 24 * 60 * 60 * 1000),
        },
      });
    }

    // Create some charges
    if (i % 2 === 0) {
      await prisma.charge.create({
        data: {
          containerId: container.id,
          tariffId: tariffCurrent.id,
          chargeType: 'DEMURRAGE',
          amount: Math.floor(Math.random() * 10000) + 1000,
          currency: 'INR',
          freeDaysRemaining: Math.max(0, Math.floor(Math.random() * 5) - 3),
          daysOverdue: Math.max(0, Math.floor(Math.random() * 20)),
          calculationVersion: '1.0.0',
          tariffVersion: tariffCurrent.version,
          appliedTariffEffectiveFrom: tariffCurrent.effectiveFrom,
        },
      });
    }

    // Create alerts for some containers
    if (i % 4 === 0) {
      const alertTypes = ['DEADLINE_URGENCY', 'FINANCIAL_EXPOSURE', 'OPERATIONAL_UNCERTAINTY'];
      await prisma.alert.create({
        data: {
          containerId: container.id,
          alertType: alertTypes[i % alertTypes.length],
          severity: ['LOW', 'MEDIUM', 'HIGH'][i % 3],
          message: `Alert for container ${container.containerNo}`,
        },
      });
    }

    // Create compliance signals
    if (i % 3 === 0) {
      const signalTypes = ['DOC_COMPLETENESS', 'HS_CODE_NOVELTY', 'VALUATION_CONSISTENCY'];
      await prisma.complianceSignal.create({
        data: {
          containerId: container.id,
          signalType: signalTypes[i % signalTypes.length],
          score: Math.random() * 100,
          source: i % 2 === 0 ? 'MANUAL' : 'DERIVED',
        },
      });
    }

    // Create tasks for some containers
    if (i % 10 === 0) {
      await prisma.task.create({
        data: {
          containerId: container.id,
          assigneeType: 'INTERNAL_USER',
          assigneeId: operations.id,
          title: `Arrange pickup for ${container.containerNo}`,
          description: 'Coordinate with transport provider',
          status: 'PENDING',
          priority: 'HIGH',
          dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        },
      });
    }

    // Create external tasks for some containers
    if (i % 15 === 0) {
      const token = Math.random().toString(36).substring(2, 15);
      const tokenHash = Buffer.from(token).toString('hex');

      await prisma.task.create({
        data: {
          containerId: container.id,
          assigneeType: 'EXTERNAL_CONTACT',
          externalName: 'Transport Provider',
          externalEmail: `trucker${i}@example.com`,
          externalPhone: '+91-9876543210',
          title: `Arrange delivery for ${container.containerNo}`,
          status: 'PENDING',
          priority: 'MEDIUM',
          dueDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
          confirmationTokenHash: tokenHash,
          confirmationTokenExpiresAt: new Date(now.getTime() + 72 * 60 * 60 * 1000),
        },
      });
    }
  }

  console.log('Creating audit log entries...');
  await prisma.auditLog.create({
    data: {
      organizationId: org.id,
      userId: admin.id,
      action: 'SEED_DATA',
      entityType: 'Organization',
      entityId: org.id,
      afterState: JSON.stringify({ seeded: true }),
    },
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
