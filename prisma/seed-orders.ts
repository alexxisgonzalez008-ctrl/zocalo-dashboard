import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const projectId = "islara-default" // Using default since we don't have multiple projects yet in the DB pull or we'll find it
    const userId = "user_dev_alex"

    const order = await prisma.materialOrder.create({
        data: {
            projectId,
            userId,
            vendor: "Corralón General",
            notes: "Pedido inicial de materiales para obra",
            status: "pending",
            items: {
                create: [
                    { description: "Bolsones de piedra", requestedQuantity: 3, unit: "bolsones" },
                    { description: "Bolsones Arena", requestedQuantity: 3, unit: "bolsones" },
                    { description: "Cemento 30 bolsas 25kg", requestedQuantity: 30, unit: "bolsas" },
                    { description: "Tarro de 200 de Ceresita", requestedQuantity: 1, unit: "unidades" },
                    { description: "Pallet de Ladrillo comun", requestedQuantity: 2, unit: "pallets" },
                    { description: "Hierro del 10", requestedQuantity: 15, unit: "unidades" },
                    { description: "Hierro del 8", requestedQuantity: 15, unit: "unidades" },
                    { description: "Hierro del 6", requestedQuantity: 30, unit: "unidades" },
                    { description: "Malla sima diámetro 6 de 15 x 15", requestedQuantity: 7, unit: "unidades" },
                    { description: "Alambre de atar", requestedQuantity: 5, unit: "kg" },
                    { description: "Paquete Clavo de 2 pulgadas", requestedQuantity: 2, unit: "paquetes" },
                    { description: "Paquete Clavo de 2,5", requestedQuantity: 2, unit: "paquetes" },
                    { description: "Fenolicos 18", requestedQuantity: 6, unit: "unidades" },
                    { description: "Tablas 5cm", requestedQuantity: 10, unit: "unidades" },
                ]
            }
        }
    })

    console.log(`Pedido creado exitosamente: ${order.id}`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
