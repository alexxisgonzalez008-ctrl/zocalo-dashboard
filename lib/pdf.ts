import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { LogEntry } from './types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const generatePDFReport = (logs: LogEntry[], projectTitle: string = "Reporte de Bitácora de Obra") => {
    const doc = new jsPDF();

    // TITLE
    doc.setFontSize(20);
    doc.setTextColor(33, 33, 33);
    doc.text(projectTitle, 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generado: ${format(new Date(), "dd 'de' MMMM, yyyy", { locale: es })}`, 14, 30);
    doc.text(`Total Entradas: ${logs.length}`, 14, 35);

    let startY = 45;

    // Sort logs by date desc
    const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    sortedLogs.forEach((log) => {
        // Log Header
        const dateStr = format(new Date(log.date + 'T12:00:00'), "EEEE dd 'de' MMMM, yyyy", { locale: es });

        // Check if we need a new page
        if (startY > 250) {
            doc.addPage();
            startY = 20;
        }

        doc.setFillColor(240, 240, 240);
        doc.rect(14, startY, 182, 10, 'F');

        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "bold");
        doc.text(dateStr.charAt(0).toUpperCase() + dateStr.slice(1), 18, startY + 7);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(`Clima: ${log.weather === 'sunny' ? 'Soleado' : log.weather === 'cloudy' ? 'Nublado' : log.weather === 'rainy' ? 'Lluvioso' : 'Ventoso'}`, 150, startY + 7);

        startY += 15;

        // Notes
        if (log.notes) {
            doc.setFontSize(10);
            doc.setTextColor(60, 60, 60);
            const splitNotes = doc.splitTextToSize(`Notas: ${log.notes}`, 180);
            doc.text(splitNotes, 14, startY);
            startY += (splitNotes.length * 5) + 5;
        }

        // Expenses Table
        if (log.expenses.length > 0) {
            const tableBody = log.expenses.map(exp => [
                exp.category,
                exp.description,
                `$${exp.amount.toLocaleString()}`
            ]);

            autoTable(doc, {
                startY: startY,
                head: [['Categoría', 'Descripción', 'Monto']],
                body: tableBody,
                theme: 'grid',
                headStyles: { fillColor: [59, 130, 246] }, // Blue header
                styles: { fontSize: 9 },
                margin: { left: 14 }
            });

            // @ts-ignore
            startY = doc.lastAutoTable.finalY + 15;
        } else {
            doc.setFontSize(9);
            doc.setTextColor(150, 150, 150);
            doc.text("(Sin gastos registrados)", 14, startY);
            startY += 15;
        }
    });

    doc.save(`${projectTitle.replace(/\s+/g, '_')}_Bitacora_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};
