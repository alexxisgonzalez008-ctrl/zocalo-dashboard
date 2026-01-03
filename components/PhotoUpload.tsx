import React, { useRef, useState } from 'react';
import { format } from 'date-fns';
import { Camera, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { storage } from '@/lib/firebase';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';

interface PhotoUploadProps {
    photos: string[];
    onPhotosChange: (photos: string[]) => void;
}

export default function PhotoUpload({ photos, onPhotosChange }: PhotoUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isCompressing, setIsCompressing] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const downloadPhoto = (dataUrl: string, filename: string) => {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsCompressing(true);
        const newPhotos: string[] = [];

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (!file.type.startsWith('image/')) continue;

                const compressed = await compressImage(file);

                // Upload to Firebase Storage
                const filename = `photos/${Date.now()}_${i + 1}.jpg`;
                const storageRef = ref(storage, filename);

                // Upload base64 string
                await uploadString(storageRef, compressed, 'data_url');
                const downloadURL = await getDownloadURL(storageRef);

                newPhotos.push(downloadURL);
            }
            onPhotosChange([...photos, ...newPhotos]);
            toast.success(`${newPhotos.length} foto(s) subida(s) a la nube`);
        } catch (error) {
            console.error(error);
            toast.error("Error al procesar imágenes");
        } finally {
            setIsCompressing(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const removePhoto = (index: number) => {
        const photoToDelete = photos[index];
        const newPhotos = [...photos];
        newPhotos.splice(index, 1);
        onPhotosChange(newPhotos);

        toast.success("Foto eliminada", {
            action: {
                label: "Deshacer",
                onClick: () => {
                    const restored = [...newPhotos];
                    restored.splice(index, 0, photoToDelete);
                    onPhotosChange(restored);
                    toast.success("Foto restaurada");
                }
            }
        });
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Evidencia Fotográfica
                </label>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isCompressing}
                    className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors disabled:opacity-50"
                >
                    {isCompressing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                    {isCompressing ? 'Subiendo...' : 'Agregar Foto'}
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                />
            </div>

            {/* Photo Grid */}
            {photos.length === 0 ? (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                    <Camera className="w-8 h-8 text-slate-300 dark:text-slate-700" />
                    <span className="text-xs text-slate-400 dark:text-slate-500">Clic para subir fotos de avance (Max 5)</span>
                </div>
            ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {photos.map((photo, idx) => (
                        <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900">
                            <img
                                src={photo}
                                alt={`Avance ${idx + 1}`}
                                className="w-full h-full object-cover cursor-zoom-in transition-transform group-hover:scale-105"
                                onClick={() => setSelectedPhoto(photo)}
                            />
                            <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        downloadPhoto(photo, `evidencia_obra_${idx + 1}.jpg`);
                                    }}
                                    className="bg-black/50 hover:bg-emerald-500 text-white p-1 rounded-full transition-all"
                                    title="Descargar"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removePhoto(idx);
                                    }}
                                    className="bg-black/50 hover:bg-red-500 text-white p-1 rounded-full transition-all"
                                    title="Eliminar"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Lightbox / Image Preview */}
            {selectedPhoto && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                    onClick={() => setSelectedPhoto(null)}
                >
                    <div className="absolute top-4 right-4 flex gap-3">
                        {/* Download Button */}
                        <a
                            href={selectedPhoto}
                            download={`evidencia_obra_${new Date().getTime()}.jpg`}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                            Descargar Original
                        </a>
                        {/* Close Button */}
                        <button
                            className="text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
                            onClick={() => setSelectedPhoto(null)}
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <img
                        src={selectedPhoto}
                        alt="Vista previa"
                        className="max-w-full max-h-[85vh] object-contain rounded-md shadow-2xl animate-in zoom-in-50 duration-300"
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image
                    />
                </div>
            )}
        </div>
    );
}

// Helper: Resize image to max 800px width/height and 0.7 quality to save space
const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800;
                const MAX_HEIGHT = 600;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                // Compress to JPEG 70%
                resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
};
