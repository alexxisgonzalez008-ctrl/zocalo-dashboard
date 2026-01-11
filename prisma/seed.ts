import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const INITIAL_TASKS = [
    // 1. PRELIMINARES
    { id: 'ISL-PRL-001', category: '1. PRELIMINARES', name: 'Cerco y vallado', start: '2025-12-17', end: '2025-12-18', days: 2, status: 'completed', budget: 1500, cost: 0 },
    { id: 'ISL-PRL-002', category: '1. PRELIMINARES', name: 'Limpieza y desmalezado', start: '2025-12-18', end: '2025-12-19', days: 2, status: 'completed', budget: 800, cost: 0 },
    { id: 'ISL-PRL-003', category: '1. PRELIMINARES', name: 'Obrador y Servicios Provisorios', start: '2025-12-19', end: '2025-12-22', days: 2, status: 'in-progress', budget: 2500, cost: 0 },
    { id: 'ISL-PRL-006', category: '1. PRELIMINARES', name: 'Contenedor y Gestión de Residuos', start: '2025-12-22', end: '2025-12-22', days: 1, status: 'pending', budget: 400, cost: 0 },
    { id: 'ISL-PRL-004', category: '1. PRELIMINARES', name: 'HITO - Replanteo General', start: '2025-12-23', end: '2025-12-23', days: 1, isMilestone: true, status: 'pending', budget: 1000, cost: 0 },
    { id: 'ISL-PRL-005', category: '1. PRELIMINARES', name: 'Movimiento de suelo / Nivelación', start: '2025-12-26', end: '2025-12-30', days: 3, status: 'pending', budget: 4500, cost: 0 },

    // 2. FUNDACIONES
    { id: 'ISL-EXC-007', category: '2. FUNDACIONES', name: 'Replanteo fino de pilotes', start: '2026-01-02', end: '2026-01-02', days: 1, status: 'pending', budget: 500, cost: 0 },
    { id: 'ISL-EXC-008', category: '2. FUNDACIONES', name: 'Perforación de Pilotes', start: '2026-01-05', end: '2026-01-07', days: 3, status: 'pending', budget: 12000, cost: 0 },
    { id: 'ISL-CIM-010', category: '2. FUNDACIONES', name: 'Llenado de Pilotes', start: '2026-01-07', end: '2026-01-08', days: 2, status: 'pending', budget: 9000, cost: 0 },
    { id: 'ISL-EXC-009', category: '2. FUNDACIONES', name: 'Excavación vigas riostra', start: '2026-01-08', end: '2026-01-13', days: 4, status: 'pending', budget: 6000, cost: 0 },
    { id: 'ISL-CIM-011', category: '2. FUNDACIONES', name: 'Descabezado pilotes', start: '2026-01-13', end: '2026-01-15', days: 3, status: 'pending', budget: 3000, cost: 0 },
    { id: 'ISL-CIM-012', category: '2. FUNDACIONES', name: 'Armado vigas fundación', start: '2026-01-16', end: '2026-01-22', days: 5, status: 'pending', budget: 8500, cost: 0 },
    { id: 'ISL-CIM-013', category: '2. FUNDACIONES', name: 'HITO - Llenado Vigas Fundación', start: '2026-01-23', end: '2026-01-23', days: 1, isMilestone: true, status: 'pending', budget: 15000, cost: 0 },

    // 3. EST Y MUROS (PB)
    { id: 'ISL-EST-014', category: '3. EST Y MUROS', name: 'Cajón hidrófugo + 1ra Hilada', start: '2026-01-26', end: '2026-01-28', days: 3, status: 'pending', budget: 4000, cost: 0 },
    { id: 'ISL-EST-015', category: '3. EST Y MUROS', name: 'Elevación Muros Retak PB', start: '2026-01-29', end: '2026-02-13', days: 12, status: 'pending', budget: 25000, cost: 0 },
    { id: 'ISL-EST-016', category: '3. EST Y MUROS', name: 'Columnas y Encadenados PB', start: '2026-02-16', end: '2026-02-20', days: 5, status: 'pending', budget: 12000, cost: 0 },
    { id: 'ISL-EST-017', category: '3. EST Y MUROS', name: 'Encofrado/Armado Losa PB', start: '2026-02-23', end: '2026-03-03', days: 7, status: 'pending', budget: 18000, cost: 0 },
    { id: 'ISL-ELE-029', category: '3. EST Y MUROS', name: 'Cajas y caños en Losa PB', start: '2026-03-02', end: '2026-03-03', days: 2, status: 'pending', budget: 2500, cost: 0 },
    { id: 'ISL-EST-Llenado', category: '3. EST Y MUROS', name: 'ISL-EST-Llenado Losa PB', start: '2026-03-04', end: '2026-03-04', days: 1, isMilestone: true, status: 'pending', budget: 22000, cost: 0 },

    // 4. EST PA + INST PB
    { id: 'ISL-EST-019', category: '4. EST PA + INST PB', name: 'Elevación Muros Retak PA', start: '2026-03-09', end: '2026-03-25', days: 13, status: 'pending', budget: 26000, cost: 0 },
    { id: 'ISL-SAN-023', category: '4. EST PA + INST PB', name: 'Canaleteado PB', start: '2026-03-16', end: '2026-03-20', days: 5, status: 'pending', budget: 3000, cost: 0 },
    { id: 'ISL-EST-021', category: '4. EST PA + INST PB', name: 'Encofrado/Armado Losa Cubierta', start: '2026-03-26', end: '2026-04-06', days: 7, status: 'pending', budget: 19000, cost: 0 },
    { id: 'ISL-EST-20', category: '4. EST PA + INST PB', name: 'ISL-EST-20 Llenado Losa Cubierta', start: '2026-04-08', end: '2026-04-08', days: 1, isMilestone: true, status: 'pending', budget: 23000, cost: 0 },
    { id: 'ISL-SAN-024', category: '4. EST PA + INST PB', name: 'Desagües Cloacales PB', start: '2026-03-23', end: '2026-03-31', days: 7, status: 'pending', budget: 7000, cost: 0 },

    // 5. CUBIERTAS E INST
    { id: 'ISL-SAN-025', category: '5. CUBIERTAS E INST', name: 'Agua Fría/Caliente (Termofusión)', start: '2026-04-13', end: '2026-04-24', days: 10, status: 'pending', budget: 11000, cost: 0 },
    { id: 'ISL-ELE-030', category: '5. CUBIERTAS E INST', name: 'Cañerías y cajas Pared', start: '2026-04-20', end: '2026-04-30', days: 9, status: 'pending', budget: 8500, cost: 0 },
    { id: 'ISL-FIR-035', category: '5. CUBIERTAS E INST', name: 'Impermeabilización (Membrana)', start: '2026-04-27', end: '2026-04-30', days: 4, status: 'pending', budget: 5000, cost: 0 },
    { id: 'ISL-INS-34', category: '5. CUBIERTAS E INST', name: 'ISL-INS-34 Pruebas Hidráulicas', start: '2026-05-04', end: '2026-05-05', days: 2, isMilestone: true, status: 'pending', budget: 1000, cost: 0 },
    { id: 'ISL-FIR-036', category: '5. CUBIERTAS E INST', name: 'Prueba Estanqueidad Techo', start: '2026-05-06', end: '2026-05-08', days: 3, status: 'pending', budget: 1000, cost: 0 },

    // 6. REV Y CONTRAPISOS
    { id: 'ISL-ALU-043', category: '6. REV Y CONTRAPISOS', name: 'Colocación Premarcos', start: '2026-05-11', end: '2026-05-13', days: 3, status: 'pending', budget: 5000, cost: 0 },
    { id: 'ISL-EXT-038', category: '6. REV Y CONTRAPISOS', name: 'Revoque Exterior (Base Coat)', start: '2026-05-14', end: '2026-06-10', days: 20, status: 'pending', budget: 35000, cost: 0 },
    { id: 'ISL-INT-041', category: '6. REV Y CONTRAPISOS', name: 'Yeso/Enduido Interior', start: '2026-05-18', end: '2026-06-12', days: 20, status: 'pending', budget: 28000, cost: 0 },
    { id: 'ISL-FIR-037', category: '6. REV Y CONTRAPISOS', name: 'Contrapisos y Carpetas int.', start: '2026-06-15', end: '2026-06-26', days: 10, status: 'pending', budget: 14000, cost: 0 },
    { id: 'ISL-FIR-033', category: '6. REV Y CONTRAPISOS', name: 'Contrapisos pendiente Azotea', start: '2026-04-13', end: '2026-04-17', days: 5, status: 'pending', budget: 6000, cost: 0 },

    // 7. TERMINACIONES FINAS
    { id: 'ISL-INT-042', category: '7. TERMINACIONES FINAS', name: 'Cielorrasos (Durlock)', start: '2026-06-29', end: '2026-07-10', days: 10, status: 'pending', budget: 16000, cost: 0 },
    { id: 'ISL-ACA-049', category: '7. TERMINACIONES FINAS', name: 'Colocación Pisos', start: '2026-07-13', end: '2026-07-31', days: 15, status: 'pending', budget: 18000, cost: 0 },
    { id: 'ISL-ACA-050', category: '7. TERMINACIONES FINAS', name: 'Revestimiento Baños/Cocina', start: '2026-07-20', end: '2026-07-31', days: 10, status: 'pending', budget: 14000, cost: 0 },
    { id: 'ISL-PIN-052', category: '7. TERMINACIONES FINAS', name: 'Pintura (Mano 1 y 2)', start: '2026-08-03', end: '2026-08-21', days: 15, status: 'pending', budget: 20000, cost: 0 },
    { id: 'ISL-ALU-044', category: '7. TERMINACIONES FINAS', name: 'Colocación Aberturas (Vidrios)', start: '2026-08-24', end: '2026-08-28', days: 5, status: 'pending', budget: 45000, cost: 0 },

    // 8. CIERRE Y ENTREGA
    { id: 'ISL-CAR-048', category: '8. CIERRE Y ENTREGA', name: 'Muebles Cocina y Placares', start: '2026-08-31', end: '2026-09-04', days: 5, status: 'pending', budget: 32000, cost: 0 },
    { id: 'ISL-CIE-054', category: '8. CIERRE Y ENTREGA', name: 'Artefactos Sanitarios/Griferías', start: '2026-09-07', end: '2026-09-11', days: 5, status: 'pending', budget: 12000, cost: 0 },
    { id: 'ISL-ELE-032', category: '8. CIERRE Y ENTREGA', name: 'Teclas, Tomas y Luces', start: '2026-09-14', end: '2026-09-18', days: 5, status: 'pending', budget: 15000, cost: 0 },
    { id: 'ISL-PIN-053', category: '8. CIERRE Y ENTREGA', name: 'Pintura Final (Retoques)', start: '2026-09-21', end: '2026-09-23', days: 3, status: 'pending', budget: 5000, cost: 0 },
    { id: 'ISL-CIE-056', category: '8. CIERRE Y ENTREGA', name: 'Limpieza Fina', start: '2026-09-24', end: '2026-09-25', days: 2, status: 'pending', budget: 3000, cost: 0 },
    { id: 'ISL-ENTREGA', category: '8. CIERRE Y ENTREGA', name: '🎉 ENTREGA DE LLAVES', start: '2026-09-28', end: '2026-09-28', days: 1, isMilestone: true, status: 'pending', budget: 0, cost: 0 }
];

async function main() {
    console.log("Starting seed...")

    // El ID del proyecto Islara directo de la aplicación
    const projectId = "project-1767576528920"
    const userId = "user_dev_alex"

    console.log(`Seeding tasks for project: ${projectId}`)
    for (const task of INITIAL_TASKS) {
        // Create a unique ID per project
        const uniqueId = `${projectId}-${task.id}`
        await prisma.task.upsert({
            where: { id: uniqueId },
            update: {
                projectId,
                userId,
                category: task.category,
                name: task.name,
                start: new Date(task.start),
                end: new Date(task.end),
                days: task.days,
                status: task.status,
                budget: task.budget,
                cost: task.cost,
                isMilestone: task.isMilestone || false
            },
            create: {
                id: uniqueId,
                projectId,
                userId,
                category: task.category,
                name: task.name,
                start: new Date(task.start),
                end: new Date(task.end),
                days: task.days,
                status: task.status,
                budget: task.budget,
                cost: task.cost,
                isMilestone: task.isMilestone || false
            }
        })
    }

    console.log("Seed finished successfully.")
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
