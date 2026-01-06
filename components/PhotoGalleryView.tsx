import React, { useState, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { ImageIcon, X, Download, Calendar } from 'lucide-react';
import { LogEntry } from '@/lib/types';
import { Card, CardContent } from "@/components/ui/card";

interface PhotoGalleryViewProps {
    logs: LogEntry[];
}

interface AggregatedPhoto {
    url: string;
    date: string;
    logId: string;
}

export default function PhotoGalleryView({ logs }: PhotoGalleryViewProps) {
    const [selectedPhoto, setSelectedPhoto] = useState<AggregatedPhoto | null>(null);

    // Aggregate all photos from logs and sort by date descending
    const allPhotos = useMemo(() => {
        const photos: AggregatedPhoto[] = [];
        logs.forEach(log => {
            if (log.photos && log.photos.length > 0) {
                log.photos.forEach(url => {
                    photos.push({
                        url,
                        date: log.date,
                        logId: log.id
                    });
                });
            }
        });
        return photos.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [logs]);

    if (allPhotos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
                <ImageIcon className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-4" />
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">No hay fotos registradas</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
                    Las fotos que subas en el registro diario aparecerán aquí automáticamente.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {allPhotos.map((photo, index) => (
                    <Card
                        key={`${photo.logId}-${index}`}
                        className="group overflow-hidden border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all cursor-pointer bg-white dark:bg-slate-900"
                        onClick={() => setSelectedPhoto(photo)}
                    >
                        <div className="relative aspect-square overflow-hidden">
                            <img
                                src={photo.url}
                                alt={`Foto del ${photo.date}`}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-white text-xs font-bold bg-emerald-600 px-2 py-1 rounded">Ver más</span>
                            </div>
                        </div>
                        <CardContent className="p-2 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">
                                <Calendar className="w-3 h-3 text-emerald-500" />
                                {format(parseISO(photo.date), "dd MMM yyyy", { locale: es })}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Lightbox / Visor de Imagen */}
            {selectedPhoto && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-200"
                    onClick={() => setSelectedPhoto(null)}
                >
                    <div className="absolute top-4 right-4 flex gap-3">
                        <div className="hidden sm:flex flex-col items-end justify-center mr-4 text-white">
                            <p className="text-sm font-black tracking-tight">Registro de Obra</p>
                            <p className="text-xs text-slate-400 capitalize">{format(parseISO(selectedPhoto.date), "EEEE d 'de' MMMM", { locale: es })}</p>
                        </div>
                        <a
                            href={selectedPhoto.url}
                            download={`evidencia_obra_${selectedPhoto.date}.jpg`}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Descargar
                        </a>
                        <button
                            className="text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
                            onClick={() => setSelectedPhoto(null)}
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <img
                        src={selectedPhoto.url}
                        alt="Vista previa"
                        className="max-w-full max-h-[85vh] object-contain rounded-md shadow-2xl animate-in zoom-in-50 duration-300"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
}
